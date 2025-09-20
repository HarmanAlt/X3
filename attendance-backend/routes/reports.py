from flask import Blueprint, request, jsonify, current_app
from flask_jwt_extended import jwt_required, get_jwt_identity
from datetime import datetime, timedelta
from utils.decorators import require_role, log_request, handle_errors

from models.user import User
from models.attendance import Attendance
from models.class_model import ClassSession
from models.analytics import AttendanceAnalytics
from models import db

reports_bp = Blueprint('reports', __name__)

@reports_bp.route('/attendance', methods=['GET'])
@jwt_required()
@require_role(['faculty', 'admin'])
@log_request
@handle_errors
def get_attendance_report():
    """Get attendance report"""
    try:
        current_user_id = get_jwt_identity()
        current_user = User.query.get(current_user_id)
        
        # Get query parameters
        class_id = request.args.get('class_id', type=int)
        start_date = request.args.get('start_date')
        end_date = request.args.get('end_date')
        format_type = request.args.get('format', 'json')
        
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
        
        # Generate report data
        report_data = {
            'report_type': 'attendance',
            'generated_at': datetime.utcnow().isoformat(),
            'generated_by': current_user.name,
            'parameters': {
                'class_id': class_id,
                'start_date': start_date,
                'end_date': end_date
            },
            'summary': {
                'total_records': len(attendances),
                'face_recognition_count': len([a for a in attendances if a.method == 'face_recognition']),
                'qr_code_count': len([a for a in attendances if a.method == 'qr_code']),
                'verified_count': len([a for a in attendances if a.is_verified]),
                'late_count': len([a for a in attendances if a.is_late()])
            },
            'attendances': [att.to_dict_with_user() for att in attendances]
        }
        
        return jsonify({
            'success': True,
            'data': report_data,
            'message': 'Attendance report generated successfully',
            'timestamp': datetime.utcnow().isoformat()
        })
        
    except Exception as e:
        current_app.logger.error(f'Get attendance report error: {str(e)}')
        return jsonify({
            'success': False,
            'error': 'Failed to generate attendance report',
            'code': 'REPORT_ERROR'
        }), 500

@reports_bp.route('/student/<int:student_id>', methods=['GET'])
@jwt_required()
@require_role(['faculty', 'admin'])
@log_request
@handle_errors
def get_student_report(student_id):
    """Get student attendance report"""
    try:
        current_user_id = get_jwt_identity()
        current_user = User.query.get(current_user_id)
        
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
        
        # Get query parameters
        start_date = request.args.get('start_date')
        end_date = request.args.get('end_date')
        
        # Build query
        query = Attendance.query.filter_by(user_id=student_id)
        
        if start_date:
            start_dt = datetime.fromisoformat(start_date.replace('Z', '+00:00'))
            query = query.filter(Attendance.timestamp >= start_dt)
        
        if end_date:
            end_dt = datetime.fromisoformat(end_date.replace('Z', '+00:00'))
            query = query.filter(Attendance.timestamp <= end_dt)
        
        attendances = query.order_by(Attendance.timestamp.desc()).all()
        
        # Get statistics
        stats = Attendance.get_attendance_stats(student_id, start_date, end_date)
        
        # Generate report data
        report_data = {
            'report_type': 'student',
            'generated_at': datetime.utcnow().isoformat(),
            'generated_by': current_user.name,
            'student': student.to_dict(),
            'parameters': {
                'start_date': start_date,
                'end_date': end_date
            },
            'statistics': stats,
            'attendances': [att.to_dict_with_class() for att in attendances]
        }
        
        return jsonify({
            'success': True,
            'data': report_data,
            'message': 'Student report generated successfully',
            'timestamp': datetime.utcnow().isoformat()
        })
        
    except Exception as e:
        current_app.logger.error(f'Get student report error: {str(e)}')
        return jsonify({
            'success': False,
            'error': 'Failed to generate student report',
            'code': 'REPORT_ERROR'
        }), 500

