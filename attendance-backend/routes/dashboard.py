from flask import Blueprint, request, jsonify, current_app
from flask_jwt_extended import jwt_required, get_jwt_identity
from datetime import datetime, timedelta
from utils.decorators import require_role, log_request, handle_errors

from models.user import User
from models.attendance import Attendance
from models.class_model import ClassSession
from models.analytics import AttendanceAnalytics
from models import db

dashboard_bp = Blueprint('dashboard', __name__)

@dashboard_bp.route('/student/<int:user_id>', methods=['GET'])
@jwt_required()
@log_request
@handle_errors
def get_student_dashboard(user_id):
    """Get student dashboard data"""
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
        
        # Get recent attendance (last 30 days)
        end_date = datetime.utcnow()
        start_date = end_date - timedelta(days=30)
        
        recent_attendances = Attendance.query.filter_by(user_id=user_id)\
                                            .filter(Attendance.timestamp >= start_date)\
                                            .order_by(Attendance.timestamp.desc())\
                                            .limit(10)\
                                            .all()
        
        # Get upcoming classes (next 7 days)
        upcoming_classes = ClassSession.query.filter(
            ClassSession.start_time > datetime.utcnow(),
            ClassSession.start_time <= datetime.utcnow() + timedelta(days=7),
            ClassSession.is_active == True
        ).order_by(ClassSession.start_time).limit(5).all()
        
        # Calculate statistics
        total_attendance = len(Attendance.query.filter_by(user_id=user_id).all())
        recent_attendance_count = len(recent_attendances)
        
        # Calculate attendance rate (simplified)
        attendance_rate = min(100.0, (recent_attendance_count / 30) * 100)
        
        # Get face enrollment status
        face_enrolled = len(user.get_face_encodings()) > 0
        
        return jsonify({
            'success': True,
            'data': {
                'user': user.to_dict(),
                'statistics': {
                    'total_attendance': total_attendance,
                    'recent_attendance': recent_attendance_count,
                    'attendance_rate': round(attendance_rate, 2),
                    'face_enrolled': face_enrolled
                },
                'recent_attendances': [att.to_dict_with_class() for att in recent_attendances],
                'upcoming_classes': [cls.to_dict() for cls in upcoming_classes]
            },
            'message': 'Student dashboard data retrieved successfully',
            'timestamp': datetime.utcnow().isoformat()
        })
        
    except Exception as e:
        current_app.logger.error(f'Student dashboard error: {str(e)}')
        return jsonify({
            'success': False,
            'error': 'Failed to get student dashboard',
            'code': 'DASHBOARD_ERROR'
        }), 500

@dashboard_bp.route('/faculty/<int:user_id>', methods=['GET'])
@jwt_required()
@require_role(['faculty', 'admin'])
@log_request
@handle_errors
def get_faculty_dashboard(user_id):
    """Get faculty dashboard data"""
    try:
        current_user_id = get_jwt_identity()
        current_user = User.query.get(current_user_id)
        
        # Check permissions
        if current_user_id != user_id and not current_user.is_admin():
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
        
        # Get classes managed by faculty
        classes = ClassSession.query.filter_by(faculty_id=user_id, is_active=True)\
                                   .order_by(ClassSession.start_time.desc())\
                                   .limit(10)\
                                   .all()
        
        # Get active classes
        active_classes = [cls for cls in classes if cls.is_class_active()]
        
        # Get recent attendance for all classes
        recent_attendances = []
        for cls in classes[:5]:  # Last 5 classes
            attendances = Attendance.query.filter_by(class_id=cls.id)\
                                         .order_by(Attendance.timestamp.desc())\
                                         .limit(5)\
                                         .all()
            recent_attendances.extend(attendances)
        
        # Sort by timestamp
        recent_attendances.sort(key=lambda x: x.timestamp, reverse=True)
        recent_attendances = recent_attendances[:10]  # Top 10 most recent
        
        # Calculate statistics
        total_classes = len(classes)
        active_classes_count = len(active_classes)
        total_attendance_today = len([
            att for att in recent_attendances 
            if att.timestamp.date() == datetime.utcnow().date()
        ])
        
        return jsonify({
            'success': True,
            'data': {
                'user': user.to_dict(),
                'statistics': {
                    'total_classes': total_classes,
                    'active_classes': active_classes_count,
                    'attendance_today': total_attendance_today
                },
                'classes': [cls.to_dict_with_stats() for cls in classes],
                'active_classes': [cls.to_dict_with_stats() for cls in active_classes],
                'recent_attendances': [att.to_dict_with_user() for att in recent_attendances]
            },
            'message': 'Faculty dashboard data retrieved successfully',
            'timestamp': datetime.utcnow().isoformat()
        })
        
    except Exception as e:
        current_app.logger.error(f'Faculty dashboard error: {str(e)}')
        return jsonify({
            'success': False,
            'error': 'Failed to get faculty dashboard',
            'code': 'DASHBOARD_ERROR'
        }), 500

