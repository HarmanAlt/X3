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

  const getStudentAttendance = async (userId: number, params?: {
    start_date?: string;
    end_date?: string;
    limit?: number;
    offset?: number;
  }) => {
    try {
      setLoading(true);
      setError(null);
      const result = await apiService.getStudentAttendance(userId, params);
      return result;
    } catch (err: any) {
      setError(err.message);
      return null;
    } finally {
      setLoading(false);
    }
  };

  const getClassAttendance = async (classId: number) => {
    try {
      setLoading(true);
      setError(null);
      const result = await apiService.getClassAttendance(classId);
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
    getStudentAttendance,
    getClassAttendance,
    loading,
    error
  };
};
