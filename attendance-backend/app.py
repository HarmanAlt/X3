from flask import Flask, jsonify, request
from flask_cors import CORS
from flask_jwt_extended import JWTManager
from flask_sqlalchemy import SQLAlchemy
from datetime import datetime, timedelta
import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Initialize Flask app
app = Flask(__name__)

# Configuration
app.config['SECRET_KEY'] = os.environ.get('SECRET_KEY') or 'dev-secret-key-change-in-production'
app.config['SQLALCHEMY_DATABASE_URI'] = os.environ.get('DATABASE_URL') or 'sqlite:///attendance.db'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
app.config['JWT_SECRET_KEY'] = os.environ.get('JWT_SECRET_KEY') or 'jwt-secret-string-change-in-production'
app.config['JWT_ACCESS_TOKEN_EXPIRES'] = timedelta(hours=24)
app.config['UPLOAD_FOLDER'] = 'uploads/attendance_photos'
app.config['MAX_CONTENT_LENGTH'] = 16 * 1024 * 1024  # 16MB max file size

# Initialize extensions
db = SQLAlchemy(app)
jwt = JWTManager(app)

# CORS configuration - allow your React app to access the API
CORS(app, origins=[
    'http://localhost:3000',  # React dev server
    'http://localhost:5173',  # Vite dev server
    'http://localhost:8080',  # Alternative port
    'https://your-domain.com'  # Production domain
])

# Create upload directory if it doesn't exist
os.makedirs(app.config['UPLOAD_FOLDER'], exist_ok=True)

# Import models
from models.user import User
from models.attendance import Attendance
from models.class_model import ClassSession
from models.analytics import AttendanceAnalytics

# Import routes
from routes.auth import auth_bp
from routes.attendance import attendance_bp
from routes.dashboard import dashboard_bp
from routes.analytics import analytics_bp
from routes.faculty import faculty_bp
from routes.students import students_bp
from routes.classes import classes_bp
from routes.reports import reports_bp

# Register blueprints
app.register_blueprint(auth_bp, url_prefix='/api/auth')
app.register_blueprint(attendance_bp, url_prefix='/api/attendance')
app.register_blueprint(dashboard_bp, url_prefix='/api/dashboard')
app.register_blueprint(analytics_bp, url_prefix='/api/analytics')
app.register_blueprint(faculty_bp, url_prefix='/api/faculty')
app.register_blueprint(students_bp, url_prefix='/api/students')
app.register_blueprint(classes_bp, url_prefix='/api/classes')
app.register_blueprint(reports_bp, url_prefix='/api/reports')

# Error handlers
@app.errorhandler(400)
def bad_request(error):
    return jsonify({
        'success': False,
        'error': 'Bad request',
        'code': 'BAD_REQUEST',
        'timestamp': datetime.utcnow().isoformat()
    }), 400

@app.errorhandler(401)
def unauthorized(error):
    return jsonify({
        'success': False,
        'error': 'Unauthorized access',
        'code': 'UNAUTHORIZED',
        'timestamp': datetime.utcnow().isoformat()
    }), 401

@app.errorhandler(403)
def forbidden(error):
    return jsonify({
        'success': False,
        'error': 'Forbidden access',
        'code': 'FORBIDDEN',
        'timestamp': datetime.utcnow().isoformat()
    }), 403

@app.errorhandler(404)
def not_found(error):
    return jsonify({
        'success': False,
        'error': 'Resource not found',
        'code': 'NOT_FOUND',
        'timestamp': datetime.utcnow().isoformat()
    }), 404

@app.errorhandler(500)
def internal_error(error):
    return jsonify({
        'success': False,
        'error': 'Internal server error',
        'code': 'INTERNAL_ERROR',
        'timestamp': datetime.utcnow().isoformat()
    }), 500

# JWT error handlers
@jwt.expired_token_loader
def expired_token_callback(jwt_header, jwt_payload):
    return jsonify({
        'success': False,
        'error': 'Token has expired',
        'code': 'TOKEN_EXPIRED',
        'timestamp': datetime.utcnow().isoformat()
    }), 401

@jwt.invalid_token_loader
def invalid_token_callback(error):
    return jsonify({
        'success': False,
        'error': 'Invalid token',
        'code': 'INVALID_TOKEN',
        'timestamp': datetime.utcnow().isoformat()
    }), 401

@jwt.unauthorized_loader
def missing_token_callback(error):
    return jsonify({
        'success': False,
        'error': 'Authorization token is required',
        'code': 'MISSING_TOKEN',
        'timestamp': datetime.utcnow().isoformat()
    }), 401

# Health check endpoint
@app.route('/api/health', methods=['GET'])
def health_check():
    return jsonify({
        'success': True,
        'message': 'Attendance API is running',
        'timestamp': datetime.utcnow().isoformat(),
        'version': '1.0.0'
    })

# Root endpoint
@app.route('/')
def root():
    return jsonify({
        'success': True,
        'message': 'Welcome to Attendify API',
        'endpoints': {
            'auth': '/api/auth',
            'attendance': '/api/attendance',
            'dashboard': '/api/dashboard',
            'analytics': '/api/analytics',
            'classes': '/api/classes',
            'reports': '/api/reports'
        },
        'timestamp': datetime.utcnow().isoformat()
    })

# Create database tables
def create_tables():
    db.create_all()

if __name__ == '__main__':
    # Create database tables
    with app.app_context():
        db.create_all()
    
    # Run the app
    app.run(debug=True, host='0.0.0.0', port=5000)


