# 🚀 Attendify Backend API Integration Guide

## 📋 Overview

Your Flask backend is a comprehensive attendance management system with the following key features:
- **JWT Authentication** with role-based access control
- **Face Recognition** attendance marking
- **QR Code** attendance marking
- **Class Management** for faculty
- **Analytics & Reporting** for administrators
- **Real-time Dashboard** data

## 🏗️ Backend Architecture

### Core Components
```
attendance-backend/
├── app.py                 # Main Flask application
├── config.py             # Configuration settings
├── models/               # Database models
│   ├── user.py          # User management
│   ├── attendance.py    # Attendance records
│   ├── class_model.py   # Class sessions
│   └── analytics.py     # Analytics & reporting
├── routes/              # API endpoints
│   ├── auth.py         # Authentication
│   ├── attendance.py   # Attendance marking
│   ├── classes.py      # Class management
│   ├── dashboard.py    # Dashboard data
│   ├── analytics.py    # Analytics
│   └── reports.py      # Reports
├── services/           # Business logic
│   ├── face_recognition_service.py
│   └── qr_service.py
└── utils/             # Utilities
    ├── decorators.py
    ├── validators.py
    └── helpers.py
```

## 🔗 API Endpoints

### Base URL
```
Development: http://localhost:5000
Production: https://your-domain.com
```

### Authentication Endpoints (`/api/auth`)

#### 1. Login
```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "student@attendify.com",
  "role": "student"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "user": {
      "id": 1,
      "email": "student@attendify.com",
      "name": "Student Name",
      "role": "student"
    },
    "access_token": "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9...",
    "token_type": "Bearer",
    "expires_in": 86400
  },
  "message": "Login successful"
}
```

#### 2. Verify Token
```http
GET /api/auth/verify
Authorization: Bearer <token>
```

#### 3. Face Enrollment
```http
POST /api/auth/enroll-face
Authorization: Bearer <token>
Content-Type: application/json

{
  "image": "data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQ..."
}
```

#### 4. Get Profile
```http
GET /api/auth/profile
Authorization: Bearer <token>
```

### Attendance Endpoints (`/api/attendance`)

#### 1. Mark Attendance (Face Recognition)
```http
POST /api/attendance/mark-face
Authorization: Bearer <token>
Content-Type: application/json

{
  "class_id": 1,
  "image": "data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQ..."
}
```

#### 2. Mark Attendance (QR Code)
```http
POST /api/attendance/mark-qr
Authorization: Bearer <token>
Content-Type: application/json

{
  "class_id": 1,
  "qr_token": "abc123def456"
}
```

#### 3. Get Student Attendance
```http
GET /api/attendance/student/1?start_date=2024-01-01&end_date=2024-12-31
Authorization: Bearer <token>
```

#### 4. Get Class Attendance
```http
GET /api/attendance/class/1
Authorization: Bearer <token>
```

### Class Management Endpoints (`/api/classes`)

#### 1. Create Class
```http
POST /api/classes/create
Authorization: Bearer <token>
Content-Type: application/json

{
  "name": "Introduction to Computer Science",
  "subject": "Computer Science",
  "start_time": "2024-01-15T10:00:00Z",
  "end_time": "2024-01-15T11:30:00Z",
  "room": "Room 201",
  "schedule": "Mon, Wed, Fri - 10:00 AM",
  "semester": "Fall 2024",
  "max_students": 50,
  "face_recognition_enabled": true,
  "qr_code_enabled": true,
  "attendance_window_minutes": 30
}
```

#### 2. Get Faculty Classes
```http
GET /api/classes/faculty/1?active_only=true
Authorization: Bearer <token>
```

#### 3. Get Active Classes
```http
GET /api/classes/active
Authorization: Bearer <token>
```

#### 4. Generate QR Code
```http
POST /api/classes/1/generate-qr
Authorization: Bearer <token>
```

### Dashboard Endpoints (`/api/dashboard`)

#### 1. Get Dashboard Overview
```http
GET /api/dashboard/overview
Authorization: Bearer <token>
```

#### 2. Get Student Dashboard
```http
GET /api/dashboard/student/1
Authorization: Bearer <token>
```

#### 3. Get Faculty Dashboard
```http
GET /api/dashboard/faculty/1
Authorization: Bearer <token>
```

#### 4. Get Admin Dashboard
```http
GET /api/dashboard/admin
Authorization: Bearer <token>
```

## 🔧 Frontend Integration

### 1. Update AuthContext

Replace the mock authentication in `src/context/AuthContext.tsx`:

