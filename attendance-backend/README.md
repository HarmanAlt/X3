# Attendify Backend API

A complete Flask backend API for the Attendify student attendance monitoring system with face recognition and QR code capabilities.

## 🚀 Features

### Core Functionality
- **JWT-based Authentication** with role-based access control
- **Face Recognition** using face-api.js and OpenCV
- **QR Code Generation** for attendance marking
- **Dual Attendance Methods** (Face recognition + QR code)
- **Real-time Analytics** and reporting
- **RESTful API** with comprehensive endpoints

### User Roles
- **Students**: Mark attendance, view personal dashboard
- **Faculty**: Manage classes, monitor attendance, generate reports
- **Admins**: System-wide management and analytics

## 📁 Project Structure

```
attendance-backend/
├── app.py                 # Main Flask application
├── config.py             # Configuration settings
├── requirements.txt       # Python dependencies
├── env.example           # Environment variables template
├── models/               # Database models
│   ├── __init__.py
│   ├── user.py          # User model with roles
│   ├── attendance.py    # Attendance tracking
│   ├── class_model.py   # Class sessions
│   └── analytics.py     # Analytics and reporting
├── routes/              # API endpoints
│   ├── __init__.py
│   ├── auth.py         # Authentication routes
│   ├── attendance.py    # Attendance management
│   ├── dashboard.py     # Dashboard data
│   ├── analytics.py    # Analytics endpoints
│   ├── classes.py       # Class management
│   ├── students.py     # Student management
│   ├── faculty.py      # Faculty management
│   └── reports.py      # Report generation
├── services/            # Business logic services
│   ├── __init__.py
│   ├── face_recognition_service.py  # Face recognition
│   └── qr_service.py               # QR code generation
├── utils/               # Utility functions
│   ├── __init__.py
│   ├── validators.py    # Input validation
│   ├── helpers.py       # Helper functions
│   └── decorators.py    # Custom decorators
└── database/            # Database configuration
    ├── __init__.py
    └── migrations/      # Database migrations
```

## 🛠️ Installation

### Prerequisites
- Python 3.8+
- pip
- SQLite (default) or PostgreSQL/MySQL

### Setup

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd attendance-backend
   ```

2. **Create virtual environment**
   ```bash
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   ```

3. **Install dependencies**
   ```bash
   pip install -r requirements.txt
   ```

4. **Set up environment variables**
   ```bash
   cp env.example .env
   # Edit .env with your configuration
   ```

5. **Initialize database**
   ```bash
   python app.py
   # This will create the database tables
   ```

6. **Run the application**
   ```bash
   python app.py
   # Or for production:
   gunicorn --bind 0.0.0.0:5000 app:app
   ```

## 🔧 Configuration

### Environment Variables

Create a `.env` file based on `env.example`:

```env
# Flask Configuration
SECRET_KEY=your-secret-key-here
JWT_SECRET_KEY=your-jwt-secret-key-here

# Database Configuration
DATABASE_URL=sqlite:///attendance.db

# Face Recognition Settings
FACE_RECOGNITION_TOLERANCE=0.6
FACE_RECOGNITION_MODEL=hog

# QR Code Settings
QR_CODE_EXPIRY_MINUTES=30
```

### Database Options

**SQLite (Default)**
```env
DATABASE_URL=sqlite:///attendance.db
```

**PostgreSQL**
```env
DATABASE_URL=postgresql://username:password@localhost/attendance_db
```

**MySQL**
```env
DATABASE_URL=mysql://username:password@localhost/attendance_db
```

## 📚 API Documentation

### Authentication Endpoints

#### Login
```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "student@example.com",
  "role": "student"
}
```

#### Verify Token
```http
GET /api/auth/verify
Authorization: Bearer <jwt_token>
```

#### Face Enrollment
```http
POST /api/auth/enroll-face
Authorization: Bearer <jwt_token>
Content-Type: application/json

{
  "image": "data:image/jpeg;base64,..."
}
```

### Attendance Endpoints

#### Mark Attendance (Face Recognition)
```http
POST /api/attendance/mark-face
Authorization: Bearer <jwt_token>
Content-Type: application/json

{
  "class_id": 1,
  "image": "data:image/jpeg;base64,..."
}
```

#### Mark Attendance (QR Code)
```http
POST /api/attendance/mark-qr
Authorization: Bearer <jwt_token>
Content-Type: application/json

{
  "class_id": 1,
  "qr_token": "abc123..."
}
```

#### Get Student Attendance
```http
GET /api/attendance/student/1?start_date=2024-01-01&end_date=2024-01-31
Authorization: Bearer <jwt_token>
```

### Class Management Endpoints

#### Create Class
```http
POST /api/classes/create
Authorization: Bearer <jwt_token>
Content-Type: application/json

