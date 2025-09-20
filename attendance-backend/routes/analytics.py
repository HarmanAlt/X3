from flask import Blueprint, request, jsonify, current_app
from flask_jwt_extended import jwt_required, get_jwt_identity
from datetime import datetime, timedelta, date
from utils.decorators import require_role, log_request, handle_errors
from utils.validators import validate_analytics_params

from models.user import User
from models.attendance import Attendance
from models.class_model import ClassSession
from models.analytics import AttendanceAnalytics
from models import db

analytics_bp = Blueprint('analytics', __name__)

@analytics_bp.route('/attendance-trends', methods=['GET'])
@jwt_required()
@require_role(['faculty', 'admin'])
@log_request
@handle_errors
def get_attendance_trends():
    """Get attendance trends over time"""
    try:
        current_user_id = get_jwt_identity()
        current_user = User.query.get(current_user_id)
        
        # Get query parameters
        class_id = request.args.get('class_id', type=int)
        days = request.args.get('days', 30, type=int)
        start_date = request.args.get('start_date')
        end_date = request.args.get('end_date')
        
        # Validate parameters
        params = {
            'class_id': class_id,
            'days': days,
            'start_date': start_date,
            'end_date': end_date
        }
        
        if not validate_analytics_params(params):
            return jsonify({
                'success': False,
                'error': 'Invalid analytics parameters',
                'code': 'INVALID_PARAMETERS'
            }), 400
        
        # Check permissions for class_id
        if class_id:
            class_session = ClassSession.query.get(class_id)
            if not class_session:
                return jsonify({
                    'success': False,
                    'error': 'Class session not found',
                    'code': 'CLASS_NOT_FOUND'
                }), 404
            
            if class_session.faculty_id != current_user_id and not current_user.is_admin():
                return jsonify({
                    'success': False,
                    'error': 'Access denied to class data',
                    'code': 'ACCESS_DENIED'
                }), 403
        
        # Get trends
        trends = AttendanceAnalytics.get_attendance_trends(class_id, days)
        
        return jsonify({
            'success': True,
            'data': trends,
            'message': 'Attendance trends retrieved successfully',
            'timestamp': datetime.utcnow().isoformat()
        })
        
    except Exception as e:
        current_app.logger.error(f'Get attendance trends error: {str(e)}')
        return jsonify({
            'success': False,
            'error': 'Failed to get attendance trends',
            'code': 'ANALYTICS_ERROR'
        }), 500

@analytics_bp.route('/risk-students', methods=['GET'])
@jwt_required()
@require_role(['faculty', 'admin'])
@log_request
@handle_errors
def get_risk_students():
    """Get students with low attendance rates"""
    try:
        current_user_id = get_jwt_identity()
        current_user = User.query.get(current_user_id)
        
        # Get query parameters
        threshold = request.args.get('threshold', 60.0, type=float)
        days = request.args.get('days', 30, type=int)
        class_id = request.args.get('class_id', type=int)
        
        # Validate threshold
        if not (0 <= threshold <= 100):
            return jsonify({
                'success': False,
                'error': 'Threshold must be between 0 and 100',
                'code': 'INVALID_THRESHOLD'
            }), 400
        
        # Check permissions for class_id
        if class_id:
            class_session = ClassSession.query.get(class_id)
            if not class_session:
                return jsonify({
                    'success': False,
                    'error': 'Class session not found',
                    'code': 'CLASS_NOT_FOUND'
                }), 404
            
            if class_session.faculty_id != current_user_id and not current_user.is_admin():
                return jsonify({
                    'success': False,
                    'error': 'Access denied to class data',
                    'code': 'ACCESS_DENIED'
                }), 403
        
        # Get risk students
        if class_id:
            # Get risk students for specific class
            risk_students = get_class_risk_students(class_id, threshold, days)
        else:
            # Get all risk students
            risk_students = AttendanceAnalytics.get_risk_students(threshold, days)
        
        return jsonify({
            'success': True,
            'data': {
                'risk_students': risk_students,
                'count': len(risk_students),
                'threshold': threshold,
                'period_days': days
            },
            'message': 'Risk students retrieved successfully',
            'timestamp': datetime.utcnow().isoformat()
        })
        
    except Exception as e:
        current_app.logger.error(f'Get risk students error: {str(e)}')
        return jsonify({
            'success': False,
            'error': 'Failed to get risk students',
            'code': 'ANALYTICS_ERROR'
        }), 500

