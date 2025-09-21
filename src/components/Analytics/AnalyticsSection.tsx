import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { useAuth } from '../../context/AuthContext';
import StudentAnalytics from './StudentAnalytics';
import FacultyAnalytics from './FacultyAnalytics';
import AdminAnalytics from './AdminAnalytics';
import { apiService } from '../../services/api';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, LineChart, Line, PieChart, Pie, Cell, ResponsiveContainer, AreaChart, Area, ScatterChart, Scatter, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar } from 'recharts';
import { 
  TrendingUp, 
  TrendingDown, 
  Users, 
  AlertTriangle, 
  Calendar, 
  Target,
  Clock,
  Award,
  Activity,
  BarChart3,
  PieChart as PieChartIcon,
  Download,
  Filter,
  RefreshCw,
  Eye,
  Brain,
  Zap
} from 'lucide-react';

const AnalyticsSection: React.FC = () => {
  const { classes, students, attendanceRecords } = useApp();
  const { user } = useAuth();

  // Role-based analytics rendering
  if (user?.role === 'student') {
    return <StudentAnalytics />;
  }

  if (user?.role === 'faculty') {
    return <FacultyAnalytics />;
  }

  if (user?.role === 'admin') {
    return <AdminAnalytics />;
  }

  // Fallback to original analytics for backward compatibility
  const [selectedMetric, setSelectedMetric] = useState('overview');
  const [timeRange, setTimeRange] = useState('30d');
  const [isLoading, setIsLoading] = useState(false);
  const [analyticsData, setAnalyticsData] = useState<any>(null);

  // Enhanced mock data for comprehensive analytics
  const mockData = {
    classAttendance: [
      { name: 'CS101', attendance: 85, absent: 15, late: 8, total: 108 },
      { name: 'CS201', attendance: 78, absent: 22, late: 12, total: 112 },
      { name: 'MATH301', attendance: 92, absent: 8, late: 5, total: 105 },
      { name: 'PHY101', attendance: 76, absent: 24, late: 15, total: 115 },
      { name: 'ENG101', attendance: 88, absent: 12, late: 7, total: 107 }
    ],
    weeklyTrends: [
      { week: 'Week 1', attendance: 85, target: 80, efficiency: 92 },
      { week: 'Week 2', attendance: 88, target: 80, efficiency: 95 },
      { week: 'Week 3', attendance: 82, target: 80, efficiency: 89 },
      { week: 'Week 4', attendance: 90, target: 80, efficiency: 98 },
      { week: 'Week 5', attendance: 87, target: 80, efficiency: 94 },
      { week: 'Week 6', attendance: 91, target: 80, efficiency: 97 }
    ],
    dailyPatterns: [
      { day: 'Monday', attendance: 88, classes: 12 },
      { day: 'Tuesday', attendance: 85, classes: 15 },
      { day: 'Wednesday', attendance: 92, classes: 18 },
      { day: 'Thursday', attendance: 87, classes: 14 },
      { day: 'Friday', attendance: 83, classes: 10 }
    ],
    hourlyPatterns: [
      { hour: '8:00', attendance: 75, classes: 3 },
      { hour: '9:00', attendance: 88, classes: 8 },
      { hour: '10:00', attendance: 92, classes: 12 },
      { hour: '11:00', attendance: 89, classes: 10 },
      { hour: '12:00', attendance: 82, classes: 6 },
      { hour: '13:00', attendance: 85, classes: 4 },
      { hour: '14:00', attendance: 90, classes: 9 },
      { hour: '15:00', attendance: 87, classes: 7 }
    ],
    statusDistribution: [
      { name: 'Present', value: 75, color: '#10B981' },
      { name: 'Absent', value: 15, color: '#EF4444' },
      { name: 'Late', value: 10, color: '#F59E0B' }
    ],
    studentRisk: [
      { name: 'John Smith', attendance: 65, risk: 'high', missed: 8, trend: 'down' },
      { name: 'Alice Johnson', attendance: 70, risk: 'medium', missed: 6, trend: 'stable' },
      { name: 'Bob Wilson', attendance: 68, risk: 'high', missed: 7, trend: 'down' },
      { name: 'Carol Davis', attendance: 73, risk: 'medium', missed: 5, trend: 'up' },
      { name: 'David Lee', attendance: 62, risk: 'critical', missed: 10, trend: 'down' }
    ],
    topPerformers: [
      { name: 'Emma Wilson', attendance: 98, streak: 15, improvement: '+5%' },
      { name: 'Michael Brown', attendance: 96, streak: 12, improvement: '+3%' },
      { name: 'Sarah Davis', attendance: 94, streak: 10, improvement: '+7%' },
      { name: 'James Miller', attendance: 93, streak: 8, improvement: '+2%' },
      { name: 'Lisa Garcia', attendance: 91, streak: 6, improvement: '+4%' }
    ],
    classPerformance: [
      { subject: 'Computer Science', avgAttendance: 87, students: 45, trend: 'up' },
      { subject: 'Mathematics', avgAttendance: 82, students: 38, trend: 'stable' },
      { subject: 'Physics', avgAttendance: 79, students: 32, trend: 'down' },
      { subject: 'English', avgAttendance: 85, students: 41, trend: 'up' },
      { subject: 'Chemistry', avgAttendance: 81, students: 29, trend: 'stable' }
    ],
    aiInsights: [
      { type: 'prediction', title: 'Predicted Absentees Tomorrow', value: '8 students', confidence: 87 },
      { type: 'trend', title: 'Attendance Trend', value: 'Improving', confidence: 92 },
      { type: 'peak', title: 'Peak Attendance Time', value: '10:00 AM', confidence: 89 },
      { type: 'risk', title: 'High Risk Classes', value: 'PHY101, MATH301', confidence: 85 }
    ]
  };

  useEffect(() => {
    fetchAnalyticsData();
  }, [timeRange]);

  const fetchAnalyticsData = async () => {
    setIsLoading(true);
    try {
      // Simulate API call with mock data
      await new Promise(resolve => setTimeout(resolve, 1000));
      setAnalyticsData(mockData);
    } catch (error) {
      console.error('Failed to fetch analytics data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const StatCard: React.FC<{
    title: string;
    value: string;
    change: string;
    trend: 'up' | 'down' | 'stable';
    icon: React.ComponentType<any>;
    color?: string;
    subtitle?: string;
  }> = ({ title, value, change, trend, icon: Icon, color = 'blue', subtitle }) => (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600 dark:text-gray-400">{title}</p>
          <p className="text-2xl font-semibold text-gray-900 dark:text-white">{value}</p>
          {subtitle && <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{subtitle}</p>}
          <div className="flex items-center mt-2">
            {trend === 'up' ? (
              <TrendingUp className="h-4 w-4 text-green-500 mr-1" />
            ) : trend === 'down' ? (
              <TrendingDown className="h-4 w-4 text-red-500 mr-1" />
            ) : (
              <Activity className="h-4 w-4 text-gray-500 mr-1" />
            )}
            <span className={`text-sm ${
              trend === 'up' ? 'text-green-600' : 
              trend === 'down' ? 'text-red-600' : 
              'text-gray-600'
            }`}>
              {change}
            </span>
          </div>
        </div>
        <div className={`p-3 rounded-full ${
          color === 'blue' ? 'bg-blue-100 dark:bg-blue-900/30' :
          color === 'green' ? 'bg-green-100 dark:bg-green-900/30' :
          color === 'red' ? 'bg-red-100 dark:bg-red-900/30' :
          color === 'purple' ? 'bg-purple-100 dark:bg-purple-900/30' :
          'bg-gray-100 dark:bg-gray-900/30'
        }`}>
          <Icon className={`h-6 w-6 ${
            color === 'blue' ? 'text-blue-600 dark:text-blue-400' :
            color === 'green' ? 'text-green-600 dark:text-green-400' :
            color === 'red' ? 'text-red-600 dark:text-red-400' :
            color === 'purple' ? 'text-purple-600 dark:text-purple-400' :
            'text-gray-600 dark:text-gray-400'
          }`} />
        </div>
      </div>
    </div>
  );

  const exportData = () => {
    // Mock export functionality
    console.log('Exporting analytics data...');
    // In a real app, this would generate and download a CSV/Excel file
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Enhanced Header */}
      <div className="bg-gradient-to-r from-indigo-500 to-purple-600 dark:from-indigo-600 dark:to-purple-700 rounded-2xl p-6 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-bold mb-2">Analytics Dashboard</h2>
            <p className="text-indigo-100 dark:text-indigo-200">
              Comprehensive insights into attendance patterns and performance
            </p>
          </div>
          <div className="hidden md:block">
            <div className="w-16 h-16 bg-white/20 dark:bg-white/30 rounded-2xl flex items-center justify-center">
              <BarChart3 className="w-8 h-8 text-white" />
            </div>
          </div>
        </div>
      </div>

      {/* Controls */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex flex-wrap gap-2">
          <select
            value={selectedMetric}
            onChange={(e) => setSelectedMetric(e.target.value)}
            className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:bg-gray-700 dark:text-white"
          >
            <option value="overview">📊 Overview</option>
            <option value="class_trends">📈 Class Trends</option>
            <option value="student_analysis">👥 Student Analysis</option>
            <option value="predictions">🔮 AI Predictions</option>
            <option value="patterns">🕒 Time Patterns</option>
            <option value="performance">🏆 Performance</option>
          </select>
          
          <select
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value)}
            className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:bg-gray-700 dark:text-white"
          >
            <option value="7d">Last 7 days</option>
            <option value="30d">Last 30 days</option>
            <option value="90d">Last 90 days</option>
            <option value="1y">Last year</option>
          </select>
        </div>

        <div className="flex gap-2">
          <button
            onClick={fetchAnalyticsData}
            className="flex items-center px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh
          </button>
          <button
            onClick={exportData}
            className="flex items-center px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
          >
            <Download className="w-4 h-4 mr-2" />
            Export
          </button>
        </div>
      </div>

      {/* Enhanced Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Overall Attendance"
          value="87.5%"
          change="+2.3%"
          trend="up"
          icon={Target}
          color="green"
          subtitle="Above target (80%)"
        />
        <StatCard
          title="Total Students"
          value={students.length.toString()}
          change="+5"
          trend="up"
          icon={Users}
          color="blue"
          subtitle="Active enrollment"
        />
        <StatCard
          title="At Risk Students"
          value="12"
          change="-3"
          trend="down"
          icon={AlertTriangle}
          color="red"
          subtitle="Below 75% threshold"
        />
        <StatCard
          title="Classes This Week"
          value="45"
          change="+2"
          trend="up"
          icon={Calendar}
          color="purple"
          subtitle="Scheduled sessions"
        />
      </div>

      {/* AI Insights Bar */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-xl p-4 border border-blue-200 dark:border-blue-800">
        <div className="flex items-center mb-3">
          <Brain className="w-5 h-5 text-blue-600 dark:text-blue-400 mr-2" />
          <h3 className="text-lg font-semibold text-blue-900 dark:text-blue-100">AI Insights</h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {mockData.aiInsights.map((insight, index) => (
            <div key={index} className="bg-white dark:bg-gray-800 rounded-lg p-3 border border-blue-100 dark:border-blue-800">
              <p className="text-sm font-medium text-gray-900 dark:text-white">{insight.title}</p>
              <p className="text-lg font-bold text-blue-600 dark:text-blue-400">{insight.value}</p>
              <p className="text-xs text-gray-500 dark:text-gray-400">{insight.confidence}% confidence</p>
            </div>
          ))}
        </div>
      </div>

      {selectedMetric === 'overview' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
            <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">
              Class-wise Attendance
            </h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={mockData.classAttendance}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="attendance" fill="#3B82F6" name="Present %" />
                <Bar dataKey="absent" fill="#EF4444" name="Absent %" />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
            <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">
              Attendance Status Distribution
            </h3>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={mockData.statusDistribution}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {mockData.statusDistribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {selectedMetric === 'class_trends' && (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">
            Weekly Attendance Trends
          </h3>
          <ResponsiveContainer width="100%" height={400}>
            <LineChart data={mockData.weeklyTrends}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="week" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="attendance" stroke="#3B82F6" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}

      {selectedMetric === 'student_analysis' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
            <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">
              Top Performers
            </h3>
            <div className="space-y-3">
              {students.slice(0, 5).map((student, index) => (
                <div key={student.id} className="flex items-center justify-between p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                  <div className="flex items-center">
                    <div className="w-8 h-8 bg-green-500 text-white rounded-full flex items-center justify-center text-sm font-semibold">
                      {index + 1}
                    </div>
                    <div className="ml-3">
                      <p className="font-medium text-gray-900 dark:text-white">{student.name}</p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">{student.studentId}</p>
                    </div>
                  </div>
                  <span className="text-green-600 font-semibold">
                    {student.attendancePercentage}%
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
            <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">
              Attendance Distribution by Range
            </h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600 dark:text-gray-400">90-100%</span>
                <div className="flex-1 mx-4 bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                  <div className="bg-green-500 h-2 rounded-full" style={{ width: '35%' }}></div>
                </div>
                <span className="text-sm font-medium text-gray-900 dark:text-white">35%</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600 dark:text-gray-400">80-89%</span>
                <div className="flex-1 mx-4 bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                  <div className="bg-blue-500 h-2 rounded-full" style={{ width: '40%' }}></div>
                </div>
                <span className="text-sm font-medium text-gray-900 dark:text-white">40%</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600 dark:text-gray-400">70-79%</span>
                <div className="flex-1 mx-4 bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                  <div className="bg-yellow-500 h-2 rounded-full" style={{ width: '15%' }}></div>
                </div>
                <span className="text-sm font-medium text-gray-900 dark:text-white">15%</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600 dark:text-gray-400">Below 70%</span>
                <div className="flex-1 mx-4 bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                  <div className="bg-red-500 h-2 rounded-full" style={{ width: '10%' }}></div>
                </div>
                <span className="text-sm font-medium text-gray-900 dark:text-white">10%</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {selectedMetric === 'predictions' && (
        <div className="space-y-6">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
            <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white flex items-center">
              <AlertTriangle className="h-5 w-5 text-orange-500 mr-2" />
              At-Risk Students (Below 75% Attendance)
            </h3>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                <thead className="bg-gray-50 dark:bg-gray-700">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Student
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Current Attendance
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Risk Level
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Missed Classes
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Trend
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Recommendation
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                  {mockData.studentRisk.map((student, index) => (
                    <tr key={index} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                        {student.name}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                        {student.attendance}%
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          student.risk === 'critical' 
                            ? 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300'
                            : student.risk === 'high' 
                            ? 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300' 
                            : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300'
                        }`}>
                          {student.risk === 'critical' ? 'Critical' : student.risk === 'high' ? 'High Risk' : 'Medium Risk'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                        {student.missed}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {student.trend === 'down' ? (
                          <TrendingDown className="h-4 w-4 text-red-500" />
                        ) : student.trend === 'up' ? (
                          <TrendingUp className="h-4 w-4 text-green-500" />
                        ) : (
                          <Activity className="h-4 w-4 text-gray-500" />
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                        {student.risk === 'critical' ? 'Urgent intervention needed' : 
                         student.risk === 'high' ? 'Immediate intervention required' : 'Monitor closely'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-gradient-to-r from-red-500 to-red-600 text-white rounded-lg p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-red-100">Critical Risk</p>
                  <p className="text-2xl font-bold">5</p>
                  <p className="text-sm text-red-100">Below 60%</p>
                </div>
                <AlertTriangle className="h-8 w-8 text-red-200" />
              </div>
            </div>
            
            <div className="bg-gradient-to-r from-yellow-500 to-yellow-600 text-white rounded-lg p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-yellow-100">Medium Risk</p>
                  <p className="text-2xl font-bold">7</p>
                  <p className="text-sm text-yellow-100">60-74%</p>
                </div>
                <TrendingDown className="h-8 w-8 text-yellow-200" />
              </div>
            </div>
            
            <div className="bg-gradient-to-r from-green-500 to-green-600 text-white rounded-lg p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-green-100">Good Standing</p>
                  <p className="text-2xl font-bold">{students.length - 12}</p>
                  <p className="text-sm text-green-100">75% and above</p>
                </div>
                <TrendingUp className="h-8 w-8 text-green-200" />
              </div>
            </div>
          </div>
        </div>
      )}

      {selectedMetric === 'patterns' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
              <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white flex items-center">
                <Clock className="h-5 w-5 text-blue-500 mr-2" />
                Daily Attendance Patterns
              </h3>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={mockData.dailyPatterns}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="day" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="attendance" fill="#3B82F6" name="Attendance %" />
                </BarChart>
              </ResponsiveContainer>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
              <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white flex items-center">
                <Clock className="h-5 w-5 text-green-500 mr-2" />
                Hourly Attendance Patterns
              </h3>
              <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={mockData.hourlyPatterns}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="hour" />
                  <YAxis />
                  <Tooltip />
                  <Area type="monotone" dataKey="attendance" stroke="#10B981" fill="#10B981" fillOpacity={0.3} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      )}

      {selectedMetric === 'performance' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
              <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white flex items-center">
                <Award className="h-5 w-5 text-yellow-500 mr-2" />
                Top Performers
              </h3>
              <div className="space-y-3">
                {mockData.topPerformers.map((performer, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-gradient-to-r from-yellow-50 to-orange-50 dark:from-yellow-900/20 dark:to-orange-900/20 rounded-lg border border-yellow-200 dark:border-yellow-800">
                    <div className="flex items-center">
                      <div className="w-8 h-8 bg-gradient-to-r from-yellow-400 to-orange-500 text-white rounded-full flex items-center justify-center text-sm font-semibold">
                        {index + 1}
                      </div>
                      <div className="ml-3">
                        <p className="font-medium text-gray-900 dark:text-white">{performer.name}</p>
                        <p className="text-sm text-gray-600 dark:text-gray-400">{performer.streak} day streak</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="text-yellow-600 font-semibold text-lg">{performer.attendance}%</span>
                      <p className="text-xs text-green-600">{performer.improvement}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
              <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white flex items-center">
                <BarChart3 className="h-5 w-5 text-purple-500 mr-2" />
                Class Performance by Subject
              </h3>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={mockData.classPerformance} layout="horizontal">
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis type="number" domain={[0, 100]} />
                  <YAxis dataKey="subject" type="category" width={100} />
                  <Tooltip />
                  <Bar dataKey="avgAttendance" fill="#8B5CF6" name="Avg Attendance %" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AnalyticsSection;