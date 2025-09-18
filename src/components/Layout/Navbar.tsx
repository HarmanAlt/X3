import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useApp } from '../../context/AppContext';
import { 
  Home, 
  Users, 
  Calendar, 
  GraduationCap, 
  UserCheck, 
  BarChart3, 
  Settings, 
  LogOut,
  Moon,
  Sun,
  Bell,
  Menu,
  X
} from 'lucide-react';

interface NavbarProps {
  activeSection: string;
  setActiveSection: (section: string) => void;
}

const Navbar: React.FC<NavbarProps> = ({ activeSection, setActiveSection }) => {
  const { user, logout } = useAuth();
  const { darkMode, toggleDarkMode } = useApp();
  const [menuOpen, setMenuOpen] = useState(false);

  const navigationItems = [
    { id: 'dashboard', label: 'Dashboard', icon: Home, roles: ['student', 'faculty', 'admin'] },
    { id: 'attendance', label: 'Attendance', icon: UserCheck, roles: ['student', 'faculty', 'admin'] },
    { id: 'classes', label: 'Classes', icon: Calendar, roles: ['faculty', 'admin'] },
    { id: 'students', label: 'Students', icon: Users, roles: ['faculty', 'admin'] },
    { id: 'faculty', label: 'Faculty', icon: GraduationCap, roles: ['admin'] },
    { id: 'reports', label: 'Reports', icon: BarChart3, roles: ['faculty', 'admin'] },
    { id: 'settings', label: 'Settings', icon: Settings, roles: ['student', 'faculty', 'admin'] }
  ];

  const filteredItems = navigationItems.filter(item => 
    user && item.roles.includes(user.role)
  );

  return (
    <nav className="bg-white dark:bg-gray-900 shadow-lg border-b border-gray-200 dark:border-gray-700">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          {/* Logo */}
          <div className="flex items-center">
            <div className="flex-shrink-0 flex items-center">
              <UserCheck className="h-8 w-8 text-blue-600 mr-2" />
              <span className="font-bold text-xl text-gray-900 dark:text-white">
                Attendify
              </span>
            </div>
          </div>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center space-x-4">
            {filteredItems.map((item) => {
              const Icon = item.icon;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveSection(item.id)}
                  className={`flex items-center px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200 ${
                    activeSection === item.id
                      ? 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300'
                      : 'text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-700'
                  }`}
                >
                  <Icon className="h-4 w-4 mr-2" />
                  {item.label}
                </button>
              );
            })}
          </div>

          {/* Right side controls */}
          <div className="flex items-center space-x-3">
            {/* Dark Mode */}
            <button
              onClick={toggleDarkMode}
              className="p-2 rounded-md text-gray-400 hover:text-gray-500 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
            >
              {darkMode ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
            </button>

            {/* Notifications */}
            <button className="p-2 rounded-md text-gray-400 hover:text-gray-500 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700">
              <Bell className="h-5 w-5" />
            </button>

            {/* User + Logout */}
            <div className="hidden sm:flex items-center space-x-2">
              <span className="text-sm text-gray-700 dark:text-gray-300">
                {user?.name}
              </span>
              <button
                onClick={logout}
                className="flex items-center px-3 py-2 rounded-md text-sm font-medium text-red-600 hover:text-red-900 hover:bg-red-50 dark:hover:bg-red-900/10 transition-colors duration-200"
              >
                <LogOut className="h-4 w-4 mr-1" />
                Logout
              </button>
            </div>

            {/* Mobile Hamburger */}
            <button 
              className="md:hidden p-2 rounded-md text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800"
              onClick={() => setMenuOpen(!menuOpen)}
            >
              {menuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu Drawer */}
      {menuOpen && (
        <div className="md:hidden absolute top-16 left-0 w-full bg-white/80 dark:bg-gray-900/90 backdrop-blur-md shadow-lg z-50">
          <div className="px-4 pt-2 pb-3 space-y-1">
            {filteredItems.map((item) => {
              const Icon = item.icon;
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    setActiveSection(item.id);
                    setMenuOpen(false);
                  }}
                  className={`flex items-center w-full px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200 ${
                    activeSection === item.id
                      ? 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300'
                      : 'text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-700'
                  }`}
                >
                  <Icon className="h-4 w-4 mr-2" />
                  {item.label}
                </button>
              );
            })}
            <button
              onClick={logout}
              className="flex items-center w-full px-3 py-2 rounded-md text-sm font-medium text-red-600 hover:text-red-900 hover:bg-red-50 dark:hover:bg-red-900/10 transition-colors duration-200"
            >
              <LogOut className="h-4 w-4 mr-2" />
              Logout
            </button>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