@analytics_bp.route('/generate-report', methods=['POST'])
@jwt_required()
@require_role(['faculty', 'admin'])
@log_request
@handle_errors
def generate_report():
    """Generate custom attendance report"""
    try:
        current_user_id = get_jwt_identity()
        current_user = User.query.get(current_user_id)
        
        data = request.get_json()
        
        if not data:
            return jsonify({
                'success': False,
                'error': 'Request body is required',
                'code': 'MISSING_DATA'
            }), 400
        
        report_type = data.get('type', 'attendance')
        class_id = data.get('class_id')
        start_date = data.get('start_date')
        end_date = data.get('end_date')
        format_type = data.get('format', 'json')  # json, csv, pdf
        
        # Validate report type
        valid_types = ['attendance', 'student', 'class', 'faculty', 'system']
        if report_type not in valid_types:
            return jsonify({
                'success': False,
                'error': f'Invalid report type. Must be one of: {", ".join(valid_types)}',
                'code': 'INVALID_REPORT_TYPE'
            }), 400
        
        # Validate format
        valid_formats = ['json', 'csv', 'pdf']
        if format_type not in valid_formats:
            return jsonify({
                'success': False,
                'error': f'Invalid format. Must be one of: {", ".join(valid_formats)}',
                'code': 'INVALID_FORMAT'
            }), 400
        
        # Check permissions for class_id
        if class_id:
            class_session = ClassSession.query.get(class_id)
            if not class_session:
                return jsonify({
                    'success': False,
                    'error': 'Class session not found',
                    'code': 'CLASS_NOT_FOUND'
                }), 404
            
            if class_session.faculty_id != current_user_id and not current_user.is_admin():
                return jsonify({
                    'success': False,
                    'error': 'Access denied to class data',
                    'code': 'ACCESS_DENIED'
                }), 403
        
        # Generate report based on type
        if report_type == 'attendance':
            report_data = generate_attendance_report(class_id, start_date, end_date)
        elif report_type == 'student':
            report_data = generate_student_report(class_id, start_date, end_date)
        elif report_type == 'class':
            report_data = generate_class_report(class_id, start_date, end_date)
        elif report_type == 'faculty':
            report_data = generate_faculty_report(current_user_id, start_date, end_date)
        elif report_type == 'system':
            if not current_user.is_admin():
                return jsonify({
                    'success': False,
                    'error': 'System reports are only available to admins',
                    'code': 'ACCESS_DENIED'
                }), 403
            report_data = generate_system_report(start_date, end_date)
        
        # Format report based on requested format
        if format_type == 'json':
            formatted_report = report_data
        elif format_type == 'csv':
            formatted_report = format_report_as_csv(report_data)
        elif format_type == 'pdf':
            formatted_report = format_report_as_pdf(report_data)
        
        return jsonify({
            'success': True,
            'data': {
                'report': formatted_report,
                'type': report_type,
                'format': format_type,
                'generated_at': datetime.utcnow().isoformat(),
                'generated_by': current_user.name
            },
            'message': 'Report generated successfully',
            'timestamp': datetime.utcnow().isoformat()
        })
        
    except Exception as e:
        current_app.logger.error(f'Generate report error: {str(e)}')
        return jsonify({
            'success': False,
            'error': 'Failed to generate report',
            'code': 'REPORT_GENERATION_ERROR'
        }), 500

