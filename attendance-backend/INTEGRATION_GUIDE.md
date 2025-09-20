# React-Flask Integration Guide

This guide explains how to integrate your existing React TypeScript frontend with the new Flask backend API.

## 🔗 Backend Integration

### 1. Update Firebase Configuration

Replace your existing Firebase configuration with API calls to the Flask backend:

**Before (Firebase):**
```typescript
// src/config/firebase.ts
import { initializeApp } from 'firebase/app';
// ... Firebase config
```

**After (Flask API):**
```typescript
// src/config/api.ts
export const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

export const apiClient = {
  async request(endpoint: string, options: RequestInit = {}) {
    const url = `${API_BASE_URL}${endpoint}`;
    const token = localStorage.getItem('attendify_token');
    
    const config: RequestInit = {
      headers: {
        'Content-Type': 'application/json',
        ...(token && { Authorization: `Bearer ${token}` }),
        ...options.headers,
      },
      ...options,
    };
    
    const response = await fetch(url, config);
    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.error || 'API request failed');
    }
    
    return data;
  }
};
```

### 2. Update Authentication Context

**Replace `src/context/AuthContext.tsx`:**

```typescript
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { apiClient } from '../config/api';

interface User {
  id: number;
  email: string;
  name: string;
  role: 'student' | 'faculty' | 'admin';
  is_active: boolean;
  face_enrolled: boolean;
  created_at: string;
  updated_at: string;
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  login: (email: string, role: string) => Promise<void>;
  logout: () => void;
  verifyToken: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const login = async (email: string, role: string) => {
    try {
      const response = await apiClient.request('/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email, role }),
      });

      if (response.success) {
        const { user: userData, access_token } = response.data;
        setUser(userData);
        localStorage.setItem('attendify_token', access_token);
      }
    } catch (error) {
      console.error('Login failed:', error);
      throw error;
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('attendify_token');
  };

  const verifyToken = async () => {
    const token = localStorage.getItem('attendify_token');
    if (!token) {
      setIsLoading(false);
      return;
    }

    try {
      const response = await apiClient.request('/auth/verify');
      if (response.success) {
        setUser(response.data.user);
      }
    } catch (error) {
      console.error('Token verification failed:', error);
      logout();
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    verifyToken();
  }, []);

  return (
    <AuthContext.Provider value={{ user, isLoading, login, logout, verifyToken }}>
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

### 3. Update Attendance Components

**Update `src/components/Attendance/DualAttendanceSystem.tsx`:**

```typescript
import React, { useState, useRef } from 'react';
import { useAuth } from '../../context/AuthContext';
import { apiClient } from '../../config/api';

