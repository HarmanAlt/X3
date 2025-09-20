from flask_sqlalchemy import SQLAlchemy

# Initialize SQLAlchemy
db = SQLAlchemy()

# Import all models
from .user import User
from .attendance import Attendance
from .class_model import ClassSession
from .analytics import AttendanceAnalytics

# Export all models
__all__ = [
    'db',
    'User',
    'Attendance', 
    'ClassSession',
    'AttendanceAnalytics'
]


