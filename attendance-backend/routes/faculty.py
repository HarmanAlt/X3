from flask import Blueprint, request, jsonify, current_app
from flask_jwt_extended import jwt_required, get_jwt_identity
from datetime import datetime, timedelta
from utils.decorators import require_role, log_request, handle_errors

from models.user import User
from models.class_model import ClassSession
from models import db

faculty_bp = Blueprint('faculty', __name__)

@faculty_bp.route('/', methods=['GET'])
@jwt_required()
@require_role('admin')
@log_request
@handle_errors
def get_all_faculty():
    """Get all faculty members"""
    try:
        # Get query parameters
        limit = request.args.get('limit', 50, type=int)
        offset = request.args.get('offset', 0, type=int)
        search = request.args.get('search', '').strip()
        
        # Build query
        query = User.query.filter_by(role='faculty')
        
        if search:
            query = query.filter(
                User.name.contains(search) | User.email.contains(search)
            )
        
        # Get total count
        total_count = query.count()
        
        # Get paginated results
        faculty = query.order_by(User.name)\
                      .offset(offset)\
                      .limit(limit)\
                      .all()
        
        return jsonify({
            'success': True,
            'data': {
                'faculty': [member.to_dict() for member in faculty],
                'pagination': {
                    'total': total_count,
                    'limit': limit,
                    'offset': offset,
                    'has_more': offset + limit < total_count
                }
            },
            'message': 'Faculty retrieved successfully',
            'timestamp': datetime.utcnow().isoformat()
        })
        
    except Exception as e:
        current_app.logger.error(f'Get faculty error: {str(e)}')
        return jsonify({
            'success': False,
            'error': 'Failed to get faculty',
            'code': 'GET_FACULTY_ERROR'
        }), 500

@faculty_bp.route('/<int:faculty_id>', methods=['GET'])
@jwt_required()
@require_role(['faculty', 'admin'])
@log_request
@handle_errors
def get_faculty_details(faculty_id):
    """Get faculty member details"""
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
                'code': 'FACULTY_NOT_FOUND'
            }), 404
        
        if faculty.role != 'faculty':
            return jsonify({
                'success': False,
                'error': 'User is not a faculty member',
                'code': 'INVALID_USER_TYPE'
            }), 400
        
        # Get classes taught by faculty
        classes = ClassSession.query.filter_by(faculty_id=faculty_id)\
                                   .order_by(ClassSession.start_time.desc())\
                                   .limit(10)\
                                   .all()
        
        return jsonify({
            'success': True,
            'data': {
                'faculty': faculty.to_dict(),
                'classes': [cls.to_dict_with_stats() for cls in classes],
                'total_classes': ClassSession.query.filter_by(faculty_id=faculty_id).count()
            },
            'message': 'Faculty details retrieved successfully',
            'timestamp': datetime.utcnow().isoformat()
        })
        
    except Exception as e:
        current_app.logger.error(f'Get faculty details error: {str(e)}')
        return jsonify({
            'success': False,
            'error': 'Failed to get faculty details',
            'code': 'GET_FACULTY_ERROR'
        }), 500


