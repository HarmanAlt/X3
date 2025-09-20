import { useState, useEffect } from 'react';
import { apiService } from '../services/api';
import { useAuth } from '../context/AuthContext';

export const useClasses = () => {
  const [classes, setClasses] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { user, token } = useAuth();

  useEffect(() => {
    if (token) {
      apiService.setToken(token);
    }
  }, [token]);

  const fetchActiveClasses = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await apiService.getActiveClasses();
      setClasses(data.data.active_classes || []);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchUpcomingClasses = async (hoursAhead = 24) => {
    try {
      setLoading(true);
      setError(null);
      const data = await apiService.getUpcomingClasses(hoursAhead);
      setClasses(data.data.upcoming_classes || []);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchFacultyClasses = async (facultyId: number, activeOnly = false) => {
    try {
      setLoading(true);
      setError(null);
      const data = await apiService.getFacultyClasses(facultyId, activeOnly);
      setClasses(data.data.classes || []);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const createClass = async (classData: {
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
  }) => {
    try {
      setLoading(true);
      setError(null);
      const result = await apiService.createClass(classData);
      if (result.success) {
        // Refresh classes list
        if (user?.role === 'faculty') {
          await fetchFacultyClasses(parseInt(user.id));
        } else {
          await fetchActiveClasses();
        }
      }
      return result;
    } catch (err: any) {
      setError(err.message);
      return null;
    } finally {
      setLoading(false);
    }
  };

  const generateQRCode = async (classId: number) => {
    try {
      setLoading(true);
      setError(null);
      const result = await apiService.generateQRCode(classId);
      return result;
    } catch (err: any) {
      setError(err.message);
      return null;
    } finally {
      setLoading(false);
    }
  };

  const getClassDetails = async (classId: number) => {
    try {
      setLoading(true);
      setError(null);
      const result = await apiService.getClassDetails(classId);
      return result;
    } catch (err: any) {
      setError(err.message);
      return null;
    } finally {
      setLoading(false);
    }
  };

  const updateClassSettings = async (classId: number, settings: any) => {
    try {
      setLoading(true);
      setError(null);
      const result = await apiService.updateClassSettings(classId, settings);
      return result;
    } catch (err: any) {
      setError(err.message);
      return null;
    } finally {
      setLoading(false);
    }
  };

  return {
    classes,
    loading,
    error,
    fetchActiveClasses,
    fetchUpcomingClasses,
    fetchFacultyClasses,
    createClass,
    generateQRCode,
    getClassDetails,
    updateClassSettings
  };
};
