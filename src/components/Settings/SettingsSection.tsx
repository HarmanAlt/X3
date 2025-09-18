import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useApp } from '../../context/AppContext';
import { 
  UserIcon, 
  CogIcon, 
  BellIcon, 
  ShieldCheckIcon,
  PaintBrushIcon,
  MoonIcon,
  SunIcon,
  CheckCircleIcon,
  KeyIcon,
  GlobeAltIcon,
  AcademicCapIcon,
  ClipboardDocumentListIcon,
  ChartBarIcon
} from '@heroicons/react/24/outline';

const SettingsSection: React.FC = () => {
  const { user } = useAuth();
  const { darkMode, toggleDarkMode, colorTheme, setColorTheme } = useApp();
  const [activeTab, setActiveTab] = useState('profile');
  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
    notifications: {
      email: true,
      push: true,
      attendance: true,
      grades: true
    }
  });

  // Role-specific gradient classes
  const roleGradients = {
    admin: 'from-[#6D28D9] to-[#3B82F6]',
    student: 'from-[#2563EB] to-[#0EA5E9]',
    faculty: 'from-[#059669] to-[#10B981]'
  };

  const currentGradient = roleGradients[user?.role as keyof typeof roleGradients] || roleGradients.admin;

  const colorThemes = [
    { id: 'blue', name: 'Blue', colors: 'from-blue-500 to-blue-600' },
    { id: 'purple', name: 'Purple', colors: 'from-purple-500 to-purple-600' },
    { id: 'green', name: 'Green', colors: 'from-green-500 to-green-600' },
    { id: 'orange', name: 'Orange', colors: 'from-orange-500 to-orange-600' },
    { id: 'pink', name: 'Pink', colors: 'from-pink-500 to-pink-600' }
  ];

  const getTabsForRole = () => {
    const baseTabs = [
      { id: 'profile', label: 'Profile', icon: UserIcon },
      { id: 'security', label: 'Security', icon: ShieldCheckIcon },
      { id: 'appearance', label: 'Appearance', icon: PaintBrushIcon }
    ];

    if (user?.role === 'admin') {
      return [
        ...baseTabs,
        { id: 'system', label: 'System Config', icon: CogIcon },
        { id: 'users', label: 'User Management', icon: UserIcon },
        { id: 'notifications', label: 'Notifications', icon: BellIcon }
      ];
    }

    if (user?.role === 'faculty') {
      return [
        ...baseTabs,
        { id: 'classes', label: 'Class Settings', icon: AcademicCapIcon },
        { id: 'grading', label: 'Grading Preferences', icon: ClipboardDocumentListIcon },
        { id: 'notifications', label: 'Notifications', icon: BellIcon }
      ];
    }

    // Student tabs
    return [
      ...baseTabs,
      { id: 'notifications', label: 'Notifications', icon: BellIcon },
      { id: 'privacy', label: 'Privacy', icon: ShieldCheckIcon }
    ];
  };

  const tabs = getTabsForRole();

  const handleSave = () => {
    // Simulate save operation
    console.log('Settings saved:', formData);
    alert('Settings saved successfully!');
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case 'profile':
        return (
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Full Name
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:bg-gray-700 dark:text-white"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Email Address
              </label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:bg-gray-700 dark:text-white"
              />
            </div>
            <div className="flex items-center space-x-3 p-4 bg-indigo-50 dark:bg-indigo-900/20 rounded-xl">
              <CheckCircleIcon className="w-5 h-5 text-indigo-600" />
              <span className="text-sm text-indigo-700 dark:text-indigo-300">
                Profile information is synced across all devices
              </span>
            </div>
          </div>
        );

      case 'security':
        return (
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Current Password
              </label>
              <input
                type="password"
                value={formData.currentPassword}
                onChange={(e) => setFormData({ ...formData, currentPassword: e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:bg-gray-700 dark:text-white"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                New Password
              </label>
              <input
                type="password"
                value={formData.newPassword}
                onChange={(e) => setFormData({ ...formData, newPassword: e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:bg-gray-700 dark:text-white"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Confirm New Password
              </label>
              <input
                type="password"
                value={formData.confirmPassword}
                onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:bg-gray-700 dark:text-white"
              />
            </div>
            <div className="flex items-center space-x-3 p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-xl">
              <KeyIcon className="w-5 h-5 text-yellow-600" />
              <span className="text-sm text-yellow-700 dark:text-yellow-300">
                Use a strong password with at least 8 characters
              </span>
            </div>
          </div>
        );

      case 'appearance':
        return (
          <div className="space-y-6">
            <div>
              <h4 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">
                Theme Preferences
              </h4>
              <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-xl">
                <div className="flex items-center space-x-3">
                  {darkMode ? <MoonIcon className="w-5 h-5 text-gray-600 dark:text-gray-400" /> : <SunIcon className="w-5 h-5 text-gray-600" />}
                  <span className="font-medium text-gray-800 dark:text-white">
                    {darkMode ? 'Dark Mode' : 'Light Mode'}
                  </span>
                </div>
                <button
                  onClick={toggleDarkMode}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                    darkMode ? 'bg-indigo-600' : 'bg-gray-200'
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      darkMode ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>
            </div>

            <div>
              <h4 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">
                Color Theme
              </h4>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {colorThemes.map((theme) => (
                  <button
                    key={theme.id}
                    onClick={() => setColorTheme(theme.id as any)}
                    className={`p-4 rounded-xl border-2 transition-all duration-200 ${
                      colorTheme === theme.id
                        ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-900/20'
                        : 'border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500'
                    }`}
                  >
                    <div className={`w-8 h-8 bg-gradient-to-r ${theme.colors} rounded-lg mx-auto mb-2`}></div>
                    <span className="text-sm font-medium text-gray-800 dark:text-white">
                      {theme.name}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        );

      case 'notifications':
        return (
          <div className="space-y-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-xl">
                <div className="flex items-center space-x-3">
                  <BellIcon className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                  <span className="font-medium text-gray-800 dark:text-white">Email Notifications</span>
                </div>
                <button
                  onClick={() => setFormData({
                    ...formData,
                    notifications: { ...formData.notifications, email: !formData.notifications.email }
                  })}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                    formData.notifications.email ? 'bg-indigo-600' : 'bg-gray-200'
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      formData.notifications.email ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>

              <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-xl">
                <div className="flex items-center space-x-3">
                  <GlobeAltIcon className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                  <span className="font-medium text-gray-800 dark:text-white">Push Notifications</span>
                </div>
                <button
                  onClick={() => setFormData({
                    ...formData,
                    notifications: { ...formData.notifications, push: !formData.notifications.push }
                  })}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                    formData.notifications.push ? 'bg-indigo-600' : 'bg-gray-200'
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      formData.notifications.push ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>

              {user?.role === 'student' && (
                <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-xl">
                  <div className="flex items-center space-x-3">
                    <AcademicCapIcon className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                    <span className="font-medium text-gray-800 dark:text-white">Grade Updates</span>
                  </div>
                  <button
                    onClick={() => setFormData({
                      ...formData,
                      notifications: { ...formData.notifications, grades: !formData.notifications.grades }
                    })}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                      formData.notifications.grades ? 'bg-indigo-600' : 'bg-gray-200'
                    }`}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                        formData.notifications.grades ? 'translate-x-6' : 'translate-x-1'
                      }`}
                    />
                  </button>
                </div>
              )}
            </div>
          </div>
        );

      case 'system':
        return user?.role === 'admin' ? (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="p-6 bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-indigo-900/20 dark:to-purple-900/20 rounded-xl">
                <h4 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">
                  System Status
                </h4>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Database</span>
                    <span className="flex items-center text-green-600">
                      <CheckCircleIcon className="w-4 h-4 mr-1" />
                      Online
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600 dark:text-gray-400">API Server</span>
                    <span className="flex items-center text-green-600">
                      <CheckCircleIcon className="w-4 h-4 mr-1" />
                      Healthy
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Storage</span>
                    <span className="flex items-center text-green-600">
                      <CheckCircleIcon className="w-4 h-4 mr-1" />
                      Available
                    </span>
                  </div>
                </div>
              </div>

              <div className="p-6 bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-xl">
                <h4 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">
                  Quick Actions
                </h4>
                <div className="space-y-3">
                  <button className="w-full text-left p-3 bg-white dark:bg-gray-700 rounded-lg hover:shadow-md transition-all duration-200">
                    <span className="font-medium text-gray-800 dark:text-white">Backup Database</span>
                  </button>
                  <button className="w-full text-left p-3 bg-white dark:bg-gray-700 rounded-lg hover:shadow-md transition-all duration-200">
                    <span className="font-medium text-gray-800 dark:text-white">Clear Cache</span>
                  </button>
                  <button className="w-full text-left p-3 bg-white dark:bg-gray-700 rounded-lg hover:shadow-md transition-all duration-200">
                    <span className="font-medium text-gray-800 dark:text-white">System Logs</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        ) : null;

      case 'classes':
        return user?.role === 'faculty' ? (
          <div className="space-y-6">
            <div className="p-6 bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-xl">
              <h4 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">
                Class Management Settings
              </h4>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-gray-700 dark:text-gray-300">Auto-mark absent after</span>
                  <select className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white">
                    <option>15 minutes</option>
                    <option>30 minutes</option>
                    <option>1 hour</option>
                  </select>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-700 dark:text-gray-300">Allow late check-ins</span>
                  <button className="relative inline-flex h-6 w-11 items-center rounded-full bg-indigo-600">
                    <span className="inline-block h-4 w-4 transform rounded-full bg-white translate-x-6 transition-transform" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        ) : null;

      case 'grading':
        return user?.role === 'faculty' ? (
          <div className="space-y-6">
            <div className="p-6 bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20 rounded-xl">
              <h4 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">
                Grading Preferences
              </h4>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Attendance Weight in Final Grade
                  </label>
                  <select className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white">
                    <option>10%</option>
                    <option>15%</option>
                    <option>20%</option>
                    <option>25%</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Minimum Attendance for Pass
                  </label>
                  <select className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white">
                    <option>75%</option>
                    <option>80%</option>
                    <option>85%</option>
                  </select>
                </div>
              </div>
            </div>
          </div>
        ) : null;

      case 'users':
        return user?.role === 'admin' ? (
          <div className="space-y-6">
            <div className="p-6 bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 rounded-xl">
              <h4 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">
                User Management
              </h4>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-gray-700 dark:text-gray-300">Allow self-registration</span>
                  <button className="relative inline-flex h-6 w-11 items-center rounded-full bg-gray-200">
                    <span className="inline-block h-4 w-4 transform rounded-full bg-white translate-x-1 transition-transform" />
                  </button>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-700 dark:text-gray-300">Require email verification</span>
                  <button className="relative inline-flex h-6 w-11 items-center rounded-full bg-indigo-600">
                    <span className="inline-block h-4 w-4 transform rounded-full bg-white translate-x-6 transition-transform" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        ) : null;

      case 'privacy':
        return user?.role === 'student' ? (
          <div className="space-y-6">
            <div className="p-6 bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-xl">
              <h4 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">
                Privacy Settings
              </h4>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-gray-700 dark:text-gray-300">Share attendance with parents</span>
                  <button className="relative inline-flex h-6 w-11 items-center rounded-full bg-indigo-600">
                    <span className="inline-block h-4 w-4 transform rounded-full bg-white translate-x-6 transition-transform" />
                  </button>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-700 dark:text-gray-300">Allow profile visibility</span>
                  <button className="relative inline-flex h-6 w-11 items-center rounded-full bg-indigo-600">
                    <span className="inline-block h-4 w-4 transform rounded-full bg-white translate-x-6 transition-transform" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        ) : null;

      default:
        return (
          <div className="text-center py-8">
            <CogIcon className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600 dark:text-gray-400">Select a settings category</p>
          </div>
        );
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className={`bg-gradient-to-r ${currentGradient} rounded-3xl p-8 text-white`}>
        <div className="flex items-center space-x-3">
          <CogIcon className="w-8 h-8" />
          <div>
            <h2 className="text-3xl font-bold">Settings</h2>
            <p className="text-white/80">Manage your account and preferences</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Settings Navigation */}
        <div className="lg:col-span-1">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-100 dark:border-gray-700 p-4">
            <nav className="space-y-2">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                const isActive = activeTab === tab.id;
                
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl font-medium transition-all duration-200 ${
                      isActive
                        ? `bg-gradient-to-r ${currentGradient} text-white shadow-lg`
                        : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                    }`}
                  >
                    <Icon className="w-5 h-5 flex-shrink-0" />
                    <span>{tab.label}</span>
                  </button>
                );
              })}
            </nav>
          </div>
        </div>

        {/* Settings Content */}
        <div className="lg:col-span-3">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-100 dark:border-gray-700 p-8">
            <div className="mb-6">
              <h3 className="text-2xl font-bold text-gray-800 dark:text-white mb-2">
                {tabs.find(tab => tab.id === activeTab)?.label}
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                Configure your {tabs.find(tab => tab.id === activeTab)?.label.toLowerCase()} settings
              </p>
            </div>

            {renderTabContent()}

            {/* Save Button */}
            {(activeTab === 'profile' || activeTab === 'security' || activeTab === 'notifications') && (
              <div className="mt-8 pt-6 border-t border-gray-200 dark:border-gray-700">
                <button
                  onClick={handleSave}
                  className={`px-6 py-3 bg-gradient-to-r ${currentGradient} text-white rounded-xl font-semibold hover:shadow-lg hover:scale-[1.02] transition-all duration-200`}
                >
                  Save Changes
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SettingsSection;