{
  "name": "Computer Science 101",
  "start_time": "2024-01-15T10:00:00Z",
  "end_time": "2024-01-15T11:00:00Z",
  "room": "Room 201",
  "face_recognition_enabled": true,
  "qr_code_enabled": true
}
```

#### Generate QR Code
```http
POST /api/classes/1/generate-qr
Authorization: Bearer <jwt_token>
```

### Dashboard Endpoints

#### Student Dashboard
```http
GET /api/dashboard/student/1
Authorization: Bearer <jwt_token>
```

#### Faculty Dashboard
```http
GET /api/dashboard/faculty/1
Authorization: Bearer <jwt_token>
```

#### Admin Dashboard
```http
GET /api/dashboard/admin
Authorization: Bearer <jwt_token>
```

### Analytics Endpoints

#### Attendance Trends
```http
GET /api/analytics/attendance-trends?class_id=1&days=30
Authorization: Bearer <jwt_token>
```

#### Risk Students
```http
GET /api/analytics/risk-students?threshold=60&days=30
Authorization: Bearer <jwt_token>
```

## 🔐 Authentication & Authorization

### JWT Token Structure
```json
{
  "sub": "user_id",
  "role": "student|faculty|admin",
  "name": "User Name",
  "iat": 1640995200,
  "exp": 1641081600
}
```

### Role-Based Access Control

- **Students**: Can access their own data and mark attendance
- **Faculty**: Can manage their classes and view student data
- **Admins**: Full system access

### Protected Routes
All routes except `/api/auth/login` require a valid JWT token in the Authorization header:
```
Authorization: Bearer <jwt_token>
```

## 🎯 Face Recognition

### Features
- **Face Detection**: Detects faces in uploaded images
- **Face Encoding**: Converts faces to numerical encodings
- **Face Matching**: Compares faces with stored encodings
- **Liveness Detection**: Basic anti-spoofing measures
- **Quality Validation**: Ensures image quality for recognition

### Usage
1. Student enrolls face via `/api/auth/enroll-face`
2. During attendance, face is captured and compared
3. Confidence score determines acceptance threshold
4. Attendance is marked if confidence > threshold

## 📱 QR Code System

### Features
- **Dynamic Generation**: QR codes with expiration times
- **Token Validation**: Secure token-based validation
- **Class-Specific**: QR codes tied to specific class sessions
- **Time-Limited**: Automatic expiration for security

### Usage
1. Faculty generates QR code for class session
2. Students scan QR code with mobile device
3. Token is validated against class session
4. Attendance is marked if valid and not expired

## 📊 Analytics & Reporting

### Available Reports
- **Attendance Trends**: Daily/weekly/monthly trends
- **Student Reports**: Individual student performance
- **Class Reports**: Class-wise attendance statistics
- **Faculty Reports**: Faculty teaching analytics
- **System Reports**: Institution-wide statistics

### Export Formats
- JSON (default)
- CSV
- PDF (planned)
- Excel (planned)

## 🚀 Deployment

### Development
```bash
python app.py
```

### Production with Gunicorn
```bash
gunicorn --bind 0.0.0.0:5000 app:app
```

### Docker (Optional)
```dockerfile
FROM python:3.9-slim
WORKDIR /app
COPY requirements.txt .
RUN pip install -r requirements.txt
COPY . .
CMD ["gunicorn", "--bind", "0.0.0.0:5000", "app:app"]
```

## 🔧 Integration with React Frontend

### API Base URL
```javascript
const API_BASE_URL = "http://localhost:5000/api";
```

### Example Integration
```javascript
// Login
const response = await fetch(`${API_BASE_URL}/auth/login`, {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    email: 'student@example.com',
    role: 'student'
  })
});

const data = await response.json();
const token = data.data.access_token;

// Mark attendance
const attendanceResponse = await fetch(`${API_BASE_URL}/attendance/mark-face`, {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  },
  body: JSON.stringify({
    class_id: 1,
    image: base64ImageData
  })
});
```

## 🐛 Error Handling

### Standard Error Response
```json
{
  "success": false,
  "error": "Error message",
  "code": "ERROR_CODE",
  "timestamp": "2024-01-15T10:30:00Z"
}
```

### Common Error Codes
- `UNAUTHORIZED`: Invalid or missing token
- `ACCESS_DENIED`: Insufficient permissions
- `USER_NOT_FOUND`: User doesn't exist
- `CLASS_NOT_FOUND`: Class session doesn't exist
- `FACE_NOT_RECOGNIZED`: Face recognition failed
- `INVALID_QR_CODE`: QR code validation failed

## 📝 Testing

### Manual Testing
Use tools like Postman or curl to test endpoints:

```bash
# Test login
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@attendify.com","role":"admin"}'

# Test protected endpoint
curl -X GET http://localhost:5000/api/dashboard/admin \
  -H "Authorization: Bearer <token>"
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License.

## 🆘 Support

For support and questions:
- Create an issue in the repository
- Check the API documentation
- Review the error logs for debugging

## 🔮 Future Enhancements

- [ ] Real-time WebSocket support
- [ ] Advanced analytics with machine learning
- [ ] Mobile app integration
- [ ] Email notifications
- [ ] Advanced reporting with charts
- [ ] Multi-language support
- [ ] Advanced security features


