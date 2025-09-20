#!/usr/bin/env python3
"""
Simplified Flask app for testing
"""

from flask import Flask, jsonify, request
from flask_cors import CORS
from flask_jwt_extended import JWTManager, create_access_token, jwt_required, get_jwt_identity
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

# Initialize extensions
db = SQLAlchemy(app)
jwt = JWTManager(app)

# CORS configuration
CORS(app, origins=[
    'http://localhost:3000',
    'http://localhost:5173',
    'http://localhost:8080'
])

# Simple User model
class User(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    email = db.Column(db.String(120), unique=True, nullable=False)
    name = db.Column(db.String(120), nullable=False)
    role = db.Column(db.String(20), nullable=False, default='student')
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    is_active = db.Column(db.Boolean, default=True)
    
    def to_dict(self):
        return {
            'id': self.id,
            'email': self.email,
            'name': self.name,
            'role': self.role,
            'created_at': self.created_at.isoformat() if self.created_at else None
        }

# Routes
@app.route('/api/health', methods=['GET'])
def health_check():
    return jsonify({
        'success': True,
        'message': 'Attendance API is running',
        'timestamp': datetime.utcnow().isoformat(),
        'version': '1.0.0'
    })

@app.route('/api/auth/login', methods=['POST'])
def login():
    try:
        data = request.get_json()
        
        if not data:
            return jsonify({
                'success': False,
                'error': 'Request body is required',
                'code': 'MISSING_DATA'
            }), 400
        
        email = data.get('email', '').strip().lower()
        role = data.get('role', '').strip().lower()
        
        if not email or not role:
            return jsonify({
                'success': False,
                'error': 'Email and role are required',
                'code': 'MISSING_FIELDS'
            }), 400
        
        # Check if user exists, create if not
        user = User.query.filter_by(email=email).first()
        
        if not user:
            # Create new user
            name = email.split('@')[0].replace('.', ' ').title()
            user = User(email=email, name=name, role=role)
            db.session.add(user)
            db.session.commit()
        
        # Create JWT token
        additional_claims = {
            'role': user.role,
            'name': user.name
        }
        
        access_token = create_access_token(
            identity=user.id,
            additional_claims=additional_claims
        )
        
        return jsonify({
            'success': True,
            'data': {
                'user': user.to_dict(),
                'access_token': access_token,
                'token_type': 'Bearer',
                'expires_in': app.config['JWT_ACCESS_TOKEN_EXPIRES'].total_seconds()
            },
            'message': 'Login successful',
            'timestamp': datetime.utcnow().isoformat()
        })
        
    except Exception as e:
        return jsonify({
            'success': False,
            'error': 'Internal server error',
            'code': 'LOGIN_ERROR'
        }), 500

@app.route('/api/auth/verify', methods=['GET'])
@jwt_required()
def verify_token():
    try:
        user_id = get_jwt_identity()
        user = User.query.get(user_id)
        
        if not user:
            return jsonify({
                'success': False,
                'error': 'User not found',
                'code': 'USER_NOT_FOUND'
            }), 404
        
        return jsonify({
            'success': True,
            'data': {
                'user': user.to_dict()
            },
            'message': 'Token is valid',
            'timestamp': datetime.utcnow().isoformat()
        })
        
    except Exception as e:
        return jsonify({
            'success': False,
            'error': 'Token verification failed',
            'code': 'VERIFICATION_ERROR'
        }), 500

@app.route('/api/dashboard/overview', methods=['GET'])
@jwt_required()
def get_dashboard_overview():
    try:
        user_id = get_jwt_identity()
        user = User.query.get(user_id)
        
        if not user:
            return jsonify({
                'success': False,
                'error': 'User not found',
                'code': 'USER_NOT_FOUND'
            }), 404
        
        # Simple dashboard data
        dashboard_data = {
            'user': user.to_dict(),
            'statistics': {
                'total_students': User.query.filter_by(role='student').count(),
                'total_faculty': User.query.filter_by(role='faculty').count(),
                'total_admins': User.query.filter_by(role='admin').count(),
                'attendance_rate': 87.5,
                'active_classes': 5
            }
        }
        
        return jsonify({
            'success': True,
            'data': dashboard_data,
            'message': 'Dashboard data retrieved successfully',
            'timestamp': datetime.utcnow().isoformat()
        })
        
    except Exception as e:
        return jsonify({
            'success': False,
            'error': 'Failed to get dashboard data',
            'code': 'DASHBOARD_ERROR'
        }), 500

@app.route('/')
def root():
    return jsonify({
        'success': True,
        'message': 'Welcome to Attendify API',
        'endpoints': {
            'health': '/api/health',
            'auth': '/api/auth',
            'dashboard': '/api/dashboard'
        },
        'timestamp': datetime.utcnow().isoformat()
    })

if __name__ == '__main__':
    # Create database tables
    with app.app_context():
        db.create_all()
        
        # Create demo users if they don't exist
        demo_users = [
            {'email': 'admin@attendify.com', 'name': 'System Admin', 'role': 'admin'},
            {'email': 'faculty@attendify.com', 'name': 'Dr. Bhawna Suri', 'role': 'faculty'},
            {'email': 'student@attendify.com', 'name': 'Kartik Smith', 'role': 'student'}
        ]
        
        for user_data in demo_users:
            if not User.query.filter_by(email=user_data['email']).first():
                user = User(**user_data)
                db.session.add(user)
        
        db.session.commit()
        print("✅ Database initialized with demo users")
    
    print("🚀 Starting Attendify API...")
    print("📍 Backend URL: http://localhost:5000")
    print("🔗 Health Check: http://localhost:5000/api/health")
    print("👤 Demo Users:")
    print("   - Admin: admin@attendify.com")
    print("   - Faculty: faculty@attendify.com")
    print("   - Student: student@attendify.com")
    print("\n🎉 Backend is ready!")
    
    # Run the app
    app.run(debug=True, host='0.0.0.0', port=5000)
