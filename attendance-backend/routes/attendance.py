from flask import Blueprint, request, jsonify, current_app
from flask_jwt_extended import jwt_required, get_jwt_identity
from datetime import datetime, timedelta
import base64
import os
import uuid

from models.user import User
from models.attendance import Attendance
from models.class_model import ClassSession
from models import db
from utils.validators import validate_attendance_method
from services.face_recognition_service_simple import FaceRecognitionService
from services.qr_service import QRService

attendance_bp = Blueprint('attendance', __name__)

@attendance_bp.route('/mark-face', methods=['POST'])
@jwt_required()
def mark_attendance_face():
    """Mark attendance using face recognition"""
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
        
        class_id = data.get('class_id')
        image_data = data.get('image')
        
        if not class_id:
            return jsonify({
                'success': False,
                'error': 'Class ID is required',
                'code': 'MISSING_CLASS_ID'
            }), 400
        
        if not image_data:
            return jsonify({
                'success': False,
                'error': 'Image data is required',
                'code': 'MISSING_IMAGE'
            }), 400
        
        # Get class session
        class_session = ClassSession.query.get(class_id)
        if not class_session:
            return jsonify({
                'success': False,
                'error': 'Class session not found',
                'code': 'CLASS_NOT_FOUND'
            }), 404
        
        # Check if class is active
        if not class_session.is_class_active():
            return jsonify({
                'success': False,
                'error': 'Class session is not active',
                'code': 'CLASS_NOT_ACTIVE'
            }), 400
        
        # Check if face recognition is enabled
        if not class_session.face_recognition_enabled:
            return jsonify({
                'success': False,
                'error': 'Face recognition is not enabled for this class',
                'code': 'FACE_RECOGNITION_DISABLED'
            }), 400
        
        # Check if user has enrolled face
        if not user.get_face_encodings():
            return jsonify({
                'success': False,
                'error': 'Face not enrolled. Please enroll your face first.',
                'code': 'FACE_NOT_ENROLLED'
            }), 400
        
        # Process face recognition
        try:
            face_service = FaceRecognitionService()
            
            # Encode the incoming face
            unknown_encoding = face_service.encode_face_from_base64(image_data)
            
            if unknown_encoding is None:
                return jsonify({
                    'success': False,
                    'error': 'No face detected in image',
                    'code': 'NO_FACE_DETECTED'
                }), 400
            
            # Compare with stored encodings
            known_encodings = [face_service.numpy_array_from_list(enc) for enc in user.get_face_encodings()]
            matches = face_service.compare_faces(known_encodings, unknown_encoding)
            
            if not matches:
                return jsonify({
                    'success': False,
                    'error': 'Face not recognized',
                    'code': 'FACE_NOT_RECOGNIZED'
                }), 400
            
            # Calculate confidence score
            face_distances = face_service.face_distance(known_encodings, unknown_encoding)
            confidence_score = 1 - min(face_distances)
            
            # Check if confidence meets threshold
            if confidence_score < current_app.config.get('FACE_RECOGNITION_TOLERANCE', 0.6):
                return jsonify({
                    'success': False,
                    'error': 'Face recognition confidence too low',
                    'code': 'LOW_CONFIDENCE',
                    'data': {
                        'confidence_score': confidence_score,
                        'threshold': current_app.config.get('FACE_RECOGNITION_TOLERANCE', 0.6)
                    }
                }), 400
            
            # Check if user already marked attendance for this class
            existing_attendance = Attendance.query.filter_by(
                user_id=user_id,
                class_id=class_id
            ).first()
            
            if existing_attendance:
                return jsonify({
                    'success': False,
                    'error': 'Attendance already marked for this class',
                    'code': 'ATTENDANCE_ALREADY_MARKED',
                    'data': {
                        'existing_attendance': existing_attendance.to_dict()
                    }
                }), 400
            
            # Save attendance photo
            photo_filename = f"attendance_{user_id}_{class_id}_{datetime.utcnow().strftime('%Y%m%d_%H%M%S')}.jpg"
            photo_path = os.path.join(current_app.config['UPLOAD_FOLDER'], photo_filename)
            
            # Save base64 image to file
            try:
                # Remove data URL prefix
                if image_data.startswith('data:image/'):
                    image_data = image_data.split(',')[1]
                
                image_bytes = base64.b64decode(image_data)
                with open(photo_path, 'wb') as f:
                    f.write(image_bytes)
            except Exception as photo_error:
                current_app.logger.error(f'Photo save error: {str(photo_error)}')
                photo_path = None
            
            # Create attendance record
            attendance = Attendance(
                user_id=user_id,
                class_id=class_id,
                method='face_recognition',
                confidence_score=confidence_score,
                photo_path=photo_path,
                ip_address=request.remote_addr,
                device_info=request.headers.get('User-Agent')
            )
            
            db.session.add(attendance)
            db.session.commit()
            
            return jsonify({
                'success': True,
                'data': {
                    'attendance': attendance.to_dict_with_class(),
                    'confidence_score': confidence_score,
                    'photo_saved': photo_path is not None
                },
                'message': 'Attendance marked successfully using face recognition',
                'timestamp': datetime.utcnow().isoformat()
            })
            
        except Exception as face_error:
            current_app.logger.error(f'Face recognition error: {str(face_error)}')
            return jsonify({
                'success': False,
                'error': 'Face recognition processing failed',
                'code': 'FACE_RECOGNITION_ERROR'
            }), 500
        
    except Exception as e:
        current_app.logger.error(f'Face attendance error: {str(e)}')
        return jsonify({
            'success': False,
            'error': 'Failed to mark attendance',
            'code': 'ATTENDANCE_ERROR'
        }), 500

