from flask_sqlalchemy import SQLAlchemy
from datetime import datetime, date
import json

db = SQLAlchemy()

class AttendanceAnalytics(db.Model):
    """Analytics model for attendance reporting and trends"""
    __tablename__ = 'attendance_analytics'
    
    id = db.Column(db.Integer, primary_key=True)
    class_id = db.Column(db.Integer, db.ForeignKey('class_sessions.id'), nullable=False, index=True)
    date = db.Column(db.Date, nullable=False, index=True)
    total_students = db.Column(db.Integer, nullable=False)
    present_count = db.Column(db.Integer, nullable=False)
    absent_count = db.Column(db.Integer, nullable=False)
    late_count = db.Column(db.Integer, default=0)
    attendance_rate = db.Column(db.Float, nullable=False)  # Percentage
    face_recognition_count = db.Column(db.Integer, default=0)
    qr_code_count = db.Column(db.Integer, default=0)
    verified_count = db.Column(db.Integer, default=0)
    peak_attendance_time = db.Column(db.Time)  # Time when most students marked attendance
    average_confidence_score = db.Column(db.Float)  # Average face recognition confidence
    risk_students_count = db.Column(db.Integer, default=0)  # Students with low attendance
    analytics_metadata = db.Column(db.Text)  # JSON field for additional analytics data
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    # Relationships
    class_session = db.relationship('ClassSession', backref='analytics')
    
    def __init__(self, class_id, date, total_students, present_count, **kwargs):
        self.class_id = class_id
        self.date = date
        self.total_students = total_students
        self.present_count = present_count
        self.absent_count = total_students - present_count
        self.attendance_rate = (present_count / max(1, total_students)) * 100
        self.late_count = kwargs.get('late_count', 0)
        self.face_recognition_count = kwargs.get('face_recognition_count', 0)
        self.qr_code_count = kwargs.get('qr_code_count', 0)
        self.verified_count = kwargs.get('verified_count', 0)
        self.peak_attendance_time = kwargs.get('peak_attendance_time')
        self.average_confidence_score = kwargs.get('average_confidence_score')
        self.risk_students_count = kwargs.get('risk_students_count', 0)
        self.analytics_metadata = json.dumps(kwargs.get('metadata', {}))
    
    def set_metadata(self, metadata_dict):
        """Update analytics metadata"""
        self.analytics_metadata = json.dumps(metadata_dict)
    
    def get_metadata(self):
        """Get analytics metadata"""
        try:
            return json.loads(self.analytics_metadata) if self.analytics_metadata else {}
        except (json.JSONDecodeError, TypeError):
            return {}
    
    def update_counts(self, present_count, late_count=0, face_recognition_count=0, 
                     qr_code_count=0, verified_count=0, average_confidence_score=None):
        """Update attendance counts and recalculate rates"""
        self.present_count = present_count
        self.absent_count = self.total_students - present_count
        self.late_count = late_count
        self.face_recognition_count = face_recognition_count
        self.qr_code_count = qr_code_count
        self.verified_count = verified_count
        self.attendance_rate = (present_count / max(1, self.total_students)) * 100
        
        if average_confidence_score is not None:
            self.average_confidence_score = average_confidence_score
    
    def to_dict(self):
        """Convert analytics to dictionary for API responses"""
        return {
            'id': self.id,
            'class_id': self.class_id,
            'date': self.date.isoformat() if self.date else None,
            'total_students': self.total_students,
            'present_count': self.present_count,
            'absent_count': self.absent_count,
            'late_count': self.late_count,
            'attendance_rate': self.attendance_rate,
            'face_recognition_count': self.face_recognition_count,
            'qr_code_count': self.qr_code_count,
            'verified_count': self.verified_count,
            'peak_attendance_time': self.peak_attendance_time.isoformat() if self.peak_attendance_time else None,
            'average_confidence_score': self.average_confidence_score,
            'risk_students_count': self.risk_students_count,
            'metadata': self.get_metadata(),
            'created_at': self.created_at.isoformat() if self.created_at else None
        }
    
    @staticmethod
    def generate_daily_analytics(class_id, target_date=None):
        """Generate analytics for a specific class on a specific date"""
        if target_date is None:
            target_date = date.today()
        
        # Get class session
        from models.class_model import ClassSession
        class_session = ClassSession.query.get(class_id)
        if not class_session:
            return None
        
        # Get attendance records for the date
        from models.attendance import Attendance
        start_of_day = datetime.combine(target_date, datetime.min.time())
        end_of_day = datetime.combine(target_date, datetime.max.time())
        
        attendances = Attendance.query.filter_by(class_id=class_id)\
                                     .filter(Attendance.timestamp >= start_of_day)\
                                     .filter(Attendance.timestamp <= end_of_day)\
                                     .all()
        
        # Calculate statistics
        total_students = class_session.max_students or len(set(a.user_id for a in attendances))
        present_count = len(attendances)
        late_count = len([a for a in attendances if a.is_late()])
        face_recognition_count = len([a for a in attendances if a.method == 'face_recognition'])
        qr_code_count = len([a for a in attendances if a.method == 'qr_code'])
        verified_count = len([a for a in attendances if a.is_verified])
        
        # Calculate average confidence score
        confidence_scores = [a.confidence_score for a in attendances if a.confidence_score is not None]
        average_confidence_score = sum(confidence_scores) / len(confidence_scores) if confidence_scores else None
        
        # Find peak attendance time
        attendance_times = [a.timestamp.time() for a in attendances]
        peak_attendance_time = max(set(attendance_times), key=attendance_times.count) if attendance_times else None
        
        # Create or update analytics record
        analytics = AttendanceAnalytics.query.filter_by(class_id=class_id, date=target_date).first()
        
        if analytics:
            analytics.update_counts(
                present_count=present_count,
                late_count=late_count,
                face_recognition_count=face_recognition_count,
                qr_code_count=qr_code_count,
                verified_count=verified_count,
                average_confidence_score=average_confidence_score
            )
        else:
            analytics = AttendanceAnalytics(
                class_id=class_id,
                date=target_date,
                total_students=total_students,
                present_count=present_count,
                late_count=late_count,
                face_recognition_count=face_recognition_count,
                qr_code_count=qr_code_count,
                verified_count=verified_count,
                peak_attendance_time=peak_attendance_time,
                average_confidence_score=average_confidence_score
            )
            db.session.add(analytics)
        
        db.session.commit()
        return analytics
    
    @staticmethod
    def get_attendance_trends(class_id=None, days=30):
        """Get attendance trends over a period"""
        end_date = date.today()
        start_date = end_date - timedelta(days=days)
        
        query = AttendanceAnalytics.query.filter(AttendanceAnalytics.date >= start_date)\
                                        .filter(AttendanceAnalytics.date <= end_date)
        
        if class_id:
            query = query.filter_by(class_id=class_id)
        
        analytics = query.order_by(AttendanceAnalytics.date).all()
        
        return {
            'period': {
                'start_date': start_date.isoformat(),
                'end_date': end_date.isoformat(),
                'days': days
            },
            'trends': [a.to_dict() for a in analytics],
            'summary': AttendanceAnalytics._calculate_trend_summary(analytics)
        }
    
    @staticmethod
    def _calculate_trend_summary(analytics_list):
        """Calculate summary statistics for trends"""
        if not analytics_list:
            return {}
        
        total_days = len(analytics_list)
        total_students = sum(a.total_students for a in analytics_list)
        total_present = sum(a.present_count for a in analytics_list)
        total_absent = sum(a.absent_count for a in analytics_list)
        total_late = sum(a.late_count for a in analytics_list)
        
        average_attendance_rate = sum(a.attendance_rate for a in analytics_list) / total_days
        average_confidence = sum(a.average_confidence_score for a in analytics_list 
                               if a.average_confidence_score is not None) / max(1, 
                               len([a for a in analytics_list if a.average_confidence_score is not None]))
        
        return {
            'total_days': total_days,
            'average_attendance_rate': round(average_attendance_rate, 2),
            'total_students': total_students,
            'total_present': total_present,
            'total_absent': total_absent,
            'total_late': total_late,
            'average_confidence_score': round(average_confidence, 3) if average_confidence else None,
            'trend_direction': AttendanceAnalytics._calculate_trend_direction(analytics_list)
        }
    
    @staticmethod
    def _calculate_trend_direction(analytics_list):
        """Calculate if attendance is trending up, down, or stable"""
        if len(analytics_list) < 2:
            return 'stable'
        
        recent_rates = [a.attendance_rate for a in analytics_list[-7:]]  # Last 7 days
        older_rates = [a.attendance_rate for a in analytics_list[:-7]]   # Previous days
        
        if not older_rates:
            return 'stable'
        
        recent_avg = sum(recent_rates) / len(recent_rates)
        older_avg = sum(older_rates) / len(older_rates)
        
        difference = recent_avg - older_avg
        
        if difference > 5:
            return 'improving'
        elif difference < -5:
            return 'declining'
        else:
            return 'stable'
    
    @staticmethod
    def get_risk_students(threshold=60.0, days=30):
        """Get students with low attendance rates"""
        from models.user import User
        from models.attendance import Attendance
        
        end_date = datetime.now()
        start_date = end_date - timedelta(days=days)
        
        # Get all students
        students = User.query.filter_by(role='student').all()
        risk_students = []
        
        for student in students:
            # Calculate attendance rate for the period
            attendances = Attendance.query.filter_by(user_id=student.id)\
                                         .filter(Attendance.timestamp >= start_date)\
                                         .filter(Attendance.timestamp <= end_date)\
                                         .all()
            
            # This is a simplified calculation - in reality, you'd compare against expected classes
            attendance_rate = (len(attendances) / max(1, days)) * 100
            
            if attendance_rate < threshold:
                risk_students.append({
                    'student': student.to_dict(),
                    'attendance_rate': round(attendance_rate, 2),
                    'attendance_count': len(attendances),
                    'period_days': days
                })
        
        return sorted(risk_students, key=lambda x: x['attendance_rate'])
    
    def __repr__(self):
        return f'<AttendanceAnalytics {self.class_id} - {self.date} ({self.attendance_rate}%)>'


