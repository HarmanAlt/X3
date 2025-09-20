from flask import Blueprint, request, jsonify, current_app
from flask_jwt_extended import jwt_required, get_jwt_identity
from datetime import datetime, timedelta
from utils.decorators import require_role, log_request, handle_errors, validate_json_content_type, validate_required_fields
from utils.validators import validate_class_settings

from models.user import User
from models.class_model import ClassSession
from models import db
from services.qr_service import QRService

classes_bp = Blueprint('classes', __name__)

@classes_bp.route('/create', methods=['POST'])
@jwt_required()
@require_role(['faculty', 'admin'])
@validate_json_content_type
@validate_required_fields(['name', 'start_time'])
@log_request
@handle_errors
def create_class():
    """Create new class session"""
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
        
        # Validate class settings
        if not validate_class_settings(data):
            return jsonify({
                'success': False,
                'error': 'Invalid class settings',
                'code': 'INVALID_CLASS_SETTINGS'
            }), 400
        
        # Parse start time
        try:
            start_time = datetime.fromisoformat(data['start_time'].replace('Z', '+00:00'))
        except ValueError:
            return jsonify({
                'success': False,
                'error': 'Invalid start_time format',
                'code': 'INVALID_TIME_FORMAT'
            }), 400
        
        # Parse end time if provided
        end_time = None
        if 'end_time' in data and data['end_time']:
            try:
                end_time = datetime.fromisoformat(data['end_time'].replace('Z', '+00:00'))
            except ValueError:
                return jsonify({
                    'success': False,
                    'error': 'Invalid end_time format',
                    'code': 'INVALID_TIME_FORMAT'
                }), 400
        
        # Create class session
        class_session = ClassSession(
            name=data['name'],
            faculty_id=user_id,
            start_time=start_time,
            end_time=end_time,
            subject=data.get('subject'),
            room=data.get('room'),
            schedule=data.get('schedule'),
            semester=data.get('semester'),
            max_students=data.get('max_students'),
            face_recognition_enabled=data.get('face_recognition_enabled', True),
            qr_code_enabled=data.get('qr_code_enabled', True),
            attendance_window_minutes=data.get('attendance_window_minutes', 30),
            grace_period_minutes=data.get('grace_period_minutes', 10)
        )
        
        db.session.add(class_session)
        db.session.commit()
        
        # Generate QR code if enabled
        if class_session.qr_code_enabled:
            qr_service = QRService()
            qr_result = qr_service.generate_class_qr(
                class_session.id, 
                user_id,
                class_session.attendance_window_minutes
            )
            
            if qr_result['success']:
                class_session.qr_code = qr_result['qr_data']
                class_session.qr_code_expires_at = datetime.fromisoformat(qr_result['expires_at'])
                db.session.commit()
        
        return jsonify({
            'success': True,
            'data': {
                'class_session': class_session.to_dict_with_faculty(),
                'qr_code': qr_result.get('qr_image') if class_session.qr_code_enabled else None
            },
            'message': 'Class session created successfully',
            'timestamp': datetime.utcnow().isoformat()
        })
        
    except Exception as e:
        current_app.logger.error(f'Create class error: {str(e)}')
        return jsonify({
            'success': False,
            'error': 'Failed to create class session',
            'code': 'CREATE_CLASS_ERROR'
        }), 500

@classes_bp.route('/faculty/<int:faculty_id>', methods=['GET'])
@jwt_required()
@require_role(['faculty', 'admin'])
@log_request
@handle_errors
def get_faculty_classes(faculty_id):
    """Get all classes for a faculty member"""
    try:
        current_user_id = get_jwt_identity()
        current_user = User.query.get(current_user_id)
        
        # Check permissions
        if current_user_id != faculty_id and not current_user.is_admin():
            return jsonify({
                'success': False,
                'error': 'Access denied',
                'code': 'ACCESS_DENIED'
            }), 403
        
        faculty = User.query.get(faculty_id)
        if not faculty:
            return jsonify({
                'success': False,
                'error': 'Faculty member not found',
                'code': 'USER_NOT_FOUND'
            }), 404
        
        # Get query parameters
        limit = request.args.get('limit', 50, type=int)
        offset = request.args.get('offset', 0, type=int)
        active_only = request.args.get('active_only', 'false').lower() == 'true'
        
        # Build query
        query = ClassSession.query.filter_by(faculty_id=faculty_id)
        
        if active_only:
            query = query.filter_by(is_active=True)
        
        # Get total count
        total_count = query.count()
        
        # Get paginated results
        classes = query.order_by(ClassSession.start_time.desc())\
                      .offset(offset)\
                      .limit(limit)\
                      .all()
        
        return jsonify({
            'success': True,
            'data': {
                'faculty': faculty.to_dict(),
                'classes': [cls.to_dict_with_stats() for cls in classes],
                'pagination': {
                    'total': total_count,
                    'limit': limit,
                    'offset': offset,
                    'has_more': offset + limit < total_count
                }
            },
            'message': 'Faculty classes retrieved successfully',
            'timestamp': datetime.utcnow().isoformat()
        })
        
    except Exception as e:
        current_app.logger.error(f'Get faculty classes error: {str(e)}')
        return jsonify({
            'success': False,
            'error': 'Failed to get faculty classes',
            'code': 'GET_CLASSES_ERROR'
        }), 500

