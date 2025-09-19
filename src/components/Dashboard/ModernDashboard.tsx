import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useApp } from '../../context/AppContext';
import {
  HomeIcon,
  UserGroupIcon,
  CalendarIcon,
  ChartBarIcon,
  DocumentTextIcon,
  CogIcon,
  QrCodeIcon,
  CameraIcon,
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  ClockIcon,
  SparklesIcon
} from '@heroicons/react/24/outline';

interface ModernDashboardProps {
  setActiveSection: (section: string) => void;
}

const ModernDashboard: React.FC<ModernDashboardProps> = ({ setActiveSection }) => {
  const { user } = useAuth();
  const { students, classes, attendanceRecords } = useApp();

  const stats = [
    {
      title: 'Overall Attendance',
      value: '87.5%',
      change: '+2.3%',
      trend: 'up',
      icon: ArrowTrendingUpIcon,
      color: 'from-green-500 to-emerald-600',
      bgColor: 'bg-green-50',
      textColor: 'text-green-600'
    },
    {
      title: 'Total Students',
      value: students.length.toString(),
      change: '+12',
      trend: 'up',
      icon: UserGroupIcon,
      color: 'from-blue-500 to-cyan-600',
      bgColor: 'bg-blue-50',
      textColor: 'text-blue-600'
    },
    {
      title: 'Active Classes',
      value: classes.length.toString(),
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

  return (
    <div className="space-y-8">
      {/* Welcome Header */}
      <div className="bg-gradient-to-r from-indigo-500 to-purple-600 rounded-3xl p-8 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold mb-2">
              Welcome back, {user?.name}! 👋
            </h1>
            <p className="text-indigo-100 text-lg">
              {new Date().toLocaleDateString('en-US', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric'
              })}
            </p>
          </div>
          <div className="hidden md:block">
            <div className="w-24 h-24 bg-white/20 rounded-2xl flex items-center justify-center">
              <HomeIcon className="w-12 h-12 text-white" />
            </div>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        {stats.map((stat, index) => (
          <div key={index} className="bg-white rounded-2xl p-4 sm:p-6 shadow-lg border border-gray-100 hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
            <div className="flex items-center justify-between mb-4">
              <div className={`w-10 sm:w-12 h-10 sm:h-12 ${stat.bgColor} rounded-xl flex items-center justify-center`}>
                <stat.icon className={`w-5 sm:w-6 h-5 sm:h-6 ${stat.textColor}`} />
              </div>
              <div className={`flex items-center space-x-1 text-sm ${stat.trend === 'up' ? 'text-green-600' : 'text-red-600'}`}>
                {stat.trend === 'up' ? (
                  <ArrowTrendingUpIcon className="w-4 h-4" />
                ) : (
                  <ArrowTrendingDownIcon className="w-4 h-4" />
                )}
                <span className="font-medium">{stat.change}</span>
              </div>
            </div>
            <h3 className="text-xl sm:text-2xl font-bold text-gray-800 mb-1">{stat.value}</h3>
            <p className="text-sm sm:text-base text-gray-600 font-medium">{stat.title}</p>
          </div>
        ))}
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-2xl p-4 sm:p-8 shadow-lg border border-gray-100">
        <h2 className="text-xl sm:text-2xl font-bold text-gray-800 mb-4 sm:mb-6">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {quickActions.map((action, index) => (
            <button
              key={index}
              onClick={action.action}
              className="group p-4 sm:p-6 bg-gradient-to-br from-gray-50 to-gray-100 rounded-2xl hover:shadow-lg transition-all duration-300 hover:-translate-y-1 border border-gray-200"
            >
              <div className={`w-10 sm:w-12 h-10 sm:h-12 bg-gradient-to-br ${action.color} rounded-xl flex items-center justify-center mb-3 sm:mb-4 group-hover:scale-110 transition-transform duration-300`}>
                <action.icon className="w-5 sm:w-6 h-5 sm:h-6 text-white" />
              </div>
              <h3 className="text-sm sm:text-base font-bold text-gray-800 mb-2">{action.title}</h3>
              <p className="text-gray-600 text-xs sm:text-sm">{action.description}</p>
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* AI Insights */}
        <div className="bg-white rounded-2xl p-4 sm:p-8 shadow-lg border border-gray-100">
          <div className="flex items-center mb-6">
            <SparklesIcon className="w-5 sm:w-6 h-5 sm:h-6 text-indigo-600 mr-2" />
            <h2 className="text-xl sm:text-2xl font-bold text-gray-800">AI Insights</h2>
          </div>
          <div className="space-y-4">
            {aiInsights.map((insight, index) => (
              <div key={index} className="p-4 bg-gradient-to-r from-indigo-50 to-purple-50 rounded-xl border border-indigo-100">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-sm sm:text-base font-semibold text-gray-800">{insight.title}</h3>
                  <insight.icon className={`w-5 h-5 ${insight.color}`} />
                </div>
                <p className="text-xl sm:text-2xl font-bold text-gray-800 mb-1">{insight.value}</p>
                <p className="text-gray-600 text-xs sm:text-sm">{insight.description}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Activity */}
        <div className="bg-white rounded-2xl p-4 sm:p-8 shadow-lg border border-gray-100">
          <h2 className="text-xl sm:text-2xl font-bold text-gray-800 mb-4 sm:mb-6">Recent Activity</h2>
          <div className="space-y-4">
            {recentActivity.map((activity, index) => (
              <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full flex items-center justify-center">
                    <span className="text-white font-semibold text-sm">
                      {activity.student.split(' ').map(n => n[0]).join('')}
                    </span>
                  </div>
                  <div>
                    <p className="text-sm sm:text-base font-semibold text-gray-800">{activity.student}</p>
                    <p className="text-gray-600 text-xs sm:text-sm">{activity.class} • {activity.time}</p>
                  </div>
                </div>
                <div className={`px-3 py-1 rounded-full text-xs font-semibold ${
                  activity.status === 'present' ? 'bg-green-100 text-green-800' :
                  activity.status === 'late' ? 'bg-yellow-100 text-yellow-800' :
                  'bg-red-100 text-red-800'
                }`}>
                  {activity.status}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Attendance Summary Chart Placeholder */}
      <div className="bg-white rounded-2xl p-4 sm:p-8 shadow-lg border border-gray-100">
        <h2 className="text-xl sm:text-2xl font-bold text-gray-800 mb-4 sm:mb-6">Attendance Summary</h2>
        <div className="h-48 sm:h-64 bg-gradient-to-br from-indigo-50 to-purple-50 rounded-xl flex items-center justify-center border border-indigo-100">
          <div className="text-center">
            <ChartBarIcon className="w-12 sm:w-16 h-12 sm:h-16 text-indigo-400 mx-auto mb-4" />
            <p className="text-sm sm:text-base text-gray-600 font-medium">Interactive charts will be displayed here</p>
            <p className="text-gray-500 text-xs sm:text-sm mt-2">Weekly attendance trends and analytics</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ModernDashboard;