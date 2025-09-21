import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useApp } from '../../context/AppContext';
import { apiService } from '../../services/api';
import { 
  UserCheckIcon, 
  CalendarIcon, 
  ClockIcon, 
  TrendingUpIcon, 
  TrendingDownIcon,
  RefreshCcwIcon,
  AlertTriangleIcon,
  CheckCircleIcon,
  XCircleIcon
} from '@heroicons/react/24/outline';

interface AttendanceSummaryProps {
  setActiveSection: (section: string) => void;
}

const AttendanceSummary: React.FC<AttendanceSummaryProps> = ({ setActiveSection }) => {
  const { user } = useAuth();
  const { students, classes } = useApp();
  const [summaryData, setSummaryData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());

  useEffect(() => {
    fetchAttendanceSummary();
    // Auto-refresh every 30 seconds
    const interval = setInterval(fetchAttendanceSummary, 30000);
    return () => clearInterval(interval);
  }, [user]);

  const fetchAttendanceSummary = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Try to fetch from API, fallback to mock data
      let data;
      try {
        if (user?.role === 'student') {
          data = await apiService.getStudentDashboard(parseInt(user.id));
        } else if (user?.role === 'faculty') {
          data = await apiService.getFacultyDashboard(parseInt(user.id));
        } else {
          data = await apiService.getAdminDashboard();
        }
        setSummaryData(data.data);
      } catch (apiError) {
        // Fallback to mock data
        const mockData = generateMockSummaryData();
        setSummaryData(mockData);
      }
      
      setLastUpdated(new Date());
    } catch (err: any) {
      setError(err.message || 'Failed to load attendance summary');
    } finally {
      setLoading(false);
    }
  };

  const generateMockSummaryData = () => {
    if (user?.role === 'student') {
      return {
        attendance_summary: {
          total_classes: 24,
          attended: 21,
          attendance_rate: 87.5
        },
        recent_attendance: [
          { class_name: 'CS101', date: new Date().toISOString().split('T')[0], status: 'present' },
          { class_name: 'MATH201', date: new Date(Date.now() - 86400000).toISOString().split('T')[0], status: 'present' },
          { class_name: 'PHY101', date: new Date(Date.now() - 172800000).toISOString().split('T')[0], status: 'late' }
        ],
        upcoming_classes: [
          { class_name: 'CS101', time: '10:00 AM', room: 'Room 201' },
          { class_name: 'MATH201', time: '2:00 PM', room: 'Room 301' }
        ]
      };
    } else if (user?.role === 'faculty') {
      return {
        classes: [
          { id: 1, name: 'CS101', total_students: 30, attendance_rate: 87.5 },
          { id: 2, name: 'CS201', total_students: 25, attendance_rate: 92.0 }
        ],
        today_stats: {
          classes_today: 3,
          total_attendance: 67,
          average_attendance: 89.3
        },
        recent_activity: [
          { student: 'John Smith', class: 'CS101', time: '10:30 AM', status: 'present' },
          { student: 'Alice Johnson', class: 'CS201', time: '2:15 PM', status: 'present' }
        ]
      };
    } else {
      return {
        overview: {
          total_students: students.length,
          total_faculty: 25,
          total_classes: classes.length,
          overall_attendance_rate: 87.5
        },
        recent_activity: [
          { type: 'attendance', message: 'John Doe marked present in CS101', timestamp: new Date().toISOString() },
          { type: 'class', message: 'New class CS301 created', timestamp: new Date(Date.now() - 3600000).toISOString() }
        ],
        alerts: [
          { type: 'warning', message: '5 students below 75% attendance', count: 5 },
          { type: 'info', message: '3 classes scheduled today', count: 3 }
        ]
      };
    }
  };

  const renderStudentSummary = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 rounded-2xl p-6 border border-blue-200 dark:border-blue-800">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-blue-600 dark:text-blue-400 text-sm font-medium">Total Classes</p>
              <p className="text-2xl font-bold text-blue-800 dark:text-blue-200">
                {summaryData?.attendance_summary?.total_classes || 0}
              </p>
            </div>
            <CalendarIcon className="h-8 w-8 text-blue-500" />
          </div>
        </div>

        <div className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20 rounded-2xl p-6 border border-green-200 dark:border-green-800">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-green-600 dark:text-green-400 text-sm font-medium">Attended</p>
              <p className="text-2xl font-bold text-green-800 dark:text-green-200">
                {summaryData?.attendance_summary?.attended || 0}
              </p>
            </div>
            <CheckCircleIcon className="h-8 w-8 text-green-500" />
          </div>
        </div>

        <div className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20 rounded-2xl p-6 border border-purple-200 dark:border-purple-800">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-purple-600 dark:text-purple-400 text-sm font-medium">Attendance Rate</p>
              <p className="text-2xl font-bold text-purple-800 dark:text-purple-200">
                {summaryData?.attendance_summary?.attendance_rate?.toFixed(1) || 0}%
              </p>
            </div>
            <TrendingUpIcon className="h-8 w-8 text-purple-500" />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white/60 dark:bg-gray-800/60 backdrop-blur-sm rounded-2xl p-6 border border-white/20 dark:border-gray-700/20">
          <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-100 mb-4">Recent Attendance</h3>
          <div className="space-y-3">
            {summaryData?.recent_attendance?.map((record: any, index: number) => (
              <div key={index} className="flex items-center justify-between p-3 bg-white/40 dark:bg-gray-700/40 rounded-xl">
                <div>
                  <p className="font-medium text-gray-800 dark:text-gray-100">{record.class_name}</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">{record.date}</p>
                </div>
                <div className={`px-3 py-1 rounded-full text-xs font-semibold ${
                  record.status === 'present' ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300' :
                  record.status === 'late' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300' :
                  'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300'
                }`}>
                  {record.status}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white/60 dark:bg-gray-800/60 backdrop-blur-sm rounded-2xl p-6 border border-white/20 dark:border-gray-700/20">
          <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-100 mb-4">Upcoming Classes</h3>
          <div className="space-y-3">
            {summaryData?.upcoming_classes?.map((cls: any, index: number) => (
              <div key={index} className="flex items-center justify-between p-3 bg-white/40 dark:bg-gray-700/40 rounded-xl">
                <div>
                  <p className="font-medium text-gray-800 dark:text-gray-100">{cls.class_name}</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">{cls.room}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-semibold text-indigo-600 dark:text-indigo-400">{cls.time}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );

  const renderFacultySummary = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20 rounded-2xl p-6 border border-green-200 dark:border-green-800">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-green-600 dark:text-green-400 text-sm font-medium">Classes Today</p>
              <p className="text-2xl font-bold text-green-800 dark:text-green-200">
                {summaryData?.today_stats?.classes_today || 0}
              </p>
            </div>
            <CalendarIcon className="h-8 w-8 text-green-500" />
          </div>
        </div>

        <div className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 rounded-2xl p-6 border border-blue-200 dark:border-blue-800">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-blue-600 dark:text-blue-400 text-sm font-medium">Total Attendance</p>
              <p className="text-2xl font-bold text-blue-800 dark:text-blue-200">
                {summaryData?.today_stats?.total_attendance || 0}
              </p>
            </div>
            <UserCheckIcon className="h-8 w-8 text-blue-500" />
          </div>
        </div>

        <div className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20 rounded-2xl p-6 border border-purple-200 dark:border-purple-800">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-purple-600 dark:text-purple-400 text-sm font-medium">Avg Attendance</p>
              <p className="text-2xl font-bold text-purple-800 dark:text-purple-200">
                {summaryData?.today_stats?.average_attendance?.toFixed(1) || 0}%
              </p>
            </div>
            <TrendingUpIcon className="h-8 w-8 text-purple-500" />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white/60 dark:bg-gray-800/60 backdrop-blur-sm rounded-2xl p-6 border border-white/20 dark:border-gray-700/20">
          <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-100 mb-4">My Classes</h3>
          <div className="space-y-3">
            {summaryData?.classes?.map((cls: any) => (
              <div key={cls.id} className="flex items-center justify-between p-3 bg-white/40 dark:bg-gray-700/40 rounded-xl">
                <div>
                  <p className="font-medium text-gray-800 dark:text-gray-100">{cls.name}</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">{cls.total_students} students</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-semibold text-green-600 dark:text-green-400">
                    {cls.attendance_rate?.toFixed(1)}%
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white/60 dark:bg-gray-800/60 backdrop-blur-sm rounded-2xl p-6 border border-white/20 dark:border-gray-700/20">
          <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-100 mb-4">Recent Activity</h3>
          <div className="space-y-3">
            {summaryData?.recent_activity?.map((activity: any, index: number) => (
              <div key={index} className="flex items-center space-x-3 p-3 bg-white/40 dark:bg-gray-700/40 rounded-xl">
                <div className="w-8 h-8 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-full flex items-center justify-center">
                  <span className="text-white font-semibold text-xs">
                    {activity.student?.split(' ').map((n: string) => n[0]).join('') || 'A'}
                  </span>
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-800 dark:text-gray-100">
                    {activity.student || activity.message}
                  </p>
                  <p className="text-xs text-gray-600 dark:text-gray-400">
                    {activity.class} • {activity.time}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );

  const renderAdminSummary = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 rounded-2xl p-6 border border-blue-200 dark:border-blue-800">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-blue-600 dark:text-blue-400 text-sm font-medium">Total Students</p>
              <p className="text-2xl font-bold text-blue-800 dark:text-blue-200">
                {summaryData?.overview?.total_students || students.length}
              </p>
            </div>
            <UserCheckIcon className="h-8 w-8 text-blue-500" />
          </div>
        </div>

        <div className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20 rounded-2xl p-6 border border-green-200 dark:border-green-800">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-green-600 dark:text-green-400 text-sm font-medium">Total Faculty</p>
              <p className="text-2xl font-bold text-green-800 dark:text-green-200">
                {summaryData?.overview?.total_faculty || 25}
              </p>
            </div>
            <UserCheckIcon className="h-8 w-8 text-green-500" />
          </div>
        </div>

        <div className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20 rounded-2xl p-6 border border-purple-200 dark:border-purple-800">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-purple-600 dark:text-purple-400 text-sm font-medium">Total Classes</p>
              <p className="text-2xl font-bold text-purple-800 dark:text-purple-200">
                {summaryData?.overview?.total_classes || classes.length}
              </p>
            </div>
            <CalendarIcon className="h-8 w-8 text-purple-500" />
          </div>
        </div>

        <div className="bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-900/20 dark:to-orange-800/20 rounded-2xl p-6 border border-orange-200 dark:border-orange-800">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-orange-600 dark:text-orange-400 text-sm font-medium">Attendance Rate</p>
              <p className="text-2xl font-bold text-orange-800 dark:text-orange-200">
                {summaryData?.overview?.overall_attendance_rate?.toFixed(1) || 87.5}%
              </p>
            </div>
            <TrendingUpIcon className="h-8 w-8 text-orange-500" />
          </div>
        </div>
      </div>

      {summaryData?.alerts && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {summaryData.alerts.map((alert: any, index: number) => (
            <div key={index} className={`p-4 rounded-2xl border ${
              alert.type === 'warning' 
                ? 'bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800'
                : 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800'
            }`}>
              <div className="flex items-center space-x-3">
                {alert.type === 'warning' ? (
                  <AlertTriangleIcon className="h-6 w-6 text-yellow-600" />
                ) : (
                  <CheckCircleIcon className="h-6 w-6 text-blue-600" />
                )}
                <div>
                  <p className={`font-medium ${
                    alert.type === 'warning' ? 'text-yellow-800 dark:text-yellow-200' : 'text-blue-800 dark:text-blue-200'
                  }`}>
                    {alert.message}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );

  if (loading) {
    return (
      <div className="bg-white/60 dark:bg-gray-800/60 backdrop-blur-sm rounded-2xl p-8 border border-white/20 dark:border-gray-700/20">
        <div className="flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
          <span className="ml-3 text-gray-600 dark:text-gray-300">Loading attendance summary...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50/60 dark:bg-red-900/20 backdrop-blur-sm rounded-2xl p-6 border border-red-200 dark:border-red-800">
        <div className="flex items-center space-x-3">
          <XCircleIcon className="h-6 w-6 text-red-500" />
          <div>
            <p className="font-medium text-red-800 dark:text-red-200">Failed to load attendance summary</p>
            <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
          </div>
          <button
            onClick={fetchAttendanceSummary}
            className="ml-auto p-2 text-red-600 hover:text-red-800 transition-colors"
          >
            <RefreshCcwIcon className="h-5 w-5" />
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100">Attendance Summary</h2>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Last updated: {lastUpdated.toLocaleTimeString()}
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <button
            onClick={fetchAttendanceSummary}
            className="p-2 text-gray-600 dark:text-gray-300 hover:text-gray-800 dark:hover:text-gray-100 hover:bg-white/20 dark:hover:bg-gray-800/20 rounded-xl transition-all duration-200"
            aria-label="Refresh data"
          >
            <RefreshCcwIcon className="h-5 w-5" />
          </button>
          <button
            onClick={() => setActiveSection('analytics')}
            className="px-4 py-2 bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-xl font-medium hover:shadow-lg hover:scale-105 transition-all duration-200"
          >
            View Analytics
          </button>
        </div>
      </div>

      {/* Role-specific content */}
      {user?.role === 'student' && renderStudentSummary()}
      {user?.role === 'faculty' && renderFacultySummary()}
      {user?.role === 'admin' && renderAdminSummary()}
    </div>
  );
};

export default AttendanceSummary;