@reports_bp.route('/class/<int:class_id>', methods=['GET'])
@jwt_required()
@require_role(['faculty', 'admin'])
@log_request
@handle_errors
def get_class_report(class_id):
    """Get class attendance report"""
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
                'error': 'Access denied to class data',
                'code': 'ACCESS_DENIED'
            }), 403
        
        # Get query parameters
        start_date = request.args.get('start_date')
        end_date = request.args.get('end_date')
        
        # Build query
        query = Attendance.query.filter_by(class_id=class_id)
        
        if start_date:
            start_dt = datetime.fromisoformat(start_date.replace('Z', '+00:00'))
            query = query.filter(Attendance.timestamp >= start_dt)
        
        if end_date:
            end_dt = datetime.fromisoformat(end_date.replace('Z', '+00:00'))
            query = query.filter(Attendance.timestamp <= end_dt)
        
        attendances = query.order_by(Attendance.timestamp.desc()).all()
        
        # Get class statistics
        stats = class_session.get_attendance_stats()
        
        # Generate report data
        report_data = {
            'report_type': 'class',
            'generated_at': datetime.utcnow().isoformat(),
            'generated_by': current_user.name,
            'class_session': class_session.to_dict_with_faculty(),
            'parameters': {
                'start_date': start_date,
                'end_date': end_date
            },
            'statistics': stats,
            'attendances': [att.to_dict_with_user() for att in attendances]
        }
        
        return jsonify({
            'success': True,
            'data': report_data,
            'message': 'Class report generated successfully',
            'timestamp': datetime.utcnow().isoformat()
        })
        
    except Exception as e:
        current_app.logger.error(f'Get class report error: {str(e)}')
        return jsonify({
            'success': False,
            'error': 'Failed to generate class report',
            'code': 'REPORT_ERROR'
        }), 500

@reports_bp.route('/export', methods=['POST'])
@jwt_required()
@require_role(['faculty', 'admin'])
@log_request
@handle_errors
def export_report():
    """Export report in various formats"""
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
        format_type = data.get('format', 'csv')
        class_id = data.get('class_id')
        student_id = data.get('student_id')
        start_date = data.get('start_date')
        end_date = data.get('end_date')
        
        # Validate format
        valid_formats = ['csv', 'pdf', 'excel']
        if format_type not in valid_formats:
            return jsonify({
                'success': False,
                'error': f'Invalid format. Must be one of: {", ".join(valid_formats)}',
                'code': 'INVALID_FORMAT'
            }), 400
        
        # Generate report based on type
        if report_type == 'attendance':
            if class_id:
                report_data = get_class_report(class_id)
            else:
                report_data = get_attendance_report()
        elif report_type == 'student':
            if not student_id:
                return jsonify({
                    'success': False,
                    'error': 'Student ID is required for student report',
                    'code': 'MISSING_STUDENT_ID'
                }), 400
            report_data = get_student_report(student_id)
        else:
            return jsonify({
                'success': False,
                'error': 'Invalid report type',
                'code': 'INVALID_REPORT_TYPE'
            }), 400
        
        # Export based on format
        if format_type == 'csv':
            export_data = export_as_csv(report_data)
        elif format_type == 'pdf':
            export_data = export_as_pdf(report_data)
        elif format_type == 'excel':
            export_data = export_as_excel(report_data)
        
        return jsonify({
            'success': True,
            'data': {
                'export': export_data,
                'format': format_type,
                'type': report_type,
                'generated_at': datetime.utcnow().isoformat(),
                'generated_by': current_user.name
            },
            'message': f'Report exported as {format_type.upper()} successfully',
            'timestamp': datetime.utcnow().isoformat()
        })
        
    except Exception as e:
        current_app.logger.error(f'Export report error: {str(e)}')
        return jsonify({
            'success': False,
            'error': 'Failed to export report',
            'code': 'EXPORT_ERROR'
        }), 500

# Helper functions for export

def export_as_csv(report_data):
    """Export report as CSV"""
    # This is a placeholder implementation
    # In production, you'd use a proper CSV library
    return {
        'format': 'csv',
        'data': str(report_data),
        'note': 'CSV export not fully implemented'
    }

def export_as_pdf(report_data):
    """Export report as PDF"""
    # This is a placeholder implementation
    # In production, you'd use a proper PDF library like ReportLab
    return {
        'format': 'pdf',
        'data': str(report_data),
        'note': 'PDF export not fully implemented'
    }

def export_as_excel(report_data):
    """Export report as Excel"""
    # This is a placeholder implementation
    # In production, you'd use a proper Excel library like openpyxl
    return {
        'format': 'excel',
        'data': str(report_data),
        'note': 'Excel export not fully implemented'
    }


