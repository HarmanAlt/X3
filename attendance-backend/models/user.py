from flask_sqlalchemy import SQLAlchemy
from datetime import datetime
from werkzeug.security import generate_password_hash, check_password_hash
import json

db = SQLAlchemy()

class User(db.Model):
    """User model with role-based access control"""
    __tablename__ = 'users'
    
    id = db.Column(db.Integer, primary_key=True)
    email = db.Column(db.String(120), unique=True, nullable=False, index=True)
    name = db.Column(db.String(100), nullable=False)
    role = db.Column(db.Enum('student', 'faculty', 'admin', name='user_roles'), nullable=False)
    face_encodings = db.Column(db.Text)  # JSON field for face recognition data
    is_active = db.Column(db.Boolean, default=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    attendances = db.relationship('Attendance', backref='user', lazy=True, cascade='all, delete-orphan')
    classes_taught = db.relationship('ClassSession', backref='faculty', lazy=True, foreign_keys='ClassSession.faculty_id')
    
    def __init__(self, email, name, role):
        self.email = email.lower().strip()
        self.name = name
        self.role = role
        self.face_encodings = json.dumps([])
    
    def set_face_encodings(self, encodings):
        """Store face encodings as JSON"""
        self.face_encodings = json.dumps(encodings)
        self.updated_at = datetime.utcnow()
    
    def get_face_encodings(self):
        """Retrieve face encodings from JSON"""
        try:
            return json.loads(self.face_encodings) if self.face_encodings else []
        except (json.JSONDecodeError, TypeError):
            return []
    
    def add_face_encoding(self, encoding):
        """Add a new face encoding"""
        encodings = self.get_face_encodings()
        encodings.append(encoding)
        self.set_face_encodings(encodings)
    
    def is_student(self):
        return self.role == 'student'
    
    def is_faculty(self):
        return self.role == 'faculty'
    
    def is_admin(self):
        return self.role == 'admin'
    
    def can_access_admin_features(self):
        return self.role in ['faculty', 'admin']
    
    def to_dict(self):
        """Convert user to dictionary for API responses"""
        return {
            'id': self.id,
            'email': self.email,
            'name': self.name,
            'role': self.role,
            'is_active': self.is_active,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'updated_at': self.updated_at.isoformat() if self.updated_at else None,
            'face_enrolled': len(self.get_face_encodings()) > 0
        }
    
    def to_dict_with_stats(self):
        """Convert user to dictionary with attendance statistics"""
        user_dict = self.to_dict()
        
        if self.is_student():
            # Calculate attendance statistics
            total_attendance = len(self.attendances)
            recent_attendance = len([a for a in self.attendances 
                                   if a.timestamp >= datetime.utcnow().replace(day=1)])
            
            user_dict.update({
                'total_attendance': total_attendance,
                'recent_attendance': recent_attendance,
                'attendance_rate': self.calculate_attendance_rate()
            })
        
        return user_dict
    
    def calculate_attendance_rate(self):
        """Calculate overall attendance rate for students"""
        if not self.is_student():
            return None
        
        # This would need to be calculated based on expected vs actual attendance
        # For now, return a placeholder
        total_attendance = len(self.attendances)
        if total_attendance == 0:
            return 0.0
        
        # This is a simplified calculation - in reality, you'd compare against expected classes
        return min(100.0, (total_attendance / 10) * 100)  # Placeholder calculation
    
    @staticmethod
    def extract_name_from_email(email):
        """Extract readable name from email address"""
        username = email.split('@')[0]
        # Replace common separators with spaces
        name_parts = username.replace('.', ' ').replace('_', ' ').replace('-', ' ')
        # Capitalize each word
        return ' '.join(word.capitalize() for word in name_parts.split())
    
    @staticmethod
    def create_user_from_email(email, role):
        """Create a new user from email address"""
        name = User.extract_name_from_email(email)
        return User(email=email, name=name, role=role)
    
    def __repr__(self):
        return f'<User {self.email} ({self.role})>'


