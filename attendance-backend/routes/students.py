from flask import Blueprint, request, jsonify, current_app
from flask_jwt_extended import jwt_required, get_jwt_identity
from datetime import datetime, timedelta
from utils.decorators import require_role, log_request, handle_errors

from models.user import User
from models.attendance import Attendance
from models.class_model import ClassSession
from models import db

students_bp = Blueprint('students', __name__)

@students_bp.route('/', methods=['GET'])
@jwt_required()
@require_role(['faculty', 'admin'])
@log_request
@handle_errors
def get_all_students():
    """Get all students"""
    try:
        # Get query parameters
        limit = request.args.get('limit', 50, type=int)
        offset = request.args.get('offset', 0, type=int)
        search = request.args.get('search', '').strip()
        
        # Build query
        query = User.query.filter_by(role='student')
        
        if search:
            query = query.filter(
                User.name.contains(search) | User.email.contains(search)
            )
        
        # Get total count
        total_count = query.count()
        
        # Get paginated results
        students = query.order_by(User.name)\
                       .offset(offset)\
                       .limit(limit)\
                       .all()
        
        return jsonify({
            'success': True,
            'data': {
                'students': [student.to_dict_with_stats() for student in students],
                'pagination': {
                    'total': total_count,
                    'limit': limit,
                    'offset': offset,
                    'has_more': offset + limit < total_count
                }
            },
            'message': 'Students retrieved successfully',
            'timestamp': datetime.utcnow().isoformat()
        })
        
    except Exception as e:
        current_app.logger.error(f'Get students error: {str(e)}')
        return jsonify({
            'success': False,
            'error': 'Failed to get students',
            'code': 'GET_STUDENTS_ERROR'
        }), 500

@students_bp.route('/<int:student_id>', methods=['GET'])
@jwt_required()
@log_request
@handle_errors
def get_student_details(student_id):
    """Get student details"""
    try:
        current_user_id = get_jwt_identity()
        current_user = User.query.get(current_user_id)
        
        # Check permissions
        if current_user_id != student_id and not current_user.can_access_admin_features():
            return jsonify({
                'success': False,
                'error': 'Access denied',
                'code': 'ACCESS_DENIED'
            }), 403
        
        student = User.query.get(student_id)
        if not student:
            return jsonify({
                'success': False,
                'error': 'Student not found',
                'code': 'STUDENT_NOT_FOUND'
            }), 404
        
        if student.role != 'student':
            return jsonify({
                'success': False,
                'error': 'User is not a student',
                'code': 'INVALID_USER_TYPE'
            }), 400
        
        # Get recent attendance
        recent_attendances = Attendance.query.filter_by(user_id=student_id)\
                                            .order_by(Attendance.timestamp.desc())\
                                            .limit(10)\
                                            .all()
        
        # Get attendance statistics
        stats = Attendance.get_attendance_stats(student_id)
        
        return jsonify({
            'success': True,
            'data': {
                'student': student.to_dict_with_stats(),
                'recent_attendances': [att.to_dict_with_class() for att in recent_attendances],
                'statistics': stats
            },
            'message': 'Student details retrieved successfully',
            'timestamp': datetime.utcnow().isoformat()
        })
        
    except Exception as e:
        current_app.logger.error(f'Get student details error: {str(e)}')
        return jsonify({
            'success': False,
            'error': 'Failed to get student details',
            'code': 'GET_STUDENT_ERROR'
        }), 500