@classes_bp.route('/<int:class_id>/settings', methods=['PUT'])
@jwt_required()
@require_role(['faculty', 'admin'])
@validate_json_content_type
@log_request
@handle_errors
def update_class_settings(class_id):
    """Update class session settings"""
    try:
        current_user_id = get_jwt_identity()
        current_user = User.query.get(current_user_id)
        
        class_session = ClassSession.query.get(class_id)
        if not class_session:
            return jsonify({
                'success': False,
                'error': 'Class session not found',
                'code': 'CLASS_NOT_FOUND'
            }), 404
        
        # Check permissions
        if class_session.faculty_id != current_user_id and not current_user.is_admin():
            return jsonify({
                'success': False,
                'error': 'Access denied',
                'code': 'ACCESS_DENIED'
            }), 403
        
        data = request.get_json()
        
        # Update allowed fields
        if 'name' in data:
            class_session.name = data['name']
        
        if 'subject' in data:
            class_session.subject = data['subject']
        
        if 'room' in data:
            class_session.room = data['room']
        
        if 'schedule' in data:
            class_session.schedule = data['schedule']
        
        if 'semester' in data:
            class_session.semester = data['semester']
        
        if 'max_students' in data:
            class_session.max_students = data['max_students']
        
        if 'face_recognition_enabled' in data:
            class_session.face_recognition_enabled = data['face_recognition_enabled']
        
        if 'qr_code_enabled' in data:
            class_session.qr_code_enabled = data['qr_code_enabled']
        
        if 'attendance_window_minutes' in data:
            class_session.attendance_window_minutes = data['attendance_window_minutes']
        
        if 'grace_period_minutes' in data:
            class_session.grace_period_minutes = data['grace_period_minutes']
        
        if 'is_active' in data:
            class_session.is_active = data['is_active']
        
        # Update settings if provided
        if 'settings' in data:
            class_session.set_settings(data['settings'])
        
        class_session.updated_at = datetime.utcnow()
        db.session.commit()
        
        return jsonify({
            'success': True,
            'data': {
                'class_session': class_session.to_dict()
            },
            'message': 'Class settings updated successfully',
            'timestamp': datetime.utcnow().isoformat()
        })
        
    except Exception as e:
        current_app.logger.error(f'Update class settings error: {str(e)}')
        return jsonify({
            'success': False,
            'error': 'Failed to update class settings',
            'code': 'UPDATE_CLASS_ERROR'
        }), 500

@classes_bp.route('/<int:class_id>/generate-qr', methods=['POST'])
@jwt_required()
@require_role(['faculty', 'admin'])
@log_request
@handle_errors
def generate_class_qr(class_id):
    """Generate new QR code for class session"""
    try:
        current_user_id = get_jwt_identity()
        current_user = User.query.get(current_user_id)
        
        class_session = ClassSession.query.get(class_id)
        if not class_session:
            return jsonify({
                'success': False,
                'error': 'Class session not found',
                'code': 'CLASS_NOT_FOUND'
            }), 404
        
        # Check permissions
        if class_session.faculty_id != current_user_id and not current_user.is_admin():
            return jsonify({
                'success': False,
                'error': 'Access denied',
                'code': 'ACCESS_DENIED'
            }), 403
        
        # Check if QR code is enabled
        if not class_session.qr_code_enabled:
            return jsonify({
                'success': False,
                'error': 'QR code is not enabled for this class',
                'code': 'QR_CODE_DISABLED'
            }), 400
        
        # Generate new QR code
        qr_service = QRService()
        qr_result = qr_service.generate_class_qr(
            class_id,
            current_user_id,
            class_session.attendance_window_minutes
        )
        
        if not qr_result['success']:
            return jsonify({
                'success': False,
                'error': 'Failed to generate QR code',
                'code': 'QR_GENERATION_ERROR'
            }), 500
        
        # Update class session with new QR code
        class_session.qr_code = qr_result['qr_data']
        class_session.qr_code_expires_at = datetime.fromisoformat(qr_result['expires_at'])
        class_session.updated_at = datetime.utcnow()
        db.session.commit()
        
        return jsonify({
            'success': True,
            'data': {
                'qr_code': qr_result['qr_image'],
                'expires_at': qr_result['expires_at'],
                'class_session': class_session.to_dict()
            },
            'message': 'QR code generated successfully',
            'timestamp': datetime.utcnow().isoformat()
        })
        
    except Exception as e:
        current_app.logger.error(f'Generate QR code error: {str(e)}')
        return jsonify({
            'success': False,
            'error': 'Failed to generate QR code',
            'code': 'QR_GENERATION_ERROR'
        }), 500

