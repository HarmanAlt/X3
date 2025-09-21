import React, { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useApp } from '../../context/AppContext';
import { useDashboard } from '../../hooks/useDashboard';
import AttendanceSummary from './AttendanceSummary';
import {
  HomeIcon,
  UserGroupIcon,
  CalendarIcon,
  ChartBarIcon,
  DocumentTextIcon,
  QrCodeIcon,
  CameraIcon,
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon,
  ExclamationTriangleIcon,
  ClockIcon,
  SparklesIcon
} from '@heroicons/react/24/outline';

interface ModernDashboardProps {
  setActiveSection: (section: string) => void;
}

const ModernDashboard: React.FC<ModernDashboardProps> = ({ setActiveSection }) => {
  const { user } = useAuth();
  const { students, classes } = useApp();
  const { dashboardData, loading, error } = useDashboard();

  // Use real data from API or fallback to mock data
  const stats = [
    {
      title: 'Overall Attendance',
      value: dashboardData?.statistics?.attendance_rate ? `${dashboardData.statistics.attendance_rate}%` : '87.5%',
      change: '+2.3%',
      trend: 'up',
      icon: ArrowTrendingUpIcon,
      color: 'from-green-500 to-emerald-600',
      bgColor: 'bg-green-50',
      textColor: 'text-green-600'
    },
    {
      title: 'Total Students',
      value: dashboardData?.statistics?.total_students ? dashboardData.statistics.total_students.toString() : students.length.toString(),
      change: '+12',
      trend: 'up',
      icon: UserGroupIcon,
      color: 'from-blue-500 to-cyan-600',
      bgColor: 'bg-blue-50',
      textColor: 'text-blue-600'
    },
    {
      title: 'Active Classes',
      value: dashboardData?.statistics?.active_classes ? dashboardData.statistics.active_classes.toString() : classes.length.toString(),
      change: '+3',
      trend: 'up',
      icon: CalendarIcon,
      color: 'from-purple-500 to-pink-600',
      bgColor: 'bg-purple-50',
      textColor: 'text-purple-600'
    },
    {
      title: 'At Risk Students',
      value: '8',
      change: '-2',
      trend: 'down',
      icon: ExclamationTriangleIcon,
      color: 'from-orange-500 to-red-600',
      bgColor: 'bg-orange-50',
      textColor: 'text-orange-600'
    }
  ];

  const quickActions = [
    {
      title: 'Start Class Session',
      description: 'Begin attendance tracking',
      icon: QrCodeIcon,
      color: 'from-indigo-500 to-purple-600',
      action: () => setActiveSection('attendance')
    },
    {
      title: 'Face Recognition',
      description: 'AI-powered check-in',
      icon: CameraIcon,
      color: 'from-green-500 to-emerald-600',
      action: () => setActiveSection('attendance')
    },
    {
      title: 'Generate Report',
      description: 'Export attendance data',
      icon: DocumentTextIcon,
      color: 'from-blue-500 to-cyan-600',
      action: () => setActiveSection('reports')
    },
    {
      title: 'View Analytics',
      description: 'Attendance insights',
      icon: ChartBarIcon,
      color: 'from-purple-500 to-pink-600',
      action: () => setActiveSection('analytics')
    }
  ];

  const aiInsights = [
    {
      title: 'Predicted Absentees Today',
      value: '12 students',
      description: 'Based on historical patterns',
      icon: SparklesIcon,
      color: 'text-orange-600'
    },
    {
      title: 'Attendance Trend',
      value: 'Improving',
      description: '+5% from last week',
      icon: ArrowTrendingUpIcon,
      color: 'text-green-600'
    },
    {
      title: 'Peak Attendance Time',
      value: '10:00 AM',
      description: 'Optimal class scheduling',
      icon: ClockIcon,
      color: 'text-blue-600'
    }
  ];

  const recentActivity = [
    { student: 'John Smith', class: 'CS101', time: '10:30 AM', status: 'present' },
    { student: 'Alice Johnson', class: 'MATH201', time: '10:28 AM', status: 'present' },
    { student: 'Bob Wilson', class: 'PHY101', time: '10:25 AM', status: 'late' },
    { student: 'Carol Davis', class: 'CS101', time: '10:22 AM', status: 'present' }
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <div className="text-red-500 text-lg mb-4">Failed to load dashboard data</div>
        <p className="text-gray-600 dark:text-gray-300">{error}</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Welcome Header */}
      <div className="bg-gradient-to-r from-indigo-500 to-purple-600 dark:from-indigo-600 dark:to-purple-700 rounded-3xl p-8 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold mb-2">
              Welcome back, {user?.name}! 👋
            </h1>
            <p className="text-indigo-100 dark:text-indigo-200 text-lg">
              {new Date().toLocaleDateString('en-US', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric'
              })}
            </p>
          </div>
          <div className="hidden md:block">
            <div className="w-24 h-24 bg-white/20 dark:bg-white/30 rounded-2xl flex items-center justify-center">
              <HomeIcon className="w-12 h-12 text-white" />
            </div>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        {stats.map((stat, index) => (
          <div key={index} className="bg-white dark:bg-gray-800 rounded-2xl p-4 sm:p-6 shadow-lg border border-gray-100 dark:border-gray-700 hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
            <div className="flex items-center justify-between mb-4">
              <div className={`w-10 sm:w-12 h-10 sm:h-12 ${stat.bgColor} dark:bg-opacity-80 rounded-xl flex items-center justify-center`}>
                <stat.icon className={`w-5 sm:w-6 h-5 sm:h-6 ${stat.textColor}`} />
              </div>
              <div className={`flex items-center space-x-1 text-sm ${stat.trend === 'up' ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                {stat.trend === 'up' ? (
                  <ArrowTrendingUpIcon className="w-4 h-4" />
                ) : (
                  <ArrowTrendingDownIcon className="w-4 h-4" />
                )}
                <span className="font-medium">{stat.change}</span>
              </div>
            </div>
            <h3 className="text-xl sm:text-2xl font-bold text-gray-800 dark:text-gray-100 mb-1">{stat.value}</h3>
            <p className="text-sm sm:text-base text-gray-600 dark:text-gray-300 font-medium">{stat.title}</p>
          </div>
        ))}
      </div>

      {/* Quick Actions */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl p-4 sm:p-8 shadow-lg border border-gray-100 dark:border-gray-700">
        <h2 className="text-xl sm:text-2xl font-bold text-gray-800 dark:text-gray-100 mb-4 sm:mb-6">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {quickActions.map((action, index) => (
            <button
              key={index}
              onClick={action.action}
              className="group p-4 sm:p-6 bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-700 dark:to-gray-600 rounded-2xl hover:shadow-lg transition-all duration-300 hover:-translate-y-1 border border-gray-200 dark:border-gray-600"
            >
              <div className={`w-10 sm:w-12 h-10 sm:h-12 bg-gradient-to-br ${action.color} rounded-xl flex items-center justify-center mb-3 sm:mb-4 group-hover:scale-110 transition-transform duration-300`}>
                <action.icon className="w-5 sm:w-6 h-5 sm:h-6 text-white" />
              </div>
              <h3 className="text-sm sm:text-base font-bold text-gray-800 dark:text-gray-100 mb-2">{action.title}</h3>
              <p className="text-gray-600 dark:text-gray-300 text-xs sm:text-sm">{action.description}</p>
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* AI Insights */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-4 sm:p-8 shadow-lg border border-gray-100 dark:border-gray-700">
          <div className="flex items-center mb-6">
            <SparklesIcon className="w-5 sm:w-6 h-5 sm:h-6 text-indigo-600 dark:text-indigo-400 mr-2" />
            <h2 className="text-xl sm:text-2xl font-bold text-gray-800 dark:text-gray-100">AI Insights</h2>
          </div>
          <div className="space-y-4">
            {aiInsights.map((insight, index) => (
              <div key={index} className="p-4 bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-indigo-900/30 dark:to-purple-900/30 rounded-xl border border-indigo-100 dark:border-indigo-800">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-sm sm:text-base font-semibold text-gray-800 dark:text-gray-100">{insight.title}</h3>
                  <insight.icon className={`w-5 h-5 ${insight.color}`} />
                </div>
                <p className="text-xl sm:text-2xl font-bold text-gray-800 dark:text-gray-100 mb-1">{insight.value}</p>
                <p className="text-gray-600 dark:text-gray-300 text-xs sm:text-sm">{insight.description}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Activity */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-4 sm:p-8 shadow-lg border border-gray-100 dark:border-gray-700">
          <h2 className="text-xl sm:text-2xl font-bold text-gray-800 dark:text-gray-100 mb-4 sm:mb-6">Recent Activity</h2>
          <div className="space-y-4">
            {recentActivity.map((activity, index) => (
              <div key={index} className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-xl">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full flex items-center justify-center">
                    <span className="text-white font-semibold text-sm">
                      {activity.student.split(' ').map(n => n[0]).join('')}
                    </span>
                  </div>
                  <div>
                    <p className="text-sm sm:text-base font-semibold text-gray-800 dark:text-gray-100">{activity.student}</p>
                    <p className="text-gray-600 dark:text-gray-300 text-xs sm:text-sm">{activity.class} • {activity.time}</p>
                  </div>
                </div>
                <div className={`px-3 py-1 rounded-full text-xs font-semibold ${
                  activity.status === 'present' ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300' :
                  activity.status === 'late' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300' :
                  'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300'
                }`}>
                  {activity.status}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Attendance Summary Chart Placeholder */}
      <AttendanceSummary setActiveSection={setActiveSection} />
    </div>
  );
};

export default ModernDashboard;