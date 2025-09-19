import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { useApp } from '../../context/AppContext';
import { 
  Users, 
  Calendar, 
  TrendingUp, 
  AlertCircle,
  CheckCircle2,
  Clock,
  BarChart3
} from 'lucide-react';

interface DashboardProps {
  setActiveSection: (section: string) => void;
}

const Dashboard: React.FC<DashboardProps> = ({ setActiveSection }) => {
  const { user } = useAuth();
  const { students, classes, attendanceRecords, activeSession } = useApp();

  const getTodayAttendance = () => {
    const today = new Date().toISOString().split('T')[0];
    return attendanceRecords.filter(record => record.date === today);
  };

  const getAttendanceStats = () => {
    const totalStudents = students.length;
    const todayAttendance = getTodayAttendance();
    const presentToday = todayAttendance.filter(record => record.status === 'present').length;
    const attendanceRate = totalStudents > 0 ? (presentToday / totalStudents) * 100 : 0;
    
    return {
      totalStudents,
      presentToday,
      attendanceRate: Math.round(attendanceRate * 100) / 100
    };
  };

  const stats = getAttendanceStats();

  const StatCard: React.FC<{
    title: string;
    value: string | number;
    subtitle?: string;
    icon: React.ComponentType<any>;
    color: string;
    onClick?: () => void;
  }> = ({ title, value, subtitle, icon: Icon, color, onClick }) => (
    <div 
      className={`bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 cursor-pointer transform hover:scale-105 transition-all duration-200 ${onClick ? 'hover:shadow-lg' : ''}`}
      onClick={onClick}
    >
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600 dark:text-gray-400">{title}</p>
          <p className="text-2xl font-semibold text-gray-900 dark:text-white">{value}</p>
          {subtitle && <p className="text-sm text-gray-500 dark:text-gray-400">{subtitle}</p>}
        </div>
        <div className={`p-3 rounded-full ${color}`}>
          <Icon className="h-6 w-6 text-white" />
        </div>
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
          Welcome back, {user?.name}!
        </h1>
        <div className="text-sm text-gray-500 dark:text-gray-400">
          {new Date().toLocaleDateString('en-US', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric'
          })}
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Total Students"
          value={stats.totalStudents}
          icon={Users}
          color="bg-blue-500"
          onClick={() => setActiveSection('students')}
        />
        <StatCard
          title="Present Today"
          value={stats.presentToday}
          subtitle={`${stats.attendanceRate}% attendance rate`}
          icon={CheckCircle2}
          color="bg-green-500"
          onClick={() => setActiveSection('attendance')}
        />
        <StatCard
          title="Total Classes"
          value={classes.length}
          icon={Calendar}
          color="bg-purple-500"
          onClick={() => setActiveSection('classes')}
        />
        <StatCard
          title="Active Sessions"
          value={activeSession ? 1 : 0}
          subtitle={activeSession ? 'Class in progress' : 'No active sessions'}
          icon={Clock}
          color={activeSession ? "bg-orange-500" : "bg-gray-500"}
          onClick={() => setActiveSession('attendance')}
        />
      </div>

      {/* Role-specific content */}
      {user?.role === 'faculty' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Quick Actions
            </h3>
            <div className="space-y-3">
              <button
                onClick={() => setActiveSection('attendance')}
                className="w-full flex items-center justify-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors duration-200"
              >
                <CheckCircle2 className="h-4 w-4 mr-2" />
                Start New Class Session
              </button>
              <button
                onClick={() => setActiveSection('reports')}
                className="w-full flex items-center justify-center px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors duration-200"
              >
                <BarChart3 className="h-4 w-4 mr-2" />
                Generate Attendance Report
              </button>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              My Classes
            </h3>
            <div className="space-y-2">
              {classes.slice(0, 3).map((cls) => (
                <div key={cls.id} className="flex items-center justify-between p-2 bg-gray-50 dark:bg-gray-700 rounded">
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white">{cls.name}</p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">{cls.schedule}</p>
                  </div>
                  <span className="text-sm text-blue-600 dark:text-blue-400">
                    {cls.studentIds.length} students
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {user?.role === 'student' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              My Attendance
            </h3>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-gray-600 dark:text-gray-400">Overall Attendance</span>
                <span className="text-xl font-bold text-green-600">87.5%</span>
              </div>
              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                <div className="bg-green-600 h-2 rounded-full" style={{ width: '87.5%' }}></div>
              </div>
              <button
                onClick={() => setActiveSection('attendance')}
                className="w-full flex items-center justify-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors duration-200"
              >
                <TrendingUp className="h-4 w-4 mr-2" />
                View Detailed Attendance
              </button>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Enrolled Classes
            </h3>
            <div className="space-y-2">
              {classes.slice(0, 3).map((cls) => (
                <div key={cls.id} className="flex items-center justify-between p-2 bg-gray-50 dark:bg-gray-700 rounded">
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white">{cls.name}</p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">{cls.schedule}</p>
                  </div>
                  <CheckCircle2 className="h-5 w-5 text-green-500" />
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {user?.role === 'admin' && (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            System Overview
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
              <Users className="h-8 w-8 text-blue-600 mx-auto mb-2" />
              <p className="text-2xl font-bold text-blue-600">{students.length}</p>
              <p className="text-sm text-gray-600 dark:text-gray-400">Active Students</p>
            </div>
            <div className="text-center p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
              <Calendar className="h-8 w-8 text-green-600 mx-auto mb-2" />
              <p className="text-2xl font-bold text-green-600">{classes.length}</p>
              <p className="text-sm text-gray-600 dark:text-gray-400">Total Classes</p>
            </div>
            <div className="text-center p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
              <TrendingUp className="h-8 w-8 text-purple-600 mx-auto mb-2" />
              <p className="text-2xl font-bold text-purple-600">{stats.attendanceRate}%</p>
              <p className="text-sm text-gray-600 dark:text-gray-400">Avg Attendance</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;