@classes_bp.route('/<int:class_id>', methods=['GET'])
@jwt_required()
@log_request
@handle_errors
def get_class_details(class_id):
    """Get class session details"""
    try:
        current_user_id = get_jwt_identity()
        current_user = User.query.get(current_user_id)
        
        class_session = ClassSession.query.get(class_id)
        if not class_session:
            return jsonify({
                'success': False,
                'error': 'Class session not found',
                'code': 'CLASS_NOT_FOUND'
            }), 404
        
        # Check permissions
        can_access = (
            current_user_id == class_session.faculty_id or
            current_user.is_admin() or
            (current_user.is_student() and class_session.is_active)
        )
        
        if not can_access:
            return jsonify({
                'success': False,
                'error': 'Access denied',
                'code': 'ACCESS_DENIED'
            }), 403
        
        return jsonify({
            'success': True,
            'data': {
                'class_session': class_session.to_dict_with_faculty(),
                'statistics': class_session.get_attendance_stats(),
                'recent_attendances': [att.to_dict_with_user() for att in class_session.get_recent_attendances()]
            },
            'message': 'Class details retrieved successfully',
            'timestamp': datetime.utcnow().isoformat()
        })
        
    except Exception as e:
        current_app.logger.error(f'Get class details error: {str(e)}')
        return jsonify({
            'success': False,
            'error': 'Failed to get class details',
            'code': 'GET_CLASS_ERROR'
        }), 500

@classes_bp.route('/active', methods=['GET'])
@jwt_required()
@log_request
@handle_errors
def get_active_classes():
    """Get all currently active classes"""
    try:
        current_user_id = get_jwt_identity()
        current_user = User.query.get(current_user_id)
        
        # Get active classes
        active_classes = ClassSession.get_active_classes()
        
        # Filter based on user role
        if current_user.is_student():
            # Students can only see active classes
            filtered_classes = [cls for cls in active_classes if cls.is_active]
        elif current_user.is_faculty():
            # Faculty can see their own active classes
            filtered_classes = [cls for cls in active_classes if cls.faculty_id == current_user_id]
        elif current_user.is_admin():
            # Admins can see all active classes
            filtered_classes = active_classes
        else:
            filtered_classes = []
        
        return jsonify({
            'success': True,
            'data': {
                'active_classes': [cls.to_dict_with_faculty() for cls in filtered_classes],
                'count': len(filtered_classes)
            },
            'message': 'Active classes retrieved successfully',
            'timestamp': datetime.utcnow().isoformat()
        })
        
    except Exception as e:
        current_app.logger.error(f'Get active classes error: {str(e)}')
        return jsonify({
            'success': False,
            'error': 'Failed to get active classes',
            'code': 'GET_ACTIVE_CLASSES_ERROR'
        }), 500

@classes_bp.route('/upcoming', methods=['GET'])
@jwt_required()
@log_request
@handle_errors
def get_upcoming_classes():
    """Get upcoming classes"""
    try:
        current_user_id = get_jwt_identity()
        current_user = User.query.get(current_user_id)
        
        # Get hours ahead parameter
        hours_ahead = request.args.get('hours_ahead', 24, type=int)
        
        # Get upcoming classes
        upcoming_classes = ClassSession.get_upcoming_classes(hours_ahead)
        
        # Filter based on user role
        if current_user.is_student():
            # Students can see all upcoming classes
            filtered_classes = upcoming_classes
        elif current_user.is_faculty():
            # Faculty can see their own upcoming classes
            filtered_classes = [cls for cls in upcoming_classes if cls.faculty_id == current_user_id]
        elif current_user.is_admin():
            # Admins can see all upcoming classes
            filtered_classes = upcoming_classes
        else:
            filtered_classes = []
        
        return jsonify({
            'success': True,
            'data': {
                'upcoming_classes': [cls.to_dict_with_faculty() for cls in filtered_classes],
                'count': len(filtered_classes),
                'hours_ahead': hours_ahead
            },
            'message': 'Upcoming classes retrieved successfully',
            'timestamp': datetime.utcnow().isoformat()
        })
        
    except Exception as e:
        current_app.logger.error(f'Get upcoming classes error: {str(e)}')
        return jsonify({
            'success': False,
            'error': 'Failed to get upcoming classes',
            'code': 'GET_UPCOMING_CLASSES_ERROR'
        }), 500