```typescript
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User } from '../types';

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string, role: string) => Promise<boolean>;
  logout: () => void;
  isLoading: boolean;
  token: string | null;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [token, setToken] = useState<string | null>(null);

  useEffect(() => {
    const savedUser = localStorage.getItem('attendify_user');
    const savedToken = localStorage.getItem('attendify_token');
    
    if (savedUser && savedToken) {
      setUser(JSON.parse(savedUser));
      setToken(savedToken);
    }
    setIsLoading(false);
  }, []);

  const login = async (email: string, password: string, role: string): Promise<boolean> => {
    setIsLoading(true);
    
    try {
      const response = await fetch(`${API_BASE_URL}/api/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, role }),
      });

      const data = await response.json();

      if (data.success) {
        const { user: userData, access_token } = data.data;
        setUser(userData);
        setToken(access_token);
        localStorage.setItem('attendify_user', JSON.stringify(userData));
        localStorage.setItem('attendify_token', access_token);
        setIsLoading(false);
        return true;
      }
      
      setIsLoading(false);
      return false;
    } catch (error) {
      console.error('Login error:', error);
      setIsLoading(false);
      return false;
    }
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('attendify_user');
    localStorage.removeItem('attendify_token');
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, isLoading, token }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
```

### 2. Create API Service

Create `src/services/api.ts`:

```typescript
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

class ApiService {
  private token: string | null = null;