@attendance_bp.route('/mark-qr', methods=['POST'])
@jwt_required()
def mark_attendance_qr():
    """Mark attendance using QR code"""
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
        
        qr_token = data.get('qr_token')
        class_id = data.get('class_id')
        
        if not qr_token:
            return jsonify({
                'success': False,
                'error': 'QR token is required',
                'code': 'MISSING_QR_TOKEN'
            }), 400
        
        if not class_id:
            return jsonify({
                'success': False,
                'error': 'Class ID is required',
                'code': 'MISSING_CLASS_ID'
            }), 400
        
        # Get class session
        class_session = ClassSession.query.get(class_id)
        if not class_session:
            return jsonify({
                'success': False,
                'error': 'Class session not found',
                'code': 'CLASS_NOT_FOUND'
            }), 404
        
        # Check if class is active
        if not class_session.is_class_active():
            return jsonify({
                'success': False,
                'error': 'Class session is not active',
                'code': 'CLASS_NOT_ACTIVE'
            }), 400
        
        # Check if QR code is enabled
        if not class_session.qr_code_enabled:
            return jsonify({
                'success': False,
                'error': 'QR code attendance is not enabled for this class',
                'code': 'QR_CODE_DISABLED'
            }), 400
        
        # Validate QR code
        if not class_session.validate_qr_code(qr_token):
            return jsonify({
                'success': False,
                'error': 'Invalid or expired QR code',
                'code': 'INVALID_QR_CODE'
            }), 400
        
        # Check if user already marked attendance for this class
        existing_attendance = Attendance.query.filter_by(
            user_id=user_id,
            class_id=class_id
        ).first()
        
        if existing_attendance:
            return jsonify({
                'success': False,
                'error': 'Attendance already marked for this class',
                'code': 'ATTENDANCE_ALREADY_MARKED',
                'data': {
                    'existing_attendance': existing_attendance.to_dict()
                }
            }), 400
        
        # Create attendance record
        attendance = Attendance(
            user_id=user_id,
            class_id=class_id,
            method='qr_code',
            confidence_score=1.0,  # QR code has 100% confidence
            ip_address=request.remote_addr,
            device_info=request.headers.get('User-Agent')
        )
        
        db.session.add(attendance)
        db.session.commit()
        
        return jsonify({
            'success': True,
            'data': {
                'attendance': attendance.to_dict_with_class()
            },
            'message': 'Attendance marked successfully using QR code',
            'timestamp': datetime.utcnow().isoformat()
        })
        
    except Exception as e:
        current_app.logger.error(f'QR attendance error: {str(e)}')
        return jsonify({
            'success': False,
            'error': 'Failed to mark attendance',
            'code': 'ATTENDANCE_ERROR'
        }), 500