@dashboard_bp.route('/admin', methods=['GET'])
@jwt_required()
@require_role('admin')
@log_request
@handle_errors
def get_admin_dashboard():
    """Get admin dashboard data"""
    try:
        # Get system-wide statistics
        total_users = User.query.count()
        total_students = User.query.filter_by(role='student').count()
        total_faculty = User.query.filter_by(role='faculty').count()
        total_admins = User.query.filter_by(role='admin').count()
        
        # Get class statistics
        total_classes = ClassSession.query.count()
        active_classes = ClassSession.query.filter_by(is_active=True).count()
        
        # Get attendance statistics (last 30 days)
        end_date = datetime.utcnow()
        start_date = end_date - timedelta(days=30)
        
        recent_attendances = Attendance.query.filter(
            Attendance.timestamp >= start_date
        ).count()
        
        # Get attendance by method
        face_recognition_count = Attendance.query.filter(
            Attendance.method == 'face_recognition',
            Attendance.timestamp >= start_date
        ).count()
        
        qr_code_count = Attendance.query.filter(
            Attendance.method == 'qr_code',
            Attendance.timestamp >= start_date
        ).count()
        
        # Get recent users (last 7 days)
        recent_users = User.query.filter(
            User.created_at >= end_date - timedelta(days=7)
        ).order_by(User.created_at.desc()).limit(10).all()
        
        # Get recent classes
        recent_classes = ClassSession.query.filter(
            ClassSession.created_at >= end_date - timedelta(days=7)
        ).order_by(ClassSession.created_at.desc()).limit(10).all()
        
        # Get recent attendances
        recent_attendance_records = Attendance.query.filter(
            Attendance.timestamp >= end_date - timedelta(days=1)
        ).order_by(Attendance.timestamp.desc()).limit(20).all()
        
        return jsonify({
            'success': True,
            'data': {
                'statistics': {
                    'users': {
                        'total': total_users,
                        'students': total_students,
                        'faculty': total_faculty,
                        'admins': total_admins
                    },
                    'classes': {
                        'total': total_classes,
                        'active': active_classes
                    },
                    'attendance': {
                        'recent_30_days': recent_attendances,
                        'face_recognition': face_recognition_count,
                        'qr_code': qr_code_count
                    }
                },
                'recent_users': [user.to_dict() for user in recent_users],
                'recent_classes': [cls.to_dict() for cls in recent_classes],
                'recent_attendances': [att.to_dict_with_user() for att in recent_attendance_records]
            },
            'message': 'Admin dashboard data retrieved successfully',
            'timestamp': datetime.utcnow().isoformat()
        })
        
    except Exception as e:
        current_app.logger.error(f'Admin dashboard error: {str(e)}')
        return jsonify({
            'success': False,
            'error': 'Failed to get admin dashboard',
            'code': 'DASHBOARD_ERROR'
        }), 500

@dashboard_bp.route('/overview', methods=['GET'])
@jwt_required()
@log_request
@handle_errors
def get_dashboard_overview():
    """Get general dashboard overview for current user"""
    try:
        user_id = get_jwt_identity()
        user = User.query.get(user_id)
        
        if not user:
            return jsonify({
                'success': False,
                'error': 'User not found',
                'code': 'USER_NOT_FOUND'
            }), 404
        
        # Get data based on user role
        if user.is_student():
            return get_student_dashboard(user_id)
        elif user.is_faculty():
            return get_faculty_dashboard(user_id)
        elif user.is_admin():
            return get_admin_dashboard()
        else:
            return jsonify({
                'success': False,
                'error': 'Invalid user role',
                'code': 'INVALID_ROLE'
            }), 400
            
    except Exception as e:
        current_app.logger.error(f'Dashboard overview error: {str(e)}')
        return jsonify({
            'success': False,
            'error': 'Failed to get dashboard overview',
            'code': 'DASHBOARD_ERROR'
        }), 500


