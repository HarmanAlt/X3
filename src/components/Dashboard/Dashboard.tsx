import React from "react";
import { useAuth } from "../../context/AuthContext";
import { useApp } from "../../context/AppContext";
import {
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
  SparklesIcon,
  HomeIcon,
} from "@heroicons/react/24/outline";

interface DashboardProps {
  setActiveSection: (section: string) => void;
}

const Dashboard: React.FC<DashboardProps> = ({ setActiveSection }) => {
  const { user } = useAuth();
  const { students, classes } = useApp();

  const stats = [
    {
      title: "Overall Attendance",
      value: "87.5%",
      change: "+2.3%",
      trend: "up",
      icon: ArrowTrendingUpIcon,
      bg: "bg-green-100 dark:bg-green-900/30",
      color: "text-green-600 dark:text-green-400",
    },
    {
      title: "Total Students",
      value: students.length.toString(),
      change: "+12",
      trend: "up",
      icon: UserGroupIcon,
      bg: "bg-blue-100 dark:bg-blue-900/30",
      color: "text-blue-600 dark:text-blue-400",
    },
    {
      title: "Active Classes",
      value: classes.length.toString(),
      change: "+3",
      trend: "up",
      icon: CalendarIcon,
      bg: "bg-purple-100 dark:bg-purple-900/30",
      color: "text-purple-600 dark:text-purple-400",
    },
    {
      title: "At Risk Students",
      value: "8",
      change: "-2",
      trend: "down",
      icon: ExclamationTriangleIcon,
      bg: "bg-orange-100 dark:bg-orange-900/30",
      color: "text-orange-600 dark:text-orange-400",
    },
  ];

  const quickActions = [
    {
      title: "Start Class Session",
      description: "Begin attendance tracking",
      icon: QrCodeIcon,
      action: () => setActiveSection("attendance"),
    },
    {
      title: "Face Recognition",
      description: "AI-powered check-in",
      icon: CameraIcon,
      action: () => setActiveSection("attendance"),
    },
    {
      title: "Generate Report",
      description: "Export attendance data",
      icon: DocumentTextIcon,
      action: () => setActiveSection("reports"),
    },
    {
      title: "View Analytics",
      description: "Attendance insights",
      icon: ChartBarIcon,
      action: () => setActiveSection("analytics"),
    },
  ];

  const aiInsights = [
    {
      title: "Predicted Absentees Today",
      value: "12 students",
      description: "Based on historical patterns",
      icon: SparklesIcon,
      color: "text-orange-600 dark:text-orange-400",
    },
    {
      title: "Attendance Trend",
      value: "Improving",
      description: "+5% from last week",
      icon: ArrowTrendingUpIcon,
      color: "text-green-600 dark:text-green-400",
    },
    {
      title: "Peak Attendance Time",
      value: "10:00 AM",
      description: "Optimal class scheduling",
      icon: ClockIcon,
      color: "text-blue-600 dark:text-blue-400",
    },
  ];

  const recentActivity = [
    { student: "John Smith", class: "CS101", time: "10:30 AM", status: "present" },
    { student: "Alice Johnson", class: "MATH201", time: "10:28 AM", status: "present" },
    { student: "Bob Wilson", class: "PHY101", time: "10:25 AM", status: "late" },
    { student: "Carol Davis", class: "CS101", time: "10:22 AM", status: "present" },
  ];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="bg-gradient-to-r from-indigo-500 to-purple-600 rounded-3xl p-8 text-white shadow-lg">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold mb-2">
              Welcome back, {user?.name}! 👋
            </h1>
            <p className="text-indigo-100 text-lg">
              {new Date().toLocaleDateString("en-US", {
                weekday: "long",
                year: "numeric",
                month: "long",
                day: "numeric",
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

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, i) => (
          <div
            key={i}
            className="p-6 bg-white dark:bg-gray-800 rounded-2xl shadow hover:shadow-lg transition"
          >
            <div className="flex items-center justify-between mb-4">
              <div
                className={`w-12 h-12 ${stat.bg} rounded-xl flex items-center justify-center`}
              >
                <stat.icon className={`w-6 h-6 ${stat.color}`} />
              </div>
              <div
                className={`flex items-center text-sm ${
                  stat.trend === "up"
                    ? "text-green-600 dark:text-green-400"
                    : "text-red-600 dark:text-red-400"
                }`}
              >
                {stat.trend === "up" ? (
                  <ArrowTrendingUpIcon className="w-4 h-4 mr-1" />
                ) : (
                  <ArrowTrendingDownIcon className="w-4 h-4 mr-1" />
                )}
                {stat.change}
              </div>
            </div>
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
              {stat.value}
            </h3>
            <p className="text-gray-600 dark:text-gray-400">{stat.title}</p>
          </div>
        ))}
      </div>

      {/* Quick Actions */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow">
        <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6">
          Quick Actions
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {quickActions.map((action, i) => (
            <button
              key={i}
              onClick={action.action}
              className="group p-5 rounded-2xl bg-gray-50 dark:bg-gray-700 hover:shadow-md transition"
            >
              <div className="w-12 h-12 bg-indigo-500 text-white rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition">
                <action.icon className="w-6 h-6" />
              </div>
              <h3 className="font-semibold text-gray-900 dark:text-white mb-1">
                {action.title}
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {action.description}
              </p>
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* AI Insights */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow">
          <div className="flex items-center mb-6">
            <SparklesIcon className="w-6 h-6 text-indigo-600 dark:text-indigo-400 mr-2" />
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">
              AI Insights
            </h2>
          </div>
          <div className="space-y-4">
            {aiInsights.map((insight, i) => (
              <div
                key={i}
                className="p-4 bg-gray-50 dark:bg-gray-700 rounded-xl"
              >
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-semibold text-gray-900 dark:text-white">
                    {insight.title}
                  </h3>
                  <insight.icon className={`w-5 h-5 ${insight.color}`} />
                </div>
                <p className="text-xl font-bold text-gray-900 dark:text-white">
                  {insight.value}
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {insight.description}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Activity */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6">
            Recent Activity
          </h2>
          <div className="space-y-4">
            {recentActivity.map((a, i) => (
              <div
                key={i}
                className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-xl"
              >
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-indigo-500 rounded-full flex items-center justify-center text-white font-semibold">
                    {a.student
                      .split(" ")
                      .map((n) => n[0])
                      .join("")}
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900 dark:text-white">
                      {a.student}
                    </p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {a.class} • {a.time}
                    </p>
                  </div>
                </div>
                <span
                  className={`px-3 py-1 rounded-full text-xs font-semibold ${
                    a.status === "present"
                      ? "bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-400"
                      : a.status === "late"
                      ? "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/40 dark:text-yellow-400"
                      : "bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-400"
                  }`}
                >
                  {a.status}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Attendance Summary */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow">
        <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6">
          Attendance Summary
        </h2>
        <div className="h-64 flex items-center justify-center bg-gray-50 dark:bg-gray-700 rounded-xl">
          <div className="text-center">
            <ChartBarIcon className="w-16 h-16 text-indigo-400 mx-auto mb-4" />
            <p className="text-gray-600 dark:text-gray-400">
              Interactive charts will be displayed here
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