const DualAttendanceSystem: React.FC = () => {
  const { user } = useAuth();
  const [selectedMethod, setSelectedMethod] = useState<'face' | 'qr'>('face');
  const [isProcessing, setIsProcessing] = useState(false);
  const [message, setMessage] = useState('');
  const [currentClass, setCurrentClass] = useState<any>(null);

  const markAttendance = async (method: 'face' | 'qr', data: any) => {
    setIsProcessing(true);
    setMessage('');

    try {
      const endpoint = method === 'face' ? '/attendance/mark-face' : '/attendance/mark-qr';
      const response = await apiClient.request(endpoint, {
        method: 'POST',
        body: JSON.stringify({
          class_id: currentClass?.id,
          ...data
        }),
      });

      if (response.success) {
        setMessage('Attendance marked successfully!');
      }
    } catch (error: any) {
      setMessage(`Error: ${error.message}`);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleFaceRecognition = async (imageData: string) => {
    await markAttendance('face', { image: imageData });
  };

  const handleQRScan = async (qrToken: string) => {
    await markAttendance('qr', { qr_token: qrToken });
  };

  return (
    <div className="space-y-6">
      {/* Your existing UI components */}
      {/* Update the handlers to use the new API */}
    </div>
  );
};
```

### 4. Update Dashboard Components

**Update `src/components/Dashboard/ModernDashboard.tsx`:**

```typescript
import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { apiClient } from '../../config/api';

const ModernDashboard: React.FC = () => {
  const { user } = useAuth();
  const [dashboardData, setDashboardData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, [user]);

  const fetchDashboardData = async () => {
    if (!user) return;

    try {
      let endpoint = '/dashboard/overview';
      
      // Get specific dashboard based on user role
      if (user.role === 'student') {
        endpoint = `/dashboard/student/${user.id}`;
      } else if (user.role === 'faculty') {
        endpoint = `/dashboard/faculty/${user.id}`;
      } else if (user.role === 'admin') {
        endpoint = '/dashboard/admin';
      }

      const response = await apiClient.request(endpoint);
      
      if (response.success) {
        setDashboardData(response.data);
      }
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div>Loading dashboard...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Your existing dashboard UI */}
      {/* Use dashboardData instead of mock data */}
    </div>
  );
};
```

### 5. Update Teacher Dashboard

**Update `src/components/Teacher/TeacherDashboard.tsx`:**

```typescript
import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { apiClient } from '../../config/api';

const TeacherDashboard: React.FC = () => {
  const { user } = useAuth();
  const [classes, setClasses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user?.role === 'faculty') {
      fetchClasses();
    }
  }, [user]);

  const fetchClasses = async () => {
    try {
      const response = await apiClient.request(`/classes/faculty/${user?.id}`);
      
      if (response.success) {
        setClasses(response.data.classes);
      }
    } catch (error) {
      console.error('Failed to fetch classes:', error);
    } finally {
      setLoading(false);
    }
  };

  const createClass = async (classData: any) => {
    try {
      const response = await apiClient.request('/classes/create', {
        method: 'POST',
        body: JSON.stringify(classData),
      });

      if (response.success) {
        setClasses(prev => [response.data.class_session, ...prev]);
        return response.data.qr_code;
      }
    } catch (error) {
      console.error('Failed to create class:', error);
      throw error;
    }
  };

  const generateQRCode = async (classId: number) => {
    try {
      const response = await apiClient.request(`/classes/${classId}/generate-qr`, {
        method: 'POST',
      });

      if (response.success) {
        return response.data.qr_code;
      }
    } catch (error) {
      console.error('Failed to generate QR code:', error);
      throw error;
    }
  };

  return (
    <div className="space-y-6">
      {/* Your existing teacher dashboard UI */}
      {/* Use classes state and API functions */}
    </div>
  );
};
```

## 🔧 Environment Setup

### 1. Update React Environment Variables

Create/update `.env` file in your React project root:

```env
REACT_APP_API_URL=http://localhost:5000/api
REACT_APP_ENVIRONMENT=development
```

### 2. Update Package.json Scripts

Add API development script:

```json
{
  "scripts": {
    "dev:api": "cd attendance-backend && python app.py",
    "dev:full": "concurrently \"npm start\" \"npm run dev:api\""
  }
}
```

### 3. Install Additional Dependencies

```bash
npm install concurrently
```

## 🚀 Running Both Applications

### Development Mode

1. **Start Flask Backend:**
   ```bash
   cd attendance-backend
   python -m venv venv
   source venv/bin/activate  # Windows: venv\Scripts\activate
   pip install -r requirements.txt
   python app.py
   ```

2. **Start React Frontend:**
   ```bash
   cd ..  # Back to X3 directory
   npm start
   ```

3. **Or run both simultaneously:**
   ```bash
   npm run dev:full
   ```

### Production Deployment

1. **Build React App:**
   ```bash
   npm run build
   ```

2. **Deploy Flask Backend:**
   ```bash
   cd attendance-backend
   gunicorn --bind 0.0.0.0:5000 app:app
   ```

3. **Serve React Build:**
   ```bash
   npx serve -s build -l 3000
   ```

## 🔄 Data Migration

### From Mock Data to Real API

1. **Replace mock data in AppContext:**
   ```typescript
   // Remove mock data and replace with API calls
   const fetchClasses = async () => {
     const response = await apiClient.request('/classes/faculty/1');
     return response.data.classes;
   };
   ```

2. **Update all components to use API data:**
   - Replace hardcoded arrays with API responses
   - Add loading states for async operations
   - Handle error states appropriately

## 🎯 Key Integration Points

### 1. Authentication Flow
- Login → Get JWT token → Store in localStorage
- Include token in all API requests
- Handle token expiration and refresh

### 2. Face Recognition
- Capture image → Convert to base64 → Send to API
- Handle face enrollment and recognition responses
- Display confidence scores and error messages

### 3. QR Code System
- Generate QR codes via API → Display in UI
- Scan QR codes → Send token to API for validation
- Handle QR code expiration and regeneration

### 4. Real-time Updates
- Poll API endpoints for live data
- Update UI when attendance is marked
- Refresh dashboards with latest statistics

## 🐛 Common Issues & Solutions

### CORS Issues
```python
# In Flask app.py, ensure CORS is configured:
CORS(app, origins=['http://localhost:3000', 'http://localhost:5173'])
```

### Token Expiration
```typescript
// Add token refresh logic
const refreshToken = async () => {
  try {
    await apiClient.request('/auth/verify');
  } catch (error) {
    logout(); // Redirect to login
  }
};
```

### Image Upload Issues
```typescript
// Ensure proper base64 encoding
const convertToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = error => reject(error);
  });
};
```

## 📱 Mobile Integration

### Camera Access
```typescript
// For mobile camera access
const getCameraStream = async () => {
  try {
    const stream = await navigator.mediaDevices.getUserMedia({
      video: { facingMode: 'user' }
    });
    return stream;
  } catch (error) {
    console.error('Camera access denied:', error);
  }
};
```

### QR Code Scanning
```typescript
// Use qr-scanner library for mobile
import QrScanner from 'qr-scanner';

const scanQRCode = async (videoElement: HTMLVideoElement) => {
  const scanner = new QrScanner(videoElement, (result) => {
    console.log('QR Code detected:', result.data);
    // Send to API
  });
  
  await scanner.start();
};
```

## 🔒 Security Considerations

1. **HTTPS in Production**: Always use HTTPS for production deployments
2. **Token Security**: Store JWT tokens securely, consider httpOnly cookies
3. **Input Validation**: Validate all user inputs on both frontend and backend
4. **Rate Limiting**: Implement rate limiting for API endpoints
5. **CORS Configuration**: Restrict CORS to specific domains in production

## 📊 Monitoring & Logging

### Frontend Error Handling
```typescript
// Global error handler
window.addEventListener('unhandledrejection', (event) => {
  console.error('Unhandled promise rejection:', event.reason);
  // Send to error tracking service
});
```

### Backend Logging
```python
# In Flask app.py
import logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Log API requests
@app.before_request
def log_request():
    logger.info(f"{request.method} {request.path} from {request.remote_addr}")
```

This integration guide provides everything you need to connect your React frontend with the Flask backend. The backend is production-ready and includes all the features you requested: face recognition, QR codes, analytics, and comprehensive API endpoints.