@analytics_bp.route('/dashboard-stats', methods=['GET'])
@jwt_required()
@log_request
@handle_errors
def get_dashboard_stats():
    """Get dashboard statistics for current user"""
    try:
        user_id = get_jwt_identity()
        user = User.query.get(user_id)
        
        if not user:
            return jsonify({
                'success': False,
                'error': 'User not found',
                'code': 'USER_NOT_FOUND'
            }), 404
        
        stats = {}
        
        if user.is_student():
            stats = get_student_stats(user_id)
        elif user.is_faculty():
            stats = get_faculty_stats(user_id)
        elif user.is_admin():
            stats = get_admin_stats()
        
        return jsonify({
            'success': True,
            'data': stats,
            'message': 'Dashboard statistics retrieved successfully',
            'timestamp': datetime.utcnow().isoformat()
        })
        
    except Exception as e:
        current_app.logger.error(f'Get dashboard stats error: {str(e)}')
        return jsonify({
            'success': False,
            'error': 'Failed to get dashboard statistics',
            'code': 'STATS_ERROR'
        }), 500

# Helper functions

def get_class_risk_students(class_id, threshold, days):
    """Get risk students for a specific class"""
    try:
        end_date = datetime.now()
        start_date = end_date - timedelta(days=days)
        
        # Get students enrolled in the class
        class_session = ClassSession.query.get(class_id)
        if not class_session:
            return []
        
        # This is a simplified implementation
        # In reality, you'd have a proper student-class enrollment relationship
        
        # Get all students
        students = User.query.filter_by(role='student').all()
        risk_students = []
        
        for student in students:
            # Calculate attendance for this class
            attendances = Attendance.query.filter_by(
                user_id=student.id,
                class_id=class_id
            ).filter(
                Attendance.timestamp >= start_date,
                Attendance.timestamp <= end_date
            ).all()
            
            # Simplified calculation
            attendance_rate = (len(attendances) / max(1, days)) * 100
            
            if attendance_rate < threshold:
                risk_students.append({
                    'student': student.to_dict(),
                    'attendance_rate': round(attendance_rate, 2),
                    'attendance_count': len(attendances),
                    'class_id': class_id
                })
        
        return sorted(risk_students, key=lambda x: x['attendance_rate'])
        
    except Exception as e:
        current_app.logger.error(f'Get class risk students error: {str(e)}')
        return []

def generate_attendance_report(class_id, start_date, end_date):
    """Generate attendance report"""
    try:
        # Build query
        query = Attendance.query
        
        if class_id:
            query = query.filter_by(class_id=class_id)
        
        if start_date:
            start_dt = datetime.fromisoformat(start_date.replace('Z', '+00:00'))
            query = query.filter(Attendance.timestamp >= start_dt)
        
        if end_date:
            end_dt = datetime.fromisoformat(end_date.replace('Z', '+00:00'))
            query = query.filter(Attendance.timestamp <= end_dt)
        
        attendances = query.order_by(Attendance.timestamp.desc()).all()
        
        return {
            'type': 'attendance',
            'total_records': len(attendances),
            'attendances': [att.to_dict_with_user() for att in attendances],
            'summary': {
                'face_recognition_count': len([a for a in attendances if a.method == 'face_recognition']),
                'qr_code_count': len([a for a in attendances if a.method == 'qr_code']),
                'verified_count': len([a for a in attendances if a.is_verified])
            }
        }
        
    except Exception as e:
        current_app.logger.error(f'Generate attendance report error: {str(e)}')
        return {'type': 'attendance', 'error': str(e)}

