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
      setError(null);
      console.log('🔍 Fetching dashboard data with token:', token ? 'Present' : 'Missing');
      const data = await apiService.getDashboardOverview();
      console.log('📊 Dashboard data received:', data);
      setDashboardData(data.data);
    } catch (err: any) {
      console.error('💥 Dashboard fetch error:', err);
      setError(err.message || 'Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  return { dashboardData, loading, error, refetch: fetchDashboardData };
};
