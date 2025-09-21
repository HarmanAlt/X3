import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User } from '../types';
import { apiService } from '../services/api';

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

  const login = async (email: string, _password: string, role: string): Promise<boolean> => {
    setIsLoading(true);
    console.log('🔐 Attempting login with:', { email, role });
    
    try {
      // Use the mock API service
      const data = await apiService.login(email, role);
      console.log('📥 Received response:', data);

      if (data.success) {
        const { user: userData, access_token } = data.data;
        console.log('✅ Login successful, user data:', userData);
        setUser(userData);
        setToken(access_token);
        localStorage.setItem('attendify_user', JSON.stringify(userData));
        localStorage.setItem('attendify_token', access_token);
        setIsLoading(false);
        return true;
      }
      
      console.log('❌ Login failed:', data);
      setIsLoading(false);
      return false;
    } catch (error) {
      console.error('💥 Login error:', error);
      setIsLoading(false);
      return false;
    }
  };

  const enrollFace = async (image: string): Promise<boolean> => {
    try {
      const data = await apiService.enrollFace(image);
      return data.success;
    } catch (error) {
      console.error('Face enrollment error:', error);
      return false;
    }
  };

  const getFaceStatus = async () => {
    try {
      const data = await apiService.getFaceStatus();
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