@attendance_bp.route('/student/<int:user_id>', methods=['GET'])
@jwt_required()
def get_student_attendance(user_id):
    """Get student's attendance history"""
    try:
        current_user_id = get_jwt_identity()
        current_user = User.query.get(current_user_id)
        
        # Check permissions
        if current_user_id != user_id and not current_user.can_access_admin_features():
            return jsonify({
                'success': False,
                'error': 'Access denied',
                'code': 'ACCESS_DENIED'
            }), 403
        
        user = User.query.get(user_id)
        if not user:
            return jsonify({
                'success': False,
                'error': 'User not found',
                'code': 'USER_NOT_FOUND'
            }), 404
        
        # Get query parameters
        start_date = request.args.get('start_date')
        end_date = request.args.get('end_date')
        class_id = request.args.get('class_id')
        limit = request.args.get('limit', 50, type=int)
        offset = request.args.get('offset', 0, type=int)
        
        # Build query
        query = Attendance.query.filter_by(user_id=user_id)
        
        if start_date:
            try:
                start_datetime = datetime.fromisoformat(start_date.replace('Z', '+00:00'))
                query = query.filter(Attendance.timestamp >= start_datetime)
            except ValueError:
                return jsonify({
                    'success': False,
                    'error': 'Invalid start_date format',
                    'code': 'INVALID_DATE_FORMAT'
                }), 400
        
        if end_date:
            try:
                end_datetime = datetime.fromisoformat(end_date.replace('Z', '+00:00'))
                query = query.filter(Attendance.timestamp <= end_datetime)
            except ValueError:
                return jsonify({
                    'success': False,
                    'error': 'Invalid end_date format',
                    'code': 'INVALID_DATE_FORMAT'
                }), 400
        
        if class_id:
            query = query.filter_by(class_id=class_id)
        
        # Get total count
        total_count = query.count()
        
        # Get paginated results
        attendances = query.order_by(Attendance.timestamp.desc())\
                          .offset(offset)\
                          .limit(limit)\
                          .all()
        
        # Get statistics
        stats = Attendance.get_attendance_stats(user_id, start_date, end_date)
        
        return jsonify({
            'success': True,
            'data': {
                'user': user.to_dict(),
                'attendances': [att.to_dict_with_class() for att in attendances],
                'statistics': stats,
                'pagination': {
                    'total': total_count,
                    'limit': limit,
                    'offset': offset,
                    'has_more': offset + limit < total_count
                }
            },
            'message': 'Student attendance retrieved successfully',
            'timestamp': datetime.utcnow().isoformat()
        })
        
    except Exception as e:
        current_app.logger.error(f'Student attendance error: {str(e)}')
        return jsonify({
            'success': False,
            'error': 'Failed to get student attendance',
            'code': 'ATTENDANCE_RETRIEVAL_ERROR'
        }), 500

@attendance_bp.route('/class/<int:class_id>', methods=['GET'])
@jwt_required()
def get_class_attendance(class_id):
    """Get all attendance for a specific class"""
    try:
        current_user_id = get_jwt_identity()
        current_user = User.query.get(current_user_id)
        
        # Check permissions
        if not current_user.can_access_admin_features():
            return jsonify({
                'success': False,
                'error': 'Access denied',
                'code': 'ACCESS_DENIED'
            }), 403
        
        class_session = ClassSession.query.get(class_id)
        if not class_session:
            return jsonify({
                'success': False,
                'error': 'Class session not found',
                'code': 'CLASS_NOT_FOUND'
            }), 404
        
        # Get query parameters
        limit = request.args.get('limit', 100, type=int)
        offset = request.args.get('offset', 0, type=int)
        
        # Get attendance records
        query = Attendance.query.filter_by(class_id=class_id)
        total_count = query.count()
        
        attendances = query.order_by(Attendance.timestamp.desc())\
                          .offset(offset)\
                          .limit(limit)\
                          .all()
        
        # Get class statistics
        stats = class_session.get_attendance_stats()
        
        return jsonify({
            'success': True,
            'data': {
                'class_session': class_session.to_dict_with_faculty(),
                'attendances': [att.to_dict_with_user() for att in attendances],
                'statistics': stats,
                'pagination': {
                    'total': total_count,
                    'limit': limit,
                    'offset': offset,
                    'has_more': offset + limit < total_count
                }
            },
            'message': 'Class attendance retrieved successfully',
            'timestamp': datetime.utcnow().isoformat()
        })
        
    except Exception as e:
        current_app.logger.error(f'Class attendance error: {str(e)}')
        return jsonify({
            'success': False,
            'error': 'Failed to get class attendance',
            'code': 'ATTENDANCE_RETRIEVAL_ERROR'
        }), 500

@attendance_bp.route('/verify/<int:attendance_id>', methods=['POST'])
@jwt_required()
def verify_attendance(attendance_id):
    """Manually verify an attendance record"""
    try:
        current_user_id = get_jwt_identity()
        current_user = User.query.get(current_user_id)
        
        # Check permissions (only faculty/admin can verify)
        if not current_user.can_access_admin_features():
            return jsonify({
                'success': False,
                'error': 'Access denied',
                'code': 'ACCESS_DENIED'
            }), 403
        
        attendance = Attendance.query.get(attendance_id)
        if not attendance:
            return jsonify({
                'success': False,
                'error': 'Attendance record not found',
                'code': 'ATTENDANCE_NOT_FOUND'
            }), 404
        
        data = request.get_json() or {}
        notes = data.get('notes', '')
        
        # Verify attendance
        attendance.verify(current_user_id, notes)
        db.session.commit()
        
        return jsonify({
            'success': True,
            'data': {
                'attendance': attendance.to_dict_with_user()
            },
            'message': 'Attendance verified successfully',
            'timestamp': datetime.utcnow().isoformat()
        })
        
    except Exception as e:
        current_app.logger.error(f'Attendance verification error: {str(e)}')
        return jsonify({
            'success': False,
            'error': 'Failed to verify attendance',
            'code': 'VERIFICATION_ERROR'
        }), 500


