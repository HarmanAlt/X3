# 🚀 Attendify Quick Start Guide

## 🎯 Get Your Full-Stack App Running in 5 Minutes!

### Prerequisites
- Python 3.8+ installed
- Node.js 16+ installed
- Git installed

## 🏃‍♂️ Quick Setup

### 1. Backend Setup (2 minutes)

```bash
# Navigate to backend directory
cd attendance-backend

# Run the setup script
python setup_backend.py

# Start the backend server
python app.py
```

**✅ Backend will be running at:** `http://localhost:5000`

### 2. Frontend Setup (2 minutes)

```bash
# Navigate to frontend directory (from X3 root)
cd src

# Install dependencies (if not already done)
npm install

# Create environment file
echo "REACT_APP_API_URL=http://localhost:5000" > .env

# Start the frontend
npm start
```

**✅ Frontend will be running at:** `http://localhost:3000`

### 3. Test the Integration (1 minute)

1. **Open your browser** to `http://localhost:3000`
2. **Login** with demo credentials:
   - **Admin**: `admin@attendify.com` / `password123`
   - **Faculty**: `faculty@attendify.com` / `password123`
   - **Student**: `student@attendify.com` / `password123`
3. **Test features**:
   - Create classes (as faculty)
   - Mark attendance (as student)
   - View analytics (as admin)

## 🔧 What You Get

### Backend Features
- ✅ **JWT Authentication** with role-based access
- ✅ **Face Recognition** attendance marking
- ✅ **QR Code** attendance system
- ✅ **Class Management** for faculty
- ✅ **Analytics & Reporting** for admins
- ✅ **Real-time Dashboard** data
- ✅ **RESTful API** with comprehensive endpoints

### Frontend Features
- ✅ **Modern UI** with glassmorphism design
- ✅ **Responsive Design** for all devices
- ✅ **Dark Mode** support
- ✅ **Real-time Updates** and animations
- ✅ **Face Recognition** integration
- ✅ **QR Code Scanner** functionality
- ✅ **Role-based Dashboards**

## 📱 Demo Credentials

| Role | Email | Password | Access Level |
|------|-------|----------|--------------|
| **Admin** | admin@attendify.com | password123 | Full system access |
| **Faculty** | faculty@attendify.com | password123 | Class management |
| **Student** | student@attendify.com | password123 | Attendance marking |

## 🎮 Try These Features

### As a Student:
1. **Login** with student credentials
2. **Enroll your face** for recognition
3. **View active classes** on dashboard
4. **Mark attendance** using face or QR code
5. **Check attendance history**

### As Faculty:
1. **Login** with faculty credentials
2. **Create a new class** session
3. **Generate QR code** for attendance
4. **Monitor attendance** in real-time
5. **View class analytics**

### As Admin:
1. **Login** with admin credentials
2. **View system overview** dashboard
3. **Monitor all classes** and attendance
4. **Generate reports** and analytics
5. **Manage users** and settings

## 🔗 API Endpoints

Your backend provides these key endpoints:

### Authentication
- `POST /api/auth/login` - User login
- `GET /api/auth/verify` - Verify token
- `POST /api/auth/enroll-face` - Face enrollment

### Attendance
- `POST /api/attendance/mark-face` - Face recognition attendance
- `POST /api/attendance/mark-qr` - QR code attendance
- `GET /api/attendance/student/{id}` - Student attendance history

### Classes
- `POST /api/classes/create` - Create class
- `GET /api/classes/active` - Get active classes
- `POST /api/classes/{id}/generate-qr` - Generate QR code

### Dashboard
- `GET /api/dashboard/overview` - Get dashboard data
- `GET /api/dashboard/admin` - Admin dashboard
- `GET /api/dashboard/faculty/{id}` - Faculty dashboard

## 🛠️ Customization

### Backend Configuration
Edit `attendance-backend/.env`:
```env
# Change these for production
SECRET_KEY=your-secret-key
JWT_SECRET_KEY=your-jwt-secret
DATABASE_URL=sqlite:///attendance.db

# Adjust face recognition sensitivity
FACE_RECOGNITION_TOLERANCE=0.6

# Set QR code expiry time
QR_CODE_EXPIRY_MINUTES=30
```

### Frontend Configuration
Edit `src/.env`:
```env
# Backend API URL
REACT_APP_API_URL=http://localhost:5000

# Face recognition settings
REACT_APP_FACE_RECOGNITION_TOLERANCE=0.6
```

## 🚨 Troubleshooting

### Common Issues

**Backend won't start:**
```bash
# Check Python version
python --version

# Install requirements manually
pip install -r requirements.txt

# Check if port 5000 is free
netstat -an | grep 5000
```

**Frontend can't connect to backend:**
```bash
# Check if backend is running
curl http://localhost:5000/api/health

# Check CORS settings in backend
# Make sure frontend URL is in CORS_ORIGINS
```

**Face recognition not working:**
```bash
# Install face recognition dependencies
pip install face-recognition opencv-python

# Check if camera permissions are granted
```

### Database Issues
```bash
# Reset database
rm attendance.db
python setup_backend.py
```

## 📚 Next Steps

1. **Read the full documentation:**
   - `BACKEND_API_GUIDE.md` - Complete API reference
   - `FRONTEND_BACKEND_INTEGRATION.md` - Integration details

2. **Customize for your needs:**
   - Add your own user management
   - Customize the UI theme
   - Add more analytics features

3. **Deploy to production:**
   - Use PostgreSQL for database
   - Set up HTTPS
   - Configure proper CORS
   - Add rate limiting

## 🎉 You're All Set!

Your full-stack attendance management system is now running with:
- ✅ **Modern React frontend** with beautiful UI
- ✅ **Powerful Flask backend** with comprehensive APIs
- ✅ **Face recognition** and QR code attendance
- ✅ **Real-time analytics** and reporting
- ✅ **Role-based access control**

**Happy coding! 🚀**