  setToken(token: string | null) {
    this.token = token;
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${API_BASE_URL}${endpoint}`;
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      ...options.headers,
    };

    if (this.token) {
      headers.Authorization = `Bearer ${this.token}`;
    }

    const response = await fetch(url, {
      ...options,
      headers,
    });

    if (!response.ok) {
      throw new Error(`API Error: ${response.status}`);
    }

    return response.json();
  }

  // Authentication
  async login(email: string, role: string) {
    return this.request('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, role }),
    });
  }

  async verifyToken() {
    return this.request('/api/auth/verify');
  }

  async enrollFace(image: string) {
    return this.request('/api/auth/enroll-face', {
      method: 'POST',
      body: JSON.stringify({ image }),
    });
  }

  async getProfile() {
    return this.request('/api/auth/profile');
  }

  // Attendance
  async markAttendanceFace(classId: number, image: string) {
    return this.request('/api/attendance/mark-face', {
      method: 'POST',
      body: JSON.stringify({ class_id: classId, image }),
    });
  }

  async markAttendanceQR(classId: number, qrToken: string) {
    return this.request('/api/attendance/mark-qr', {
      method: 'POST',
      body: JSON.stringify({ class_id: classId, qr_token: qrToken }),
    });
  }

  async getStudentAttendance(userId: number, params?: {
    start_date?: string;
    end_date?: string;
    limit?: number;
    offset?: number;
  }) {
    const queryParams = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined) {
          queryParams.append(key, value.toString());
        }
      });
    }
    
    return this.request(`/api/attendance/student/${userId}?${queryParams}`);
  }

  // Classes
  async createClass(classData: {
    name: string;
    subject?: string;
    start_time: string;
    end_time?: string;
    room?: string;
    schedule?: string;
    semester?: string;
    max_students?: number;
    face_recognition_enabled?: boolean;
    qr_code_enabled?: boolean;
    attendance_window_minutes?: number;
  }) {
    return this.request('/api/classes/create', {
      method: 'POST',
      body: JSON.stringify(classData),
    });
  }

  async getFacultyClasses(facultyId: number, activeOnly = false) {
    return this.request(`/api/classes/faculty/${facultyId}?active_only=${activeOnly}`);
  }

  async getActiveClasses() {
    return this.request('/api/classes/active');
  }

  async generateQRCode(classId: number) {
    return this.request(`/api/classes/${classId}/generate-qr`, {
      method: 'POST',
    });
  }

  // Dashboard
  async getDashboardOverview() {
    return this.request('/api/dashboard/overview');
  }

  async getStudentDashboard(userId: number) {
    return this.request(`/api/dashboard/student/${userId}`);
  }

  async getFacultyDashboard(userId: number) {
    return this.request(`/api/dashboard/faculty/${userId}`);
  }

  async getAdminDashboard() {
    return this.request('/api/dashboard/admin');
  }
}

export const apiService = new ApiService();
```

### 3. Update Environment Variables

Create `.env` file in your React project root:

```env
REACT_APP_API_URL=http://localhost:5000
REACT_APP_FACE_RECOGNITION_TOLERANCE=0.6
REACT_APP_QR_CODE_EXPIRY_MINUTES=30
```

### 4. Update App.tsx

```typescript
import React, { useEffect } from 'react';
import { AuthProvider } from './context/AuthContext';
import { AppProvider } from './context/AppContext';
import { apiService } from './services/api';
import { useAuth } from './context/AuthContext';

// ... your existing components

function App() {
  return (
    <AuthProvider>
      <AppProvider>
        <AppContent />
      </AppProvider>
    </AuthProvider>
  );
}

function AppContent() {
  const { token, setToken } = useAuth();

  useEffect(() => {
    // Set token in API service when it changes
    apiService.setToken(token);
  }, [token]);

  // ... rest of your app
}

export default App;
```

## 🚀 Running the Backend

### 1. Install Dependencies
```bash
cd attendance-backend
pip install -r requirements.txt
```

### 2. Set Environment Variables
Create `.env` file in `attendance-backend/`:

```env
SECRET_KEY=your-secret-key-here
JWT_SECRET_KEY=your-jwt-secret-key-here
DATABASE_URL=sqlite:///attendance.db
FACE_RECOGNITION_TOLERANCE=0.6
QR_CODE_EXPIRY_MINUTES=30
```

### 3. Run the Backend
```bash
python app.py
```

The API will be available at `http://localhost:5000`

## 🔐 Authentication Flow

1. **Login**: User provides email and role
2. **Token Generation**: Backend creates JWT token
3. **Token Storage**: Frontend stores token in localStorage
4. **API Requests**: Token sent in Authorization header
5. **Token Verification**: Backend validates token on each request

## 📊 Data Flow

### Student Flow
1. Login → Get JWT token
2. Enroll face → Store face encoding
3. View active classes → Get class list
4. Mark attendance → Submit face/QR data
5. View dashboard → Get attendance stats

### Faculty Flow
1. Login → Get JWT token
2. Create class → Generate QR code
3. View classes → Get class management
4. Monitor attendance → Real-time updates
5. Generate reports → Analytics data

### Admin Flow
1. Login → Get JWT token
2. View system overview → All data
3. Manage users → User management
4. View analytics → System statistics
5. Generate reports → Comprehensive reports

## 🛠️ Key Features

### Face Recognition
- **Enrollment**: Users enroll their face once
- **Recognition**: Real-time face matching during attendance
- **Confidence Scoring**: Accuracy measurement
- **Photo Storage**: Attendance photos saved

### QR Code System
- **Dynamic Generation**: Unique codes per class
- **Time-based Expiry**: Codes expire after class window
- **Secure Validation**: Token-based verification
- **Real-time Updates**: Live QR code generation

### Analytics & Reporting
- **Attendance Trends**: Historical data analysis
- **Risk Students**: Low attendance identification
- **Class Statistics**: Performance metrics
- **Real-time Dashboard**: Live updates

## 🔧 Configuration

### Database
- **Development**: SQLite (default)
- **Production**: PostgreSQL recommended
- **Migrations**: Automatic table creation

### Security
- **JWT Tokens**: 24-hour expiry
- **CORS**: Configured for frontend domains
- **File Uploads**: 16MB limit for photos
- **Input Validation**: Comprehensive validation

### Performance
- **Connection Pooling**: Database optimization
- **Caching**: Redis recommended for production
- **File Storage**: Local or cloud storage
- **CDN**: For static assets

## 📱 Mobile Support

The API is designed to work with mobile apps:
- **RESTful Design**: Standard HTTP methods
- **JSON Responses**: Lightweight data format
- **Image Upload**: Base64 or multipart support
- **Offline Support**: Token-based authentication

## 🚨 Error Handling

All endpoints return consistent error responses:

```json
{
  "success": false,
  "error": "Error message",
  "code": "ERROR_CODE",
  "timestamp": "2024-01-15T10:00:00Z"
}
```

Common error codes:
- `UNAUTHORIZED`: Invalid or missing token
- `FORBIDDEN`: Insufficient permissions
- `NOT_FOUND`: Resource not found
- `VALIDATION_ERROR`: Invalid input data
- `FACE_NOT_RECOGNIZED`: Face recognition failed
- `QR_CODE_EXPIRED`: QR code has expired

## 🔄 Real-time Updates

For real-time features, consider adding:
- **WebSocket Support**: Live attendance updates
- **Server-Sent Events**: Dashboard updates
- **Push Notifications**: Mobile alerts
- **Webhook Integration**: External system updates

This comprehensive backend provides everything needed for a modern attendance management system with face recognition, QR codes, and detailed analytics!
