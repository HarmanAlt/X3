from flask import Blueprint, request, jsonify, current_app
from flask_jwt_extended import create_access_token, jwt_required, get_jwt_identity, get_jwt
from datetime import datetime, timedelta
import base64
import os
from werkzeug.utils import secure_filename

from models.user import User
from models import db
from utils.validators import validate_email, validate_role
from utils.helpers import extract_name_from_email
from services.face_recognition_service_simple import FaceRecognitionService

auth_bp = Blueprint('auth', __name__)

@auth_bp.route('/login', methods=['POST'])
def login():
    """Login endpoint - creates user if doesn't exist, returns JWT token"""
    try:
        data = request.get_json()
        
        if not data:
            return jsonify({
                'success': False,
                'error': 'Request body is required',
                'code': 'MISSING_DATA'
            }), 400
        
        email = data.get('email', '').strip().lower()
        role = data.get('role', '').strip().lower()
        
        # Validate input
        if not email:
            return jsonify({
                'success': False,
                'error': 'Email is required',
                'code': 'MISSING_EMAIL'
            }), 400
        
        if not validate_email(email):
            return jsonify({
                'success': False,
                'error': 'Invalid email format',
                'code': 'INVALID_EMAIL'
            }), 400
        
        if not role:
            return jsonify({
                'success': False,
                'error': 'Role is required',
                'code': 'MISSING_ROLE'
            }), 400
        
        if not validate_role(role):
            return jsonify({
                'success': False,
                'error': 'Invalid role. Must be student, faculty, or admin',
                'code': 'INVALID_ROLE'
            }), 400
        
        # Check if user exists, create if not
        user = User.query.filter_by(email=email).first()
        
        if not user:
            # Create new user
            name = extract_name_from_email(email)
            user = User(email=email, name=name, role=role)
            db.session.add(user)
            db.session.commit()
            
            current_app.logger.info(f'Created new user: {email} ({role})')
        else:
            # Update role if different (for demo purposes)
            if user.role != role:
                user.role = role
                db.session.commit()
                current_app.logger.info(f'Updated user role: {email} -> {role}')
        
        # Create JWT token
        additional_claims = {
            'role': user.role,
            'name': user.name
        }
        
        access_token = create_access_token(
            identity=user.id,
            additional_claims=additional_claims
        )
        
        return jsonify({
            'success': True,
            'data': {
                'user': user.to_dict(),
                'access_token': access_token,
                'token_type': 'Bearer',
                'expires_in': current_app.config['JWT_ACCESS_TOKEN_EXPIRES'].total_seconds()
            },
            'message': 'Login successful',
            'timestamp': datetime.utcnow().isoformat()
        })
        
    except Exception as e:
        current_app.logger.error(f'Login error: {str(e)}')
        return jsonify({
            'success': False,
            'error': 'Internal server error',
            'code': 'LOGIN_ERROR'
        }), 500

@auth_bp.route('/verify', methods=['GET'])
@jwt_required()
def verify_token():
    """Verify JWT token and return current user data"""
    try:
        user_id = get_jwt_identity()
        user = User.query.get(user_id)
        
        if not user:
            return jsonify({
                'success': False,
                'error': 'User not found',
                'code': 'USER_NOT_FOUND'
            }), 404
        
        if not user.is_active:
            return jsonify({
                'success': False,
                'error': 'User account is inactive',
                'code': 'USER_INACTIVE'
            }), 403
        
        return jsonify({
            'success': True,
            'data': {
                'user': user.to_dict()
            },
            'message': 'Token is valid',
            'timestamp': datetime.utcnow().isoformat()
        })
        
    except Exception as e:
        current_app.logger.error(f'Token verification error: {str(e)}')
        return jsonify({
            'success': False,
            'error': 'Token verification failed',
            'code': 'VERIFICATION_ERROR'
        }), 500

@auth_bp.route('/logout', methods=['POST'])
@jwt_required()
def logout():
    """Logout endpoint - invalidate JWT token"""
    try:
        # In a production app, you would add the token to a blacklist
        # For now, we'll just return success
        return jsonify({
            'success': True,
            'message': 'Logout successful',
            'timestamp': datetime.utcnow().isoformat()
        })
        
    except Exception as e:
        current_app.logger.error(f'Logout error: {str(e)}')
        return jsonify({
            'success': False,
            'error': 'Logout failed',
            'code': 'LOGOUT_ERROR'
        }), 500

