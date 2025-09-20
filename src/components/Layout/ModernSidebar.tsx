import React from "react";
import { useAuth } from "../../context/AuthContext";
import { useApp } from "../../context/AppContext";
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
  X,
  CameraIcon,
} from "lucide-react";

interface ModernSidebarProps {
  sidebarOpen: boolean;
  setSidebarOpen: (open: boolean) => void;
  activeSection: string;
  setActiveSection: (section: string) => void;
}

const ModernSidebar: React.FC<ModernSidebarProps> = ({ 
  sidebarOpen, 
  setSidebarOpen, 
  activeSection, 
  setActiveSection 
}) => {
  const { user, logout } = useAuth();
  const { darkMode, toggleDarkMode } = useApp();

  const navigationItems = [
    { id: "dashboard", label: "Dashboard", icon: Home, roles: ["student", "faculty", "admin"] },
    { id: "attendance", label: "Attendance", icon: UserCheck, roles: ["student", "faculty", "admin"] },
    { id: "dual-attendance", label: "Smart Attendance", icon: CameraIcon, roles: ["student"] },
    { id: "face-enrollment", label: "Face Enrollment", icon: CameraIcon, roles: ["student"] },
    { id: "teacher-dashboard", label: "Teacher Dashboard", icon: GraduationCap, roles: ["faculty"] },
    { id: "classes", label: "Classes", icon: Calendar, roles: ["faculty", "admin"] },
    { id: "students", label: "Students", icon: Users, roles: ["faculty", "admin"] },
    { id: "faculty", label: "Faculty", icon: GraduationCap, roles: ["admin"] },
    { id: "reports", label: "Reports", icon: BarChart3, roles: ["faculty", "admin"] },
    { id: "settings", label: "Settings", icon: Settings, roles: ["student", "faculty", "admin"] },
  ];

  const filteredItems = navigationItems.filter(
    (item) => user && item.roles.includes(user.role)
  );

  return (
    <>
      {/* Mobile Overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}
      
      {/* Sidebar */}
      <aside className={`
        fixed lg:static inset-y-0 left-0 z-50 w-64 bg-white dark:bg-gray-900 shadow-lg border-r border-gray-200 dark:border-gray-700
        transform transition-transform duration-300 ease-in-out
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        flex flex-col h-screen
      `}>
        {/* Logo / Brand */}
        <div className="flex items-center justify-between px-4 py-4 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center">
            <UserCheck className="h-8 w-8 text-blue-600 mr-2" />
            <span className="font-bold text-xl text-gray-900 dark:text-white">Attendify</span>
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={toggleDarkMode}
              className="p-2 rounded-md text-gray-500 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-200"
            >
              {darkMode ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
            </button>
            {/* Mobile Close Button */}
            <button
              onClick={() => setSidebarOpen(false)}
              className="lg:hidden p-2 rounded-md text-gray-500 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-200"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Navigation Items */}
        <nav className="flex-1 overflow-y-auto py-4">
          {filteredItems.map((item) => {
            const Icon = item.icon;
            return (
              <button
                key={item.id}
                onClick={() => {
                  setActiveSection(item.id);
                  // Close sidebar on mobile after navigation
                  if (window.innerWidth < 1024) {
                    setSidebarOpen(false);
                  }
                }}
                className={`flex items-center w-full px-4 py-3 text-sm font-medium rounded-lg transition-colors duration-200 mb-1 ${
                  activeSection === item.id
                    ? "bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300"
                    : "text-gray-600 hover:text-gray-900 hover:bg-gray-100 dark:text-gray-300 dark:hover:text-white dark:hover:bg-gray-800"
                }`}
              >
                <Icon className="h-5 w-5 mr-3" />
                {item.label}
              </button>
            );
          })}
        </nav>

      {/* User Info & Logout */}
      <div className="border-t border-gray-200 dark:border-gray-700 px-4 py-4">
        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-700 dark:text-gray-300">{user?.name}</span>
          <button
            onClick={logout}
            className="flex items-center px-3 py-2 rounded-md text-sm font-medium text-red-600 hover:text-red-900 hover:bg-red-50 dark:text-red-400 dark:hover:text-red-200 dark:hover:bg-red-900/20 transition-colors duration-200"
          >
            <LogOut className="h-4 w-4 mr-1" />
            Logout
          </button>
        </div>
      </div>
      </aside>
    </>
  );
};

export default ModernSidebar;
