from flask_sqlalchemy import SQLAlchemy
from datetime import datetime
import json

db = SQLAlchemy()

class Attendance(db.Model):
    """Attendance model for tracking student attendance"""
    __tablename__ = 'attendances'
    
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False, index=True)
    class_id = db.Column(db.Integer, db.ForeignKey('class_sessions.id'), nullable=False, index=True)
    timestamp = db.Column(db.DateTime, default=datetime.utcnow, nullable=False, index=True)
    method = db.Column(db.Enum('face_recognition', 'qr_code', name='attendance_methods'), nullable=False)
    confidence_score = db.Column(db.Float)  # For face recognition confidence
    photo_path = db.Column(db.String(255))  # Path to attendance photo
    location_data = db.Column(db.Text)  # JSON field for GPS coordinates
    device_info = db.Column(db.Text)  # JSON field for device information
    ip_address = db.Column(db.String(45))  # IPv4 or IPv6 address
    is_verified = db.Column(db.Boolean, default=False)  # Manual verification flag
    verified_by = db.Column(db.Integer, db.ForeignKey('users.id'))  # Who verified it
    verified_at = db.Column(db.DateTime)
    notes = db.Column(db.Text)  # Additional notes
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    # Relationships
    class_session = db.relationship('ClassSession', backref='attendances')
    verifier = db.relationship('User', foreign_keys=[verified_by], backref='verified_attendances')
    
    def __init__(self, user_id, class_id, method, **kwargs):
        self.user_id = user_id
        self.class_id = class_id
        self.method = method
        self.confidence_score = kwargs.get('confidence_score')
        self.photo_path = kwargs.get('photo_path')
        self.location_data = kwargs.get('location_data')
        self.device_info = kwargs.get('device_info')
        self.ip_address = kwargs.get('ip_address')
        self.notes = kwargs.get('notes')
    
    def set_location_data(self, latitude, longitude, accuracy=None):
        """Set location data as JSON"""
        location = {
            'latitude': latitude,
            'longitude': longitude,
            'accuracy': accuracy,
            'timestamp': datetime.utcnow().isoformat()
        }
        self.location_data = json.dumps(location)
    
    def get_location_data(self):
        """Retrieve location data from JSON"""
        try:
            return json.loads(self.location_data) if self.location_data else None
        except (json.JSONDecodeError, TypeError):
            return None
    
    def set_device_info(self, user_agent, platform=None, browser=None):
        """Set device information as JSON"""
        device_info = {
            'user_agent': user_agent,
            'platform': platform,
            'browser': browser,
            'timestamp': datetime.utcnow().isoformat()
        }
        self.device_info = json.dumps(device_info)
    
    def get_device_info(self):
        """Retrieve device information from JSON"""
        try:
            return json.loads(self.device_info) if self.device_info else None
        except (json.JSONDecodeError, TypeError):
            return None
    
    def verify(self, verified_by_user_id, notes=None):
        """Mark attendance as manually verified"""
        self.is_verified = True
        self.verified_by = verified_by_user_id
        self.verified_at = datetime.utcnow()
        if notes:
            self.notes = notes
    
    def is_late(self, grace_period_minutes=10):
        """Check if attendance was marked late"""
        if not self.class_session:
            return False
        
        class_start = self.class_session.start_time
        grace_period = timedelta(minutes=grace_period_minutes)
        
        return self.timestamp > (class_start + grace_period)
    
    def get_attendance_status(self):
        """Get attendance status (present, late, absent)"""
        if self.is_late():
            return 'late'
        return 'present'
    
    def to_dict(self):
        """Convert attendance to dictionary for API responses"""
        return {
            'id': self.id,
            'user_id': self.user_id,
            'class_id': self.class_id,
            'timestamp': self.timestamp.isoformat() if self.timestamp else None,
            'method': self.method,
            'confidence_score': self.confidence_score,
            'photo_path': self.photo_path,
            'location_data': self.get_location_data(),
            'device_info': self.get_device_info(),
            'ip_address': self.ip_address,
            'is_verified': self.is_verified,
            'verified_by': self.verified_by,
            'verified_at': self.verified_at.isoformat() if self.verified_at else None,
            'notes': self.notes,
            'status': self.get_attendance_status(),
            'is_late': self.is_late(),
            'created_at': self.created_at.isoformat() if self.created_at else None
        }
    
    def to_dict_with_user(self):
        """Convert attendance to dictionary including user information"""
        attendance_dict = self.to_dict()
        if self.user:
            attendance_dict['user'] = {
                'id': self.user.id,
                'name': self.user.name,
                'email': self.user.email,
                'role': self.user.role
            }
        return attendance_dict
    
    def to_dict_with_class(self):
        """Convert attendance to dictionary including class information"""
        attendance_dict = self.to_dict()
        if self.class_session:
            attendance_dict['class_session'] = {
                'id': self.class_session.id,
                'name': self.class_session.name,
                'start_time': self.class_session.start_time.isoformat() if self.class_session.start_time else None,
                'end_time': self.class_session.end_time.isoformat() if self.class_session.end_time else None
            }
        return attendance_dict
    
    @staticmethod
    def get_attendance_stats(user_id, start_date=None, end_date=None):
        """Get attendance statistics for a user"""
        query = Attendance.query.filter_by(user_id=user_id)
        
        if start_date:
            query = query.filter(Attendance.timestamp >= start_date)
        if end_date:
            query = query.filter(Attendance.timestamp <= end_date)
        
        attendances = query.all()
        
        total = len(attendances)
        face_recognition = len([a for a in attendances if a.method == 'face_recognition'])
        qr_code = len([a for a in attendances if a.method == 'qr_code'])
        verified = len([a for a in attendances if a.is_verified])
        late = len([a for a in attendances if a.is_late()])
        
        return {
            'total_attendance': total,
            'face_recognition_count': face_recognition,
            'qr_code_count': qr_code,
            'verified_count': verified,
            'late_count': late,
            'attendance_rate': (total / max(1, total)) * 100,  # Placeholder calculation
            'verification_rate': (verified / max(1, total)) * 100
        }
    
    def __repr__(self):
        return f'<Attendance {self.user_id} - {self.class_id} ({self.method})>'


