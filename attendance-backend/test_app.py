#!/usr/bin/env python3
"""
Simple test script to check if the app can start
"""

try:
    print("Testing imports...")
    from flask import Flask
    print("✅ Flask imported")
    
    from flask_cors import CORS
    print("✅ Flask-CORS imported")
    
    from flask_jwt_extended import JWTManager
    print("✅ Flask-JWT-Extended imported")
    
    from flask_sqlalchemy import SQLAlchemy
    print("✅ Flask-SQLAlchemy imported")
    
    from dotenv import load_dotenv
    print("✅ python-dotenv imported")
    
    print("\nTesting app creation...")
    app = Flask(__name__)
    print("✅ Flask app created")
    
    print("\nTesting configuration...")
    app.config['SECRET_KEY'] = 'test-secret'
    app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///test.db'
    app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
    app.config['JWT_SECRET_KEY'] = 'test-jwt-secret'
    print("✅ Configuration set")
    
    print("\nTesting extensions...")
    db = SQLAlchemy(app)
    print("✅ SQLAlchemy initialized")
    
    jwt = JWTManager(app)
    print("✅ JWT Manager initialized")
    
    CORS(app)
    print("✅ CORS initialized")
    
    print("\nTesting basic route...")
    @app.route('/test')
    def test():
        return {'status': 'ok', 'message': 'Backend is working!'}
    
    print("✅ Test route created")
    
    print("\n🎉 All tests passed! The backend should work.")
    print("Try running: python app.py")
    
except Exception as e:
    print(f"❌ Error: {e}")
    import traceback
    traceback.print_exc()
