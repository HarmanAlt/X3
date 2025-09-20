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