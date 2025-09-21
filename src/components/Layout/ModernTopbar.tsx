import React from "react";
import { useAuth } from "../../context/AuthContext";
import { useApp } from "../../context/AppContext";
import {
  Bars3Icon,
  BellIcon,
  MoonIcon,
  SunIcon,
  ChartBarIcon,
  UserCheckIcon,
} from "@heroicons/react/24/outline";

interface ModernTopbarProps {
  setSidebarOpen: (open: boolean) => void;
  setActiveSection: (section: string) => void;
}

const ModernTopbar: React.FC<ModernTopbarProps> = ({ setSidebarOpen, setActiveSection }) => {
  const { user } = useAuth();
  const { darkMode, toggleDarkMode } = useApp();

  // Role-specific gradient classes
  const roleGradients = {
    admin: "from-[#6D28D9] to-[#3B82F6]",
    student: "from-[#2563EB] to-[#0EA5E9]",
    faculty: "from-[#059669] to-[#10B981]",
  };

  const currentGradient =
    roleGradients[user?.role as keyof typeof roleGradients] || roleGradients.admin;

  // Generate initials safely
  const getInitials = (name?: string) => {
    if (!name) return "?";
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase();
  };

  return (
    <header className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl shadow-lg border-b border-white/20 dark:border-gray-700/20 lg:ml-0 sticky top-0 z-30">
      <div className="flex items-center justify-between px-4 sm:px-6 py-4">
        {/* Left section */}
        <div className="flex items-center space-x-4">
          {/* Mobile hamburger menu */}
          <button
            onClick={() => setSidebarOpen(true)}
            className={`lg:hidden p-3 rounded-xl bg-gradient-to-r ${currentGradient} text-white hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all duration-200 shadow-lg hover:scale-105`}
            aria-label="Toggle navigation menu"
            aria-controls="mobile-sidebar"
          >
            <Bars3Icon className="w-6 h-6 stroke-2" />
          </button>

          {/* Logo + Brand - Hidden on mobile when sidebar exists */}
          <div className="hidden lg:flex items-center space-x-3">
            <div className={`p-2 bg-gradient-to-r ${currentGradient} rounded-xl shadow-lg`}>
              <UserCheckIcon className="h-8 w-8 text-white" />
            </div>
            <div>
              <span className={`text-xl font-bold bg-gradient-to-r ${currentGradient} bg-clip-text text-transparent`}>
                Attendify
              </span>
              <p className="text-xs text-gray-500 dark:text-gray-400 capitalize">{user?.role} Portal</p>
            </div>
          </div>

          {/* Quick Stats for larger screens */}
          <div className="hidden xl:flex items-center space-x-6 ml-8">
            <div className="flex items-center space-x-2 px-3 py-2 bg-white/20 dark:bg-gray-800/20 backdrop-blur-sm rounded-xl border border-white/30 dark:border-gray-600/30">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">System Online</span>
            </div>
          </div>
        </div>

        {/* Right section */}
        <div className="flex items-center space-x-3">
          {user ? (
            <>
              {/* Dark Mode Toggle - Moved from sidebar */}
              <button
                onClick={toggleDarkMode}
                className="p-3 rounded-xl text-gray-600 dark:text-gray-300 hover:bg-white/20 dark:hover:bg-gray-800/20 backdrop-blur-sm border border-white/20 dark:border-gray-600/20 transition-all duration-300 hover:scale-110 hover:rotate-12"
                aria-label="Toggle dark mode"
              >
                {darkMode ? <SunIcon className="h-5 w-5" /> : <MoonIcon className="h-5 w-5" />}
              </button>

              {/* Quick Analytics Button */}
              <button
                onClick={() => setActiveSection("analytics")}
                className="p-3 rounded-xl text-gray-600 dark:text-gray-300 hover:bg-white/20 dark:hover:bg-gray-800/20 backdrop-blur-sm border border-white/20 dark:border-gray-600/20 transition-all duration-300 hover:scale-110"
                aria-label="View analytics"
              >
                <ChartBarIcon className="h-5 w-5" />
              </button>

              {/* Notifications */}
              <button
                onClick={() => setActiveSection("notifications")}
                className="relative p-3 rounded-xl text-gray-600 dark:text-gray-300 hover:bg-white/20 dark:hover:bg-gray-800/20 backdrop-blur-sm border border-white/20 dark:border-gray-600/20 transition-all duration-300 hover:scale-110"
                aria-label="Notifications"
              >
                <BellIcon className="h-5 w-5" />
                {/* Notification Badge */}
                <span className="absolute -top-1 -right-1 h-5 w-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center font-bold shadow-lg">
                  3
                </span>
              </button>

              {/* Enhanced User Profile */}
              <div className="flex items-center space-x-3">
                <div
                  className={`w-10 h-10 bg-gradient-to-br ${currentGradient} rounded-xl flex items-center justify-center cursor-pointer hover:scale-110 transition-all duration-300 shadow-lg`}
                  onClick={() => setActiveSection("settings")}
                >
                  <span className="text-white font-bold text-sm">
                    {getInitials(user.name)}
                  </span>
                </div>
                {/* User Details - Hidden on small screens */}
                <div className="hidden sm:block text-left">
                  <p className="text-sm font-semibold text-gray-800 dark:text-gray-100">
                    {user.name}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 capitalize flex items-center">
                    <div className={`w-2 h-2 bg-gradient-to-r ${currentGradient} rounded-full mr-2`}></div>
                    {user.role}
                  </p>
                </div>
              </div>
            </>
          ) : (
            <button
              onClick={() => setActiveSection("login")}
              className="text-sm font-medium text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white px-4 py-2 rounded-xl hover:bg-white/20 dark:hover:bg-gray-800/20 transition-all duration-200"
            >
              Login
            </button>
          )}
        </div>
      </div>
    </header>
  );
};

export default ModernTopbar;