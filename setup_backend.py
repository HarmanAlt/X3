#!/usr/bin/env python3
"""
Attendify Backend Setup Script
This script helps you set up the backend quickly and easily.
"""

import os
import sys
import subprocess
import sqlite3
from pathlib import Path

def print_banner():
    print("🚀 Attendify Backend Setup")
    print("=" * 50)

def check_python_version():
    """Check if Python version is compatible"""
    if sys.version_info < (3, 8):
        print("❌ Python 3.8 or higher is required")
        sys.exit(1)
    print(f"✅ Python {sys.version_info.major}.{sys.version_info.minor} detected")

def install_requirements():
    """Install required packages"""
    print("\n📦 Installing requirements...")
    try:
        subprocess.check_call([sys.executable, "-m", "pip", "install", "-r", "requirements.txt"])
        print("✅ Requirements installed successfully")
    except subprocess.CalledProcessError:
        print("❌ Failed to install requirements")
        sys.exit(1)

def create_env_file():
    """Create .env file with default values"""
    env_file = Path(".env")
    if env_file.exists():
        print("✅ .env file already exists")
        return
    
    env_content = """# Attendify Backend Configuration
SECRET_KEY=dev-secret-key-change-in-production-12345
JWT_SECRET_KEY=jwt-secret-string-change-in-production-67890
DATABASE_URL=sqlite:///attendance.db

# Face Recognition Settings
FACE_RECOGNITION_TOLERANCE=0.6
FACE_RECOGNITION_MODEL=hog

# QR Code Settings
QR_CODE_EXPIRY_MINUTES=30
QR_CODE_SIZE=10
QR_CODE_BORDER=4

# File Upload Settings
UPLOAD_FOLDER=uploads/attendance_photos
MAX_CONTENT_LENGTH=16777216

# Analytics Settings
ATTENDANCE_THRESHOLD=75.0
RISK_STUDENT_THRESHOLD=60.0

# CORS Settings (add your frontend URLs)
CORS_ORIGINS=http://localhost:3000,http://localhost:5173,http://localhost:8080
"""
    
    with open(env_file, "w") as f:
        f.write(env_content)
    
    print("✅ .env file created with default values")

def create_upload_directories():
    """Create necessary upload directories"""
    directories = [
        "uploads",
        "uploads/attendance_photos",
        "uploads/face_encodings"
    ]
    
    for directory in directories:
        Path(directory).mkdir(parents=True, exist_ok=True)
    
    print("✅ Upload directories created")

def initialize_database():
    """Initialize the database with sample data"""
    print("\n🗄️ Initializing database...")
    
    try:
        # Import the app to initialize database
        from app import app, db, User, ClassSession
        from datetime import datetime, timedelta
        
        with app.app_context():
            # Create all tables
            db.create_all()
            print("✅ Database tables created")
            
            # Check if we already have data
            if User.query.count() > 0:
                print("✅ Database already has data")
                return
            
            # Create sample users
            sample_users = [
                User(
                    email="admin@attendify.com",
                    name="System Admin",
                    role="admin"
                ),
                User(
                    email="faculty@attendify.com",
                    name="Dr. Bhawna Suri",
                    role="faculty"
                ),
                User(
                    email="student@attendify.com",
                    name="Kartik Smith",
                    role="student"
                )
            ]
            
            for user in sample_users:
                db.session.add(user)
            
            db.session.commit()
            print("✅ Sample users created")
            
            # Create sample class
            faculty = User.query.filter_by(email="faculty@attendify.com").first()
            if faculty:
                sample_class = ClassSession(
                    name="Introduction to Computer Science",
                    subject="Computer Science",
                    faculty_id=faculty.id,
                    start_time=datetime.utcnow() + timedelta(hours=1),
                    end_time=datetime.utcnow() + timedelta(hours=2, minutes=30),
                    room="Room 201",
                    schedule="Mon, Wed, Fri - 10:00 AM",
                    semester="Fall 2024",
                    max_students=50,
                    face_recognition_enabled=True,
                    qr_code_enabled=True,
                    attendance_window_minutes=30
                )
                
                db.session.add(sample_class)
                db.session.commit()
                print("✅ Sample class created")
            
    except Exception as e:
        print(f"❌ Database initialization failed: {e}")
        sys.exit(1)

def test_backend():
    """Test if the backend starts correctly"""
    print("\n🧪 Testing backend...")
    
    try:
        # Try to import the app
        from app import app
        print("✅ Backend imports successfully")
        
        # Test database connection
        with app.app_context():
            from models import db
            db.session.execute("SELECT 1")
            print("✅ Database connection successful")
            
    except Exception as e:
        print(f"❌ Backend test failed: {e}")
        sys.exit(1)

def print_next_steps():
    """Print next steps for the user"""
    print("\n🎉 Setup Complete!")
    print("=" * 50)
    print("\n📋 Next Steps:")
    print("1. Start the backend server:")
    print("   python app.py")
    print("\n2. The API will be available at:")
    print("   http://localhost:5000")
    print("\n3. Test the API:")
    print("   curl http://localhost:5000/api/health")
    print("\n4. Update your frontend .env file:")
    print("   REACT_APP_API_URL=http://localhost:5000")
    print("\n5. Demo credentials:")
    print("   Admin: admin@attendify.com")
    print("   Faculty: faculty@attendify.com")
    print("   Student: student@attendify.com")
    print("\n📚 Documentation:")
    print("   - Backend API Guide: BACKEND_API_GUIDE.md")
    print("   - Integration Guide: FRONTEND_BACKEND_INTEGRATION.md")
    print("\n🚀 Happy coding!")

def main():
    """Main setup function"""
    print_banner()
    
    # Check if we're in the right directory
    if not Path("app.py").exists():
        print("❌ Please run this script from the attendance-backend directory")
        sys.exit(1)
    
    check_python_version()
    install_requirements()
    create_env_file()
    create_upload_directories()
    initialize_database()
    test_backend()
    print_next_steps()

if __name__ == "__main__":
    main()