def generate_student_report(class_id, start_date, end_date):
    """Generate student report"""
    try:
        students = User.query.filter_by(role='student').all()
        
        report_data = []
        for student in students:
            # Get attendance for student
            query = Attendance.query.filter_by(user_id=student.id)
            
            if class_id:
                query = query.filter_by(class_id=class_id)
            
            if start_date:
                start_dt = datetime.fromisoformat(start_date.replace('Z', '+00:00'))
                query = query.filter(Attendance.timestamp >= start_dt)
            
            if end_date:
                end_dt = datetime.fromisoformat(end_date.replace('Z', '+00:00'))
                query = query.filter(Attendance.timestamp <= end_dt)
            
            attendances = query.all()
            
            stats = Attendance.get_attendance_stats(student.id, start_date, end_date)
            
            report_data.append({
                'student': student.to_dict(),
                'attendance_stats': stats,
                'attendances': [att.to_dict_with_class() for att in attendances]
            })
        
        return {
            'type': 'student',
            'total_students': len(report_data),
            'students': report_data
        }
        
    except Exception as e:
        current_app.logger.error(f'Generate student report error: {str(e)}')
        return {'type': 'student', 'error': str(e)}

def generate_class_report(class_id, start_date, end_date):
    """Generate class report"""
    try:
        if not class_id:
            return {'type': 'class', 'error': 'Class ID is required'}
        
        class_session = ClassSession.query.get(class_id)
        if not class_session:
            return {'type': 'class', 'error': 'Class not found'}
        
        # Get attendance for class
        query = Attendance.query.filter_by(class_id=class_id)
        
        if start_date:
            start_dt = datetime.fromisoformat(start_date.replace('Z', '+00:00'))
            query = query.filter(Attendance.timestamp >= start_dt)
        
        if end_date:
            end_dt = datetime.fromisoformat(end_date.replace('Z', '+00:00'))
            query = query.filter(Attendance.timestamp <= end_dt)
        
        attendances = query.all()
        
        return {
            'type': 'class',
            'class_session': class_session.to_dict_with_faculty(),
            'attendance_stats': class_session.get_attendance_stats(),
            'attendances': [att.to_dict_with_user() for att in attendances]
        }
        
    except Exception as e:
        current_app.logger.error(f'Generate class report error: {str(e)}')
        return {'type': 'class', 'error': str(e)}

def generate_faculty_report(faculty_id, start_date, end_date):
    """Generate faculty report"""
    try:
        faculty = User.query.get(faculty_id)
        if not faculty:
            return {'type': 'faculty', 'error': 'Faculty not found'}
        
        # Get classes taught by faculty
        classes = ClassSession.query.filter_by(faculty_id=faculty_id).all()
        
        report_data = []
        for cls in classes:
            # Get attendance for class
            query = Attendance.query.filter_by(class_id=cls.id)
            
            if start_date:
                start_dt = datetime.fromisoformat(start_date.replace('Z', '+00:00'))
                query = query.filter(Attendance.timestamp >= start_dt)
            
            if end_date:
                end_dt = datetime.fromisoformat(end_date.replace('Z', '+00:00'))
                query = query.filter(Attendance.timestamp <= end_dt)
            
            attendances = query.all()
            
            report_data.append({
                'class_session': cls.to_dict(),
                'attendance_stats': cls.get_attendance_stats(),
                'attendances': [att.to_dict_with_user() for att in attendances]
            })
        
        return {
            'type': 'faculty',
            'faculty': faculty.to_dict(),
            'total_classes': len(classes),
            'classes': report_data
        }
        
    except Exception as e:
        current_app.logger.error(f'Generate faculty report error: {str(e)}')
        return {'type': 'faculty', 'error': str(e)}

def generate_system_report(start_date, end_date):
    """Generate system-wide report"""
    try:
        # Get system statistics
        total_users = User.query.count()
        total_students = User.query.filter_by(role='student').count()
        total_faculty = User.query.filter_by(role='faculty').count()
        total_classes = ClassSession.query.count()
        
        # Get attendance statistics
        query = Attendance.query
        
        if start_date:
            start_dt = datetime.fromisoformat(start_date.replace('Z', '+00:00'))
            query = query.filter(Attendance.timestamp >= start_dt)
        
        if end_date:
            end_dt = datetime.fromisoformat(end_date.replace('Z', '+00:00'))
            query = query.filter(Attendance.timestamp <= end_dt)
        
        total_attendance = query.count()
        face_recognition_count = query.filter_by(method='face_recognition').count()
        qr_code_count = query.filter_by(method='qr_code').count()
        
        return {
            'type': 'system',
            'statistics': {
                'users': {
                    'total': total_users,
                    'students': total_students,
                    'faculty': total_faculty
                },
                'classes': {
                    'total': total_classes
                },
                'attendance': {
                    'total': total_attendance,
                    'face_recognition': face_recognition_count,
                    'qr_code': qr_code_count
                }
            }
        }
        
    except Exception as e:
        current_app.logger.error(f'Generate system report error: {str(e)}')
        return {'type': 'system', 'error': str(e)}

