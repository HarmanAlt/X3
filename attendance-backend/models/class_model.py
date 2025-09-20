from flask_sqlalchemy import SQLAlchemy
from datetime import datetime, timedelta
import json
import secrets

db = SQLAlchemy()

class ClassSession(db.Model):
    """Class session model for managing classes and attendance sessions"""
    __tablename__ = 'class_sessions'
    
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(200), nullable=False)
    subject = db.Column(db.String(100))
    faculty_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False, index=True)
    start_time = db.Column(db.DateTime, nullable=False, index=True)
    end_time = db.Column(db.DateTime)
    qr_code = db.Column(db.String(500))  # Generated QR code data
    qr_code_expires_at = db.Column(db.DateTime)  # QR code expiration
    face_recognition_enabled = db.Column(db.Boolean, default=True)
    qr_code_enabled = db.Column(db.Boolean, default=True)
    room = db.Column(db.String(100))
    schedule = db.Column(db.String(200))  # e.g., "Mon, Wed, Fri - 10:00 AM"
    semester = db.Column(db.String(50))
    max_students = db.Column(db.Integer)
    is_active = db.Column(db.Boolean, default=True)
    attendance_window_minutes = db.Column(db.Integer, default=30)  # How long after start time attendance is allowed
    grace_period_minutes = db.Column(db.Integer, default=10)  # Grace period for late attendance
    settings = db.Column(db.Text)  # JSON field for additional settings
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    attendances = db.relationship('Attendance', backref='class_session', lazy=True, cascade='all, delete-orphan')
    
    def __init__(self, name, faculty_id, start_time, **kwargs):
        self.name = name
        self.faculty_id = faculty_id
        self.start_time = start_time
        self.subject = kwargs.get('subject')
        self.end_time = kwargs.get('end_time')
        self.room = kwargs.get('room')
        self.schedule = kwargs.get('schedule')
        self.semester = kwargs.get('semester')
        self.max_students = kwargs.get('max_students')
        self.face_recognition_enabled = kwargs.get('face_recognition_enabled', True)
        self.qr_code_enabled = kwargs.get('qr_code_enabled', True)
        self.attendance_window_minutes = kwargs.get('attendance_window_minutes', 30)
        self.grace_period_minutes = kwargs.get('grace_period_minutes', 10)
        self.settings = json.dumps(kwargs.get('settings', {}))
    
    def generate_qr_code(self, expiry_minutes=30):
        """Generate a new QR code for this class session"""
        # Create unique token with expiration
        token = secrets.token_urlsafe(32)
        expires_at = datetime.utcnow() + timedelta(minutes=expiry_minutes)
        
        qr_data = {
            'class_id': self.id,
            'token': token,
            'expires_at': expires_at.isoformat(),
            'type': 'attendance',
            'faculty_id': self.faculty_id
        }
        
        self.qr_code = json.dumps(qr_data)
        self.qr_code_expires_at = expires_at
        self.updated_at = datetime.utcnow()
        
        return qr_data
    
    def validate_qr_code(self, qr_token):
        """Validate QR code token"""
        if not self.qr_code or not self.qr_code_expires_at:
            return False
        
        try:
            qr_data = json.loads(self.qr_code)
            if qr_data.get('token') != qr_token:
                return False
            
            # Check if QR code has expired
            if datetime.utcnow() > self.qr_code_expires_at:
                return False
            
            return True
        except (json.JSONDecodeError, TypeError):
            return False
    
    def is_attendance_window_open(self):
        """Check if attendance window is still open"""
        if not self.start_time:
            return False
        
        window_end = self.start_time + timedelta(minutes=self.attendance_window_minutes)
        return datetime.utcnow() <= window_end
    
    def is_class_active(self):
        """Check if class is currently active"""
        now = datetime.utcnow()
        
        # Class hasn't started yet
        if now < self.start_time:
            return False
        
        # Class has ended
        if self.end_time and now > self.end_time:
            return False
        
        # Attendance window has closed
        if not self.is_attendance_window_open():
            return False
        
        return True
    
    def get_attendance_stats(self):
        """Get attendance statistics for this class"""
        total_attendance = len(self.attendances)
        face_recognition_count = len([a for a in self.attendances if a.method == 'face_recognition'])
        qr_code_count = len([a for a in self.attendances if a.method == 'qr_code'])
        verified_count = len([a for a in self.attendances if a.is_verified])
        late_count = len([a for a in self.attendances if a.is_late()])
        
        # Calculate attendance rate (this would need to be compared against enrolled students)
        attendance_rate = (total_attendance / max(1, self.max_students or 1)) * 100
        
        return {
            'total_attendance': total_attendance,
            'face_recognition_count': face_recognition_count,
            'qr_code_count': qr_code_count,
            'verified_count': verified_count,
            'late_count': late_count,
            'attendance_rate': min(100.0, attendance_rate),
            'max_students': self.max_students,
            'is_active': self.is_class_active(),
            'attendance_window_open': self.is_attendance_window_open()
        }
    
    def get_recent_attendances(self, limit=10):
        """Get recent attendance records for this class"""
        return Attendance.query.filter_by(class_id=self.id)\
                              .order_by(Attendance.timestamp.desc())\
                              .limit(limit)\
                              .all()
    
    def set_settings(self, settings_dict):
        """Update class settings"""
        self.settings = json.dumps(settings_dict)
        self.updated_at = datetime.utcnow()
    
    def get_settings(self):
        """Get class settings"""
        try:
            return json.loads(self.settings) if self.settings else {}
        except (json.JSONDecodeError, TypeError):
            return {}
    
    def to_dict(self):
        """Convert class session to dictionary for API responses"""
        return {
            'id': self.id,
            'name': self.name,
            'subject': self.subject,
            'faculty_id': self.faculty_id,
            'start_time': self.start_time.isoformat() if self.start_time else None,
            'end_time': self.end_time.isoformat() if self.end_time else None,
            'room': self.room,
            'schedule': self.schedule,
            'semester': self.semester,
            'max_students': self.max_students,
            'face_recognition_enabled': self.face_recognition_enabled,
            'qr_code_enabled': self.qr_code_enabled,
            'attendance_window_minutes': self.attendance_window_minutes,
            'grace_period_minutes': self.grace_period_minutes,
            'is_active': self.is_active,
            'is_class_active': self.is_class_active(),
            'attendance_window_open': self.is_attendance_window_open(),
            'qr_code_available': bool(self.qr_code and self.qr_code_expires_at and 
                                    datetime.utcnow() <= self.qr_code_expires_at),
            'settings': self.get_settings(),
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'updated_at': self.updated_at.isoformat() if self.updated_at else None
        }
    
    def to_dict_with_stats(self):
        """Convert class session to dictionary with attendance statistics"""
        class_dict = self.to_dict()
        stats = self.get_attendance_stats()
        class_dict.update(stats)
        return class_dict
    
    def to_dict_with_faculty(self):
        """Convert class session to dictionary including faculty information"""
        class_dict = self.to_dict()
        if self.faculty:
            class_dict['faculty'] = {
                'id': self.faculty.id,
                'name': self.faculty.name,
                'email': self.faculty.email
            }
        return class_dict
    
    @staticmethod
    def get_active_classes():
        """Get all currently active classes"""
        return ClassSession.query.filter_by(is_active=True)\
                                 .filter(ClassSession.start_time <= datetime.utcnow())\
                                 .filter(ClassSession.end_time >= datetime.utcnow())\
                                 .all()
    
    @staticmethod
    def get_upcoming_classes(hours_ahead=24):
        """Get classes starting within the next N hours"""
        cutoff_time = datetime.utcnow() + timedelta(hours=hours_ahead)
        return ClassSession.query.filter_by(is_active=True)\
                                 .filter(ClassSession.start_time > datetime.utcnow())\
                                 .filter(ClassSession.start_time <= cutoff_time)\
                                 .order_by(ClassSession.start_time)\
                                 .all()
    
    def __repr__(self):
        return f'<ClassSession {self.name} ({self.faculty_id})>'


