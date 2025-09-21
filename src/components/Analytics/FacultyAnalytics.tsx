import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useApp } from '../../context/AppContext';
import { apiService } from '../../services/api';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, LineChart, Line, ResponsiveContainer, AreaChart, Area } from 'recharts';
import { 
  AcademicCapIcon, 
  UserGroupIcon, 
  TrendingUpIcon,
  CalendarIcon,
  ClockIcon,
  RefreshCcwIcon,
  ChartBarIcon
} from '@heroicons/react/24/outline';

const FacultyAnalytics: React.FC = () => {
  const { user } = useAuth();
  const { classes } = useApp();
  const [analyticsData, setAnalyticsData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [selectedClass, setSelectedClass] = useState('all');

  const mockData = {
    classPerformance: [
      { name: 'CS101', avgAttendance: 87, sessions: 24, students: 30 },
      { name: 'CS201', avgAttendance: 92, sessions: 20, students: 25 },
      { name: 'MATH301', avgAttendance: 78, sessions: 18, students: 28 }
    ],
    weeklyTrends: [
      { week: 'Week 1', CS101: 85, CS201: 90, MATH301: 75 },
      { week: 'Week 2', CS101: 88, CS201: 92, MATH301: 78 },
      { week: 'Week 3', CS101: 82, CS201: 89, MATH301: 80 },
      { week: 'Week 4', CS101: 90, CS201: 94, MATH301: 82 },
      { week: 'Week 5', CS101: 87, CS201: 91, MATH301: 79 }
    ],
    dailyPatterns: [
      { day: 'Monday', attendance: 88, classes: 3 },
      { day: 'Tuesday', attendance: 85, classes: 2 },
      { day: 'Wednesday', attendance: 92, classes: 4 },
      { day: 'Thursday', attendance: 87, classes: 3 },
      { day: 'Friday', attendance: 83, classes: 2 }
    ],
    studentRisk: [
      { name: 'John Smith', attendance: 65, classes: 'CS101', risk: 'high' },
      { name: 'Alice Johnson', attendance: 70, classes: 'CS201', risk: 'medium' },
      { name: 'Bob Wilson', attendance: 68, classes: 'MATH301', risk: 'high' }
    ]
  };

  useEffect(() => {
    fetchAnalytics();
  }, [selectedClass]);

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
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-green-500 to-emerald-600 rounded-2xl p-6 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold mb-2">Faculty Analytics</h2>
            <p className="text-green-100">Monitor class performance and student engagement</p>
          </div>
          <AcademicCapIcon className="w-12 h-12 text-green-200" />
        </div>
      </div>

      {/* Controls */}
      <div className="flex justify-between items-center">
        <select
          value={selectedClass}
          onChange={(e) => setSelectedClass(e.target.value)}
          className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 dark:bg-gray-700 dark:text-white"
        >
          <option value="all">All Classes</option>
          {classes.map((cls) => (
            <option key={cls.id} value={cls.id}>{cls.name}</option>
          ))}
        </select>
        <button
          onClick={fetchAnalytics}
          className="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
        >
          <RefreshCcwIcon className="w-4 h-4 mr-2" />
          Refresh
        </button>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Average Attendance</p>
              <p className="text-2xl font-semibold text-gray-900 dark:text-white">85.7%</p>
            </div>
            <TrendingUpIcon className="h-8 w-8 text-green-500" />
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Sessions</p>
              <p className="text-2xl font-semibold text-gray-900 dark:text-white">62</p>
            </div>
            <CalendarIcon className="h-8 w-8 text-blue-500" />
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">At Risk Students</p>
              <p className="text-2xl font-semibold text-gray-900 dark:text-white">3</p>
            </div>
            <UserGroupIcon className="h-8 w-8 text-orange-500" />
          </div>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6">
          <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">
            Class Performance
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={analyticsData?.classPerformance}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="avgAttendance" fill="#10B981" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6">
          <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">
            Weekly Trends
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={analyticsData?.weeklyTrends}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="week" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="CS101" stroke="#3B82F6" />
              <Line type="monotone" dataKey="CS201" stroke="#10B981" />
              <Line type="monotone" dataKey="MATH301" stroke="#F59E0B" />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* At Risk Students */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6">
        <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">
          Students Requiring Attention
        </h3>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead className="bg-gray-50 dark:bg-gray-700">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">
                  Student
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">
                  Class
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">
                  Attendance
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">
                  Risk Level
                </th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
              {analyticsData?.studentRisk?.map((student: any, index: number) => (
                <tr key={index}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                    {student.name}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                    {student.classes}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                    {student.attendance}%
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                      student.risk === 'high' ? 'bg-red-100 text-red-800' : 'bg-yellow-100 text-yellow-800'
                    }`}>
                      {student.risk}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default FacultyAnalytics;