@auth_bp.route('/enroll-face', methods=['POST'])
@jwt_required()
def enroll_face():
    """Enroll user's face for recognition"""
    try:
        user_id = get_jwt_identity()
        user = User.query.get(user_id)
        
        if not user:
            return jsonify({
                'success': False,
                'error': 'User not found',
                'code': 'USER_NOT_FOUND'
            }), 404
        
        data = request.get_json()
        
        if not data or 'image' not in data:
            return jsonify({
                'success': False,
                'error': 'Image data is required',
                'code': 'MISSING_IMAGE'
            }), 400
        
        image_data = data['image']
        
        # Validate image data (should be base64)
        if not image_data.startswith('data:image/'):
            return jsonify({
                'success': False,
                'error': 'Invalid image format',
                'code': 'INVALID_IMAGE_FORMAT'
            }), 400
        
        try:
            # Process face encoding
            face_service = FaceRecognitionService()
            encoding = face_service.encode_face_from_base64(image_data)
            
            if encoding is None:
                return jsonify({
                    'success': False,
                    'error': 'No face detected in image',
                    'code': 'NO_FACE_DETECTED'
                }), 400
            
            # Store face encoding
            user.add_face_encoding(encoding.tolist())
            db.session.commit()
            
            return jsonify({
                'success': True,
                'data': {
                    'face_enrolled': True,
                    'encoding_count': len(user.get_face_encodings())
                },
                'message': 'Face enrolled successfully',
                'timestamp': datetime.utcnow().isoformat()
            })
            
        except Exception as face_error:
            current_app.logger.error(f'Face encoding error: {str(face_error)}')
            return jsonify({
                'success': False,
                'error': 'Face encoding failed',
                'code': 'FACE_ENCODING_ERROR'
            }), 500
        
    except Exception as e:
        current_app.logger.error(f'Face enrollment error: {str(e)}')
        return jsonify({
            'success': False,
            'error': 'Face enrollment failed',
            'code': 'ENROLLMENT_ERROR'
        }), 500

@auth_bp.route('/face-status', methods=['GET'])
@jwt_required()
def get_face_status():
    """Get user's face enrollment status"""
    try:
        user_id = get_jwt_identity()
        user = User.query.get(user_id)
        
        if not user:
            return jsonify({
                'success': False,
                'error': 'User not found',
                'code': 'USER_NOT_FOUND'
            }), 404
        
        encodings = user.get_face_encodings()
        
        return jsonify({
            'success': True,
            'data': {
                'face_enrolled': len(encodings) > 0,
                'encoding_count': len(encodings),
                'can_use_face_recognition': len(encodings) > 0
            },
            'message': 'Face status retrieved',
            'timestamp': datetime.utcnow().isoformat()
        })
        
    except Exception as e:
        current_app.logger.error(f'Face status error: {str(e)}')
        return jsonify({
            'success': False,
            'error': 'Failed to get face status',
            'code': 'FACE_STATUS_ERROR'
        }), 500

@auth_bp.route('/profile', methods=['GET'])
@jwt_required()
def get_profile():
    """Get user profile with statistics"""
    try:
        user_id = get_jwt_identity()
        user = User.query.get(user_id)
        
        if not user:
            return jsonify({
                'success': False,
                'error': 'User not found',
                'code': 'USER_NOT_FOUND'
            }), 404
        
        return jsonify({
            'success': True,
            'data': {
                'user': user.to_dict_with_stats()
            },
            'message': 'Profile retrieved successfully',
            'timestamp': datetime.utcnow().isoformat()
        })
        
    except Exception as e:
        current_app.logger.error(f'Profile error: {str(e)}')
        return jsonify({
            'success': False,
            'error': 'Failed to get profile',
            'code': 'PROFILE_ERROR'
        }), 500

@auth_bp.route('/profile', methods=['PUT'])
@jwt_required()
def update_profile():
    """Update user profile"""
    try:
        user_id = get_jwt_identity()
        user = User.query.get(user_id)
        
        if not user:
            return jsonify({
                'success': False,
                'error': 'User not found',
                'code': 'USER_NOT_FOUND'
            }), 404
        
        data = request.get_json()
        
        if not data:
            return jsonify({
                'success': False,
                'error': 'Request body is required',
                'code': 'MISSING_DATA'
            }), 400
        
        # Update allowed fields
        if 'name' in data and data['name']:
            user.name = data['name'].strip()
        
        # Note: Email and role changes would require additional validation
        # For now, we'll only allow name updates
        
        user.updated_at = datetime.utcnow()
        db.session.commit()
        
        return jsonify({
            'success': True,
            'data': {
                'user': user.to_dict()
            },
            'message': 'Profile updated successfully',
            'timestamp': datetime.utcnow().isoformat()
        })
        
    except Exception as e:
        current_app.logger.error(f'Profile update error: {str(e)}')
        return jsonify({
            'success': False,
            'error': 'Failed to update profile',
            'code': 'PROFILE_UPDATE_ERROR'
        }), 500


