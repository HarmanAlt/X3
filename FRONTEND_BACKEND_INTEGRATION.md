# 🔗 Frontend-Backend Integration Guide

## 🚀 Quick Start Integration

### Step 1: Update Your AuthContext

Replace your current `src/context/AuthContext.tsx` with this API-integrated version:

```typescript
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User } from '../types';

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string, role: string) => Promise<boolean>;
  logout: () => void;
  isLoading: boolean;
  token: string | null;
  enrollFace: (image: string) => Promise<boolean>;
  getFaceStatus: () => Promise<any>;
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

  const makeApiRequest = async (endpoint: string, options: RequestInit = {}) => {
    const url = `${API_BASE_URL}${endpoint}`;
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      ...options.headers,
    };

    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }

    const response = await fetch(url, {
      ...options,
      headers,
    });

    if (!response.ok) {
      throw new Error(`API Error: ${response.status}`);
    }

    return response.json();
  };

  const login = async (email: string, password: string, role: string): Promise<boolean> => {
    setIsLoading(true);
    
    try {
      const data = await makeApiRequest('/api/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email, role }),
      });

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

  const enrollFace = async (image: string): Promise<boolean> => {
    try {
      const data = await makeApiRequest('/api/auth/enroll-face', {
        method: 'POST',
        body: JSON.stringify({ image }),
      });

      return data.success;
    } catch (error) {
      console.error('Face enrollment error:', error);
      return false;
    }
  };

  const getFaceStatus = async () => {
    try {
      const data = await makeApiRequest('/api/auth/face-status');
      return data.data;
    } catch (error) {
      console.error('Face status error:', error);
      return null;
    }
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('attendify_user');
    localStorage.removeItem('attendify_token');
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      login, 
      logout, 
      isLoading, 
      token, 
      enrollFace, 
      getFaceStatus 
    }}>
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

### Step 2: Create API Service

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
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || `API Error: ${response.status}`);
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

  async getFaceStatus() {
    return this.request('/api/auth/face-status');
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

  async getClassAttendance(classId: number) {
    return this.request(`/api/attendance/class/${classId}`);
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

  async getUpcomingClasses(hoursAhead = 24) {
    return this.request(`/api/classes/upcoming?hours_ahead=${hoursAhead}`);
  }

  async generateQRCode(classId: number) {
    return this.request(`/api/classes/${classId}/generate-qr`, {
      method: 'POST',
    });
  }

  async getClassDetails(classId: number) {
    return this.request(`/api/classes/${classId}`);
  }

  async updateClassSettings(classId: number, settings: any) {
    return this.request(`/api/classes/${classId}/settings`, {
      method: 'PUT',
      body: JSON.stringify(settings),
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

  // Analytics
  async getAttendanceTrends(classId?: number, days = 30) {
    const params = classId ? `?class_id=${classId}&days=${days}` : `?days=${days}`;
    return this.request(`/api/analytics/trends${params}`);
  }

  async getRiskStudents(threshold = 60.0, days = 30) {
    return this.request(`/api/analytics/risk-students?threshold=${threshold}&days=${days}`);
  }

  // Reports
  async generateAttendanceReport(classId: number, startDate: string, endDate: string) {
    return this.request(`/api/reports/attendance?class_id=${classId}&start_date=${startDate}&end_date=${endDate}`);
  }

  async generateStudentReport(userId: number, startDate: string, endDate: string) {
    return this.request(`/api/reports/student?user_id=${userId}&start_date=${startDate}&end_date=${endDate}`);
  }
}

export const apiService = new ApiService();
```

### Step 3: Update Your Components

#### Update ModernLoginPage.tsx

Add API integration to your login form:

```typescript
// In your handleSubmit function, replace the mock login with:
const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  setError('');
  
  if (!isFormValid) {
    setError('Please fill in all fields correctly.');
    return;
  }
  
  try {
    const success = await login(formData.email, formData.password, formData.role);
    if (!success) {
      setError('Invalid credentials. Please try again.');
    }
  } catch (error) {
    setError('Login failed. Please try again.');
  }
};
```

