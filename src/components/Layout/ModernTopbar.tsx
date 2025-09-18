import React from "react";
import { useAuth } from "../../context/AuthContext";
import {
  Bars3Icon, // v2 replacement for MenuIcon
} from "@heroicons/react/24/outline";

interface ModernTopbarProps {
  setSidebarOpen: (open: boolean) => void;
  setActiveSection: (section: string) => void;
}

const ModernTopbar: React.FC<ModernTopbarProps> = ({ setSidebarOpen, setActiveSection }) => {
  const { user } = useAuth();

  // Role-specific gradient classes
  const roleGradients = {
    admin: "from-[#6D28D9] to-[#3B82F6]", // violet → blue
    student: "from-[#2563EB] to-[#0EA5E9]", // blue → sky
    faculty: "from-[#059669] to-[#10B981]", // emerald → green
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
    <header className="bg-white/80 backdrop-blur-md shadow-lg border-b border-gray-200/50 lg:ml-0 sticky top-0 z-30">
      <div className="flex items-center justify-between px-4 sm:px-6 py-4">
        {/* Left section */}
        <div className="flex items-center space-x-4">
          {/* Mobile hamburger menu */}
          <button
            onClick={() => setSidebarOpen(true)}
            className={`lg:hidden p-2 rounded-lg bg-gradient-to-r ${currentGradient} text-white hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all duration-200 shadow-md`}
            aria-label="Toggle navigation menu"
            aria-controls="mobile-sidebar"
          >
            <Bars3Icon className="w-6 h-6 stroke-2" />
          </button>

          {/* Logo + Brand */}
          <div className="flex items-center space-x-2">
            <img
              src="/logo.png"
              alt="Attendify Logo"
              className="w-8 h-8 rounded-lg"
            />
            <span
              className={`text-xl font-bold bg-gradient-to-r ${currentGradient} bg-clip-text text-transparent`}
            >
              Attendify
            </span>
          </div>
        </div>

        {/* Right section */}
        <div className="flex items-center space-x-4">
          {user ? (
            <div className="flex items-center space-x-3">
              {/* User Initials Badge */}
              <div
                className={`w-9 h-9 bg-gradient-to-br ${currentGradient} rounded-lg flex items-center justify-center`}
              >
                <span className="text-white font-semibold text-sm">
                  {getInitials(user.name)}
                </span>
              </div>
              {/* User Details */}
              <div className="hidden sm:block text-left">
                <p className="text-sm font-medium text-gray-800 dark:text-gray-100">
                  {user.name}
                </p>
                <p className="text-xs text-gray-500 capitalize">{user.role}</p>
              </div>
            </div>
          ) : (
            <button
              onClick={() => setActiveSection("login")}
              className="text-sm font-medium text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white"
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
