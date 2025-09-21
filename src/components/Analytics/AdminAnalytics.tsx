import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useApp } from '../../context/AppContext';
import { apiService } from '../../services/api';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, LineChart, Line, PieChart, Pie, Cell, ResponsiveContainer, AreaChart, Area } from 'recharts';
import { 
  CogIcon, 
  UserGroupIcon, 
  CalendarIcon,
  TrendingUpIcon,
  TrendingDownIcon,
  AlertTriangleIcon,
  ChartBarIcon,
  RefreshCcwIcon,
  AcademicCapIcon
} from '@heroicons/react/24/outline';

const AdminAnalytics: React.FC = () => {
  const { user } = useAuth();
  const { students, classes, faculty } = useApp();
  const [analyticsData, setAnalyticsData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState('30d');
  const [selectedMetric, setSelectedMetric] = useState('overview');

  const mockData = {
    systemOverview: {
      total_students: students.length,
      total_faculty: faculty.length,
      total_classes: classes.length,
      overall_attendance_rate: 87.5,
      active_sessions: 5,
      system_uptime: 99.9
    },
    departmentPerformance: [
      { name: 'Computer Science', attendance: 87, students: 45, faculty: 8 },
      { name: 'Mathematics', attendance: 82, students: 38, faculty: 6 },
      { name: 'Physics', attendance: 79, students: 32, faculty: 5 },
      { name: 'English', attendance: 85, students: 41, faculty: 7 }
    ],
    monthlyTrends: [
      { month: 'Jan', attendance: 85, students: 150, classes: 45 },
      { month: 'Feb', attendance: 87, students: 155, classes: 47 },
      { month: 'Mar', attendance: 83, students: 148, classes: 44 },
      { month: 'Apr', attendance: 89, students: 162, classes: 50 },
      { month: 'May', attendance: 91, students: 168, classes: 52 }
    ],
    riskAnalysis: [
      { level: 'Critical', count: 8, percentage: 5.3 },
      { level: 'High', count: 15, percentage: 10.0 },
      { level: 'Medium', count: 22, percentage: 14.7 },
      { level: 'Low', count: 105, percentage: 70.0 }
    ],
    systemMetrics: [
      { metric: 'API Response Time', value: '120ms', status: 'good' },
      { metric: 'Database Performance', value: '98.5%', status: 'excellent' },
      { metric: 'Storage Usage', value: '45%', status: 'good' },
      { metric: 'Active Users', value: '234', status: 'good' }
    ]
  };

  useEffect(() => {
    fetchAnalytics();
  }, [timeRange, selectedMetric]);

  const fetchAnalytics = async () => {
    setLoading(true);
    try {
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
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-500 to-pink-600 rounded-2xl p-6 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold mb-2">System Analytics</h2>
            <p className="text-purple-100">Comprehensive insights across all departments and users</p>
          </div>
          <CogIcon className="w-12 h-12 text-purple-200" />
        </div>
      </div>

      {/* Controls */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex flex-wrap gap-2">
          <select
            value={selectedMetric}
            onChange={(e) => setSelectedMetric(e.target.value)}
            className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 dark:bg-gray-700 dark:text-white"
          >
            <option value="overview">System Overview</option>
            <option value="departments">Department Analysis</option>
            <option value="trends">Trends & Patterns</option>
            <option value="risk">Risk Assessment</option>
          </select>
          
          <select
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value)}
            className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 dark:bg-gray-700 dark:text-white"
          >
            <option value="7d">Last 7 days</option>
            <option value="30d">Last 30 days</option>
            <option value="90d">Last 90 days</option>
            <option value="1y">Last year</option>
          </select>
        </div>

        <button
          onClick={fetchAnalytics}
          className="flex items-center px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
        >
          <RefreshCcwIcon className="w-4 h-4 mr-2" />
          Refresh
        </button>
      </div>

      {/* System Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Students</p>
              <p className="text-2xl font-semibold text-gray-900 dark:text-white">
                {analyticsData?.systemOverview?.total_students}
              </p>
            </div>
            <UserGroupIcon className="h-8 w-8 text-blue-500" />
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Faculty</p>
              <p className="text-2xl font-semibold text-gray-900 dark:text-white">
                {analyticsData?.systemOverview?.total_faculty}
              </p>
            </div>
            <AcademicCapIcon className="h-8 w-8 text-green-500" />
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Active Classes</p>
              <p className="text-2xl font-semibold text-gray-900 dark:text-white">
                {analyticsData?.systemOverview?.total_classes}
              </p>
            </div>
            <CalendarIcon className="h-8 w-8 text-purple-500" />
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">System Uptime</p>
              <p className="text-2xl font-semibold text-gray-900 dark:text-white">
                {analyticsData?.systemOverview?.system_uptime}%
              </p>
            </div>
            <TrendingUpIcon className="h-8 w-8 text-orange-500" />
          </div>
        </div>
      </div>

      {selectedMetric === 'overview' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6">
            <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">
              Department Performance
            </h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={analyticsData?.departmentPerformance}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="attendance" fill="#8B5CF6" />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6">
            <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">
              Monthly Trends
            </h3>
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={analyticsData?.monthlyTrends}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Area type="monotone" dataKey="attendance" stroke="#8B5CF6" fill="#8B5CF6" fillOpacity={0.3} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {selectedMetric === 'risk' && (
        <div className="space-y-6">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6">
            <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white flex items-center">
              <AlertTriangleIcon className="h-5 w-5 text-orange-500 mr-2" />
              Risk Level Distribution
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              {analyticsData?.riskAnalysis?.map((risk: any, index: number) => (
                <div key={index} className={`p-4 rounded-xl border ${
                  risk.level === 'Critical' ? 'bg-red-50 border-red-200 dark:bg-red-900/20 dark:border-red-800' :
                  risk.level === 'High' ? 'bg-orange-50 border-orange-200 dark:bg-orange-900/20 dark:border-orange-800' :
                  risk.level === 'Medium' ? 'bg-yellow-50 border-yellow-200 dark:bg-yellow-900/20 dark:border-yellow-800' :
                  'bg-green-50 border-green-200 dark:bg-green-900/20 dark:border-green-800'
                }`}>
                  <p className={`text-2xl font-bold ${
                    risk.level === 'Critical' ? 'text-red-600' :
                    risk.level === 'High' ? 'text-orange-600' :
                    risk.level === 'Medium' ? 'text-yellow-600' :
                    'text-green-600'
                  }`}>
                    {risk.count}
                  </p>
                  <p className="text-sm font-medium text-gray-700 dark:text-gray-300">{risk.level} Risk</p>
                  <p className="text-xs text-gray-600 dark:text-gray-400">{risk.percentage}%</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* System Metrics */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6">
        <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">
          System Performance Metrics
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {analyticsData?.systemMetrics?.map((metric: any, index: number) => (
            <div key={index} className="p-4 bg-gray-50 dark:bg-gray-700 rounded-xl">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">{metric.metric}</p>
                  <p className="text-lg font-bold text-gray-900 dark:text-white">{metric.value}</p>
                </div>
                <div className={`w-3 h-3 rounded-full ${
                  metric.status === 'excellent' ? 'bg-green-500' :
                  metric.status === 'good' ? 'bg-blue-500' :
                  'bg-yellow-500'
                }`}></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default AdminAnalytics;