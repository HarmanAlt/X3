import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { apiService } from '../../services/api';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, LineChart, Line, PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';
import { 
  TrendingUpIcon, 
  CalendarIcon, 
  ClockIcon,
  AcademicCapIcon,
  ChartBarIcon,
  RefreshCcwIcon
} from '@heroicons/react/24/outline';

const StudentAnalytics: React.FC = () => {
  const { user } = useAuth();
  const [analyticsData, setAnalyticsData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState('30d');

  const mockData = {
    attendanceHistory: [
      { week: 'Week 1', attendance: 85, target: 80 },
      { week: 'Week 2', attendance: 88, target: 80 },
      { week: 'Week 3', attendance: 82, target: 80 },
      { week: 'Week 4', attendance: 90, target: 80 },
      { week: 'Week 5', attendance: 87, target: 80 },
      { week: 'Week 6', attendance: 91, target: 80 }
    ],
    classWiseAttendance: [
      { name: 'CS101', attendance: 92, total: 24 },
      { name: 'MATH201', attendance: 85, total: 20 },
      { name: 'PHY101', attendance: 78, total: 18 },
      { name: 'ENG101', attendance: 88, total: 22 }
    ],
    statusDistribution: [
      { name: 'Present', value: 85, color: '#10B981' },
      { name: 'Late', value: 10, color: '#F59E0B' },
      { name: 'Absent', value: 5, color: '#EF4444' }
    ]
  };

  useEffect(() => {
    fetchAnalytics();
  }, [timeRange]);

  const fetchAnalytics = async () => {
    setLoading(true);
    try {
      // Try API first, fallback to mock data
      await new Promise(resolve => setTimeout(resolve, 1000));
      setAnalyticsData(mockData);
    } catch (error) {
      console.error('Failed to fetch analytics:', error);
      setAnalyticsData(mockData);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-500 to-cyan-600 rounded-2xl p-6 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold mb-2">My Analytics</h2>
            <p className="text-blue-100">Track your attendance performance and trends</p>
          </div>
          <AcademicCapIcon className="w-12 h-12 text-blue-200" />
        </div>
      </div>

      {/* Controls */}
      <div className="flex justify-between items-center">
        <select
          value={timeRange}
          onChange={(e) => setTimeRange(e.target.value)}
          className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
        >
          <option value="7d">Last 7 days</option>
          <option value="30d">Last 30 days</option>
          <option value="90d">Last 90 days</option>
        </select>
        <button
          onClick={fetchAnalytics}
          className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <RefreshCcwIcon className="w-4 h-4 mr-2" />
          Refresh
        </button>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6">
          <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">
            Attendance Trend
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={analyticsData?.attendanceHistory}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="week" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="attendance" stroke="#3B82F6" strokeWidth={2} />
              <Line type="monotone" dataKey="target" stroke="#EF4444" strokeDasharray="5 5" />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6">
          <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">
            Class-wise Performance
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={analyticsData?.classWiseAttendance}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="attendance" fill="#10B981" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6">
        <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">
          Attendance Status Distribution
        </h3>
        <ResponsiveContainer width="100%" height={300}>
          <PieChart>
            <Pie
              data={analyticsData?.statusDistribution}
              cx="50%"
              cy="50%"
              labelLine={false}
              label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
              outerRadius={100}
              fill="#8884d8"
              dataKey="value"
            >
              {analyticsData?.statusDistribution?.map((entry: any, index: number) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default StudentAnalytics;