#### Update Dashboard Components

Create `src/hooks/useDashboard.ts`:

```typescript
import { useState, useEffect } from 'react';
import { apiService } from '../services/api';
import { useAuth } from '../context/AuthContext';

export const useDashboard = () => {
  const [dashboardData, setDashboardData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user, token } = useAuth();

  useEffect(() => {
    if (token) {
      apiService.setToken(token);
      fetchDashboardData();
    }
  }, [token, user]);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const data = await apiService.getDashboardOverview();
      setDashboardData(data.data);
    } catch (err) {
      setError('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  return { dashboardData, loading, error, refetch: fetchDashboardData };
};
```

#### Update Attendance Components

Create `src/hooks/useAttendance.ts`:

```typescript
import { useState } from 'react';
import { apiService } from '../services/api';

export const useAttendance = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const markAttendanceFace = async (classId: number, image: string) => {
    try {
      setLoading(true);
      setError(null);
      const result = await apiService.markAttendanceFace(classId, image);
      return result;
    } catch (err: any) {
      setError(err.message);
      return null;
    } finally {
      setLoading(false);
    }
  };

  const markAttendanceQR = async (classId: number, qrToken: string) => {
    try {
      setLoading(true);
      setError(null);
      const result = await apiService.markAttendanceQR(classId, qrToken);
      return result;
    } catch (err: any) {
      setError(err.message);
      return null;
    } finally {
      setLoading(false);
    }
  };

  return {
    markAttendanceFace,
    markAttendanceQR,
    loading,
    error
  };
};
```

### Step 4: Environment Setup

Create `.env` file in your React project root:

```env
REACT_APP_API_URL=http://localhost:5000
REACT_APP_FACE_RECOGNITION_TOLERANCE=0.6
REACT_APP_QR_CODE_EXPIRY_MINUTES=30
```

### Step 5: Update App.tsx

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
  const { token } = useAuth();

  useEffect(() => {
    // Set token in API service when it changes
    apiService.setToken(token);
  }, [token]);

  // ... rest of your app
}

export default App;
```

## 🚀 Running the Complete System

### 1. Start the Backend
```bash
cd attendance-backend
python app.py
```

### 2. Start the Frontend
```bash
npm start
```

### 3. Test the Integration

1. **Login**: Use the demo credentials
   - Admin: `admin@attendify.com`
   - Faculty: `faculty@attendify.com`
   - Student: `student@attendify.com`

2. **Face Enrollment**: Go to face enrollment page and test

3. **Class Management**: Create classes as faculty

4. **Attendance Marking**: Test both face and QR code methods

## 🔧 Troubleshooting

### Common Issues

1. **CORS Errors**: Make sure backend CORS is configured for your frontend URL
2. **Token Issues**: Check if token is being sent in headers
3. **API Errors**: Check browser network tab for detailed error messages
4. **Face Recognition**: Ensure face images are properly encoded

### Debug Tips

1. **Check Network Tab**: Look for failed requests
2. **Console Logs**: Check for JavaScript errors
3. **Backend Logs**: Check Flask console for server errors
4. **Database**: Ensure database is properly initialized

## 📱 Mobile Integration

For mobile apps, the same API endpoints work with:
- **React Native**: Use fetch or axios
- **Flutter**: Use http package
- **Native iOS/Android**: Use standard HTTP libraries

## 🔐 Security Considerations

1. **HTTPS**: Use HTTPS in production
2. **Token Expiry**: Implement token refresh
3. **Input Validation**: Validate all inputs
4. **File Uploads**: Sanitize uploaded images
5. **Rate Limiting**: Implement API rate limiting

This integration guide provides everything you need to connect your beautiful frontend with the powerful backend API!