def format_report_as_csv(report_data):
    """Format report as CSV"""
    # This is a placeholder implementation
    # In production, you'd use a proper CSV library
    return {
        'format': 'csv',
        'data': str(report_data),
        'note': 'CSV formatting not implemented'
    }

def format_report_as_pdf(report_data):
    """Format report as PDF"""
    # This is a placeholder implementation
    # In production, you'd use a proper PDF library like ReportLab
    return {
        'format': 'pdf',
        'data': str(report_data),
        'note': 'PDF formatting not implemented'
    }

def get_student_stats(user_id):
    """Get statistics for student"""
    try:
        # Get recent attendance
        end_date = datetime.utcnow()
        start_date = end_date - timedelta(days=30)
        
        recent_attendances = Attendance.query.filter_by(user_id=user_id)\
                                            .filter(Attendance.timestamp >= start_date)\
                                            .all()
        
        return {
            'user_type': 'student',
            'recent_attendance': len(recent_attendances),
            'face_recognition_count': len([a for a in recent_attendances if a.method == 'face_recognition']),
            'qr_code_count': len([a for a in recent_attendances if a.method == 'qr_code'])
        }
        
    except Exception as e:
        current_app.logger.error(f'Get student stats error: {str(e)}')
        return {'user_type': 'student', 'error': str(e)}

def get_faculty_stats(user_id):
    """Get statistics for faculty"""
    try:
        # Get classes taught
        classes = ClassSession.query.filter_by(faculty_id=user_id).all()
        
        # Get recent attendance for all classes
        end_date = datetime.utcnow()
        start_date = end_date - timedelta(days=7)
        
        recent_attendances = Attendance.query.join(ClassSession)\
                                            .filter(ClassSession.faculty_id == user_id)\
                                            .filter(Attendance.timestamp >= start_date)\
                                            .all()
        
        return {
            'user_type': 'faculty',
            'total_classes': len(classes),
            'active_classes': len([c for c in classes if c.is_active]),
            'recent_attendance': len(recent_attendances)
        }
        
    except Exception as e:
        current_app.logger.error(f'Get faculty stats error: {str(e)}')
        return {'user_type': 'faculty', 'error': str(e)}

def get_admin_stats():
    """Get statistics for admin"""
    try:
        # Get system-wide statistics
        total_users = User.query.count()
        total_students = User.query.filter_by(role='student').count()
        total_faculty = User.query.filter_by(role='faculty').count()
        total_classes = ClassSession.query.count()
        
        # Get recent activity
        end_date = datetime.utcnow()
        start_date = end_date - timedelta(days=7)
        
        recent_users = User.query.filter(User.created_at >= start_date).count()
        recent_classes = ClassSession.query.filter(ClassSession.created_at >= start_date).count()
        recent_attendances = Attendance.query.filter(Attendance.timestamp >= start_date).count()
        
        return {
            'user_type': 'admin',
            'total_users': total_users,
            'total_students': total_students,
            'total_faculty': total_faculty,
            'total_classes': total_classes,
            'recent_activity': {
                'new_users': recent_users,
                'new_classes': recent_classes,
                'attendances': recent_attendances
            }
        }
        
    except Exception as e:
        current_app.logger.error(f'Get admin stats error: {str(e)}')
        return {'user_type': 'admin', 'error': str(e)}


