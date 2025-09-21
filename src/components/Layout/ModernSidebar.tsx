import React from "react";
import { useAuth } from "../../context/AuthContext";
import {
  HomeIcon,
  UserGroupIcon,
  CalendarIcon,
  AcademicCapIcon,
  UserCheckIcon,
  ChartBarIcon,
  CogIcon,
  ArrowRightOnRectangleIcon,
  XMarkIcon,
  CameraIcon,
  DocumentTextIcon,
  ClipboardDocumentListIcon,
  PresentationChartBarIcon,
} from "@heroicons/react/24/outline";

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

  // Role-specific gradient classes
  const roleGradients = {
    admin: 'from-[#6D28D9] to-[#3B82F6]',
    student: 'from-[#2563EB] to-[#0EA5E9]',
    faculty: 'from-[#059669] to-[#10B981]'
  };

  const currentGradient = roleGradients[user?.role as keyof typeof roleGradients] || roleGradients.admin;

  const navigationItems = [
    { id: "dashboard", label: "Dashboard", icon: HomeIcon, roles: ["student", "faculty", "admin"] },
    { id: "attendance", label: "Attendance", icon: UserCheckIcon, roles: ["student", "faculty", "admin"] },
    { id: "dual-attendance", label: "Smart Attendance", icon: CameraIcon, roles: ["student"] },
    { id: "face-enrollment", label: "Face Enrollment", icon: CameraIcon, roles: ["student"] },
    { id: "teacher-dashboard", label: "Teacher Dashboard", icon: AcademicCapIcon, roles: ["faculty"] },
    { id: "classes", label: "Classes", icon: CalendarIcon, roles: ["faculty", "admin"] },
    { id: "students", label: "Students", icon: UserGroupIcon, roles: ["faculty", "admin"] },
    { id: "faculty", label: "Faculty", icon: AcademicCapIcon, roles: ["admin"] },
    { id: "reports", label: "Reports", icon: DocumentTextIcon, roles: ["faculty", "admin"] },
    { id: "analytics", label: "Analytics", icon: ChartBarIcon, roles: ["student", "faculty", "admin"] },
    { id: "settings", label: "Settings", icon: CogIcon, roles: ["student", "faculty", "admin"] },
  ];

  const filteredItems = navigationItems.filter(
    (item) => user && item.roles.includes(user.role)
  );

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
    <>
      {/* Mobile Overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}
      
      {/* Enhanced Sidebar */}
      <aside className={`
        fixed lg:static inset-y-0 left-0 z-50 w-72 bg-white/90 dark:bg-gray-900/90 backdrop-blur-xl shadow-2xl border-r border-white/20 dark:border-gray-700/20
        transform transition-all duration-300 ease-in-out
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        flex flex-col h-screen
      `}>
        {/* Enhanced Logo / Brand */}
        <div className="relative p-6 border-b border-white/20 dark:border-gray-700/20">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className={`p-2 bg-gradient-to-r ${currentGradient} rounded-xl shadow-lg`}>
                <UserCheckIcon className="h-8 w-8 text-white" />
              </div>
              <div>
                <span className="font-bold text-xl text-gray-900 dark:text-white">Attendify</span>
                <p className="text-xs text-gray-500 dark:text-gray-400 capitalize">{user?.role} Portal</p>
              </div>
            </div>
            {/* Mobile Close Button */}
            <button
              onClick={() => setSidebarOpen(false)}
              className="lg:hidden p-2 rounded-xl text-gray-500 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-200 hover:bg-white/20 dark:hover:bg-gray-800/20 transition-all duration-200"
            >
              <XMarkIcon className="h-5 w-5" />
            </button>
          </div>
          
          {/* User Profile Card */}
          <div className="mt-4 p-4 bg-gradient-to-r from-white/20 to-white/10 dark:from-gray-800/20 dark:to-gray-700/10 backdrop-blur-sm rounded-2xl border border-white/30 dark:border-gray-600/30">
            <div className="flex items-center space-x-3">
              <div className={`w-12 h-12 bg-gradient-to-br ${currentGradient} rounded-xl flex items-center justify-center shadow-lg`}>
                <span className="text-white font-bold text-lg">
                  {getInitials(user?.name)}
                </span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-gray-900 dark:text-white truncate">
                  {user?.name}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                  {user?.email}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Enhanced Navigation Items */}
        <nav className="flex-1 overflow-y-auto py-6 px-4 space-y-2">
          {filteredItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeSection === item.id;
            
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
                className={`group flex items-center w-full px-4 py-3 text-sm font-medium rounded-2xl transition-all duration-300 ${
                  isActive
                    ? `bg-gradient-to-r ${currentGradient} text-white shadow-lg transform scale-[1.02]`
                    : "text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-white/20 dark:hover:bg-gray-800/20 hover:scale-[1.01]"
                }`}
              >
                <div className={`p-2 rounded-xl mr-3 transition-all duration-300 ${
                  isActive 
                    ? 'bg-white/20 shadow-md' 
                    : 'bg-gray-100/50 dark:bg-gray-700/50 group-hover:bg-white/30 dark:group-hover:bg-gray-600/50'
                }`}>
                  <Icon className="h-5 w-5" />
                </div>
                <span className="font-medium">{item.label}</span>
                {isActive && (
                  <div className="ml-auto w-2 h-2 bg-white rounded-full animate-pulse"></div>
                )}
              </button>
            );
          })}
        </nav>

        {/* Enhanced User Info & Logout */}
        <div className="border-t border-white/20 dark:border-gray-700/20 p-4">
          <button
            onClick={logout}
            className="group flex items-center w-full px-4 py-3 text-sm font-medium text-red-600 dark:text-red-400 hover:text-red-800 dark:hover:text-red-300 hover:bg-red-50/50 dark:hover:bg-red-900/20 rounded-2xl transition-all duration-300 hover:scale-[1.02]"
          >
            <div className="p-2 rounded-xl mr-3 bg-red-100/50 dark:bg-red-900/30 group-hover:bg-red-200/50 dark:group-hover:bg-red-800/30 transition-all duration-300">
              <ArrowRightOnRectangleIcon className="h-5 w-5" />
            </div>
            <span className="font-medium">Sign Out</span>
          </button>
        </div>
      </aside>
    </>
  );
};

export default ModernSidebar;