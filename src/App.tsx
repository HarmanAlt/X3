import React, { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { AppProvider } from './context/AppContext';
import { apiService } from './services/api';
import EnhancedLandingPage from './components/Landing/EnhancedLandingPage';
import ModernLoginPage from './components/Auth/ModernLoginPage';
import SignupPage from './components/Auth/SignupPage';
import ForgotPasswordPage from './components/Auth/ForgotPasswordPage';
import ModernSidebar from './components/Layout/ModernSidebar';
import ModernTopbar from './components/Layout/ModernTopbar';
import ModernDashboard from './components/Dashboard/ModernDashboard';
import AttendanceSection from './components/Attendance/AttendanceSection';
import DualAttendanceSystem from './components/Attendance/DualAttendanceSystem';
import FaceEnrollmentSystem from './components/Attendance/FaceEnrollmentSystem';
import TeacherDashboard from './components/Teacher/TeacherDashboard';
import ClassesSection from './components/Classes/ClassesSection';
import StudentsSection from './components/Students/StudentsSection';
import FacultySection from './components/Faculty/FacultySection';
import ReportsSection from './components/Reports/ReportsSection';
import AnalyticsSection from './components/Analytics/AnalyticsSection';
import SettingsSection from './components/Settings/SettingsSection';

const AppContent: React.FC = () => {
  const { user, isLoading, token } = useAuth();
  const [activeSection, setActiveSection] = useState('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [authView, setAuthView] = useState<'landing' | 'login' | 'signup' | 'forgot'>('landing');

  // Initialize API service with token
  useEffect(() => {
    apiService.setToken(token);
  }, [token]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100 dark:bg-gray-900">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  // Unauthenticated Routes
  if (!user) {
    switch (authView) {
      case 'landing':
        return (
          <EnhancedLandingPage
            onLoginClick={() => setAuthView('login')}
            onSignupClick={() => setAuthView('signup')}
          />
        );
      case 'login':
        return (
          <ModernLoginPage
            onSignupClick={() => setAuthView('signup')}
            onForgotPasswordClick={() => setAuthView('forgot')}
            onBackToLanding={() => setAuthView('landing')}
          />
        );
      case 'signup':
        return (
          <SignupPage
            onLoginClick={() => setAuthView('login')}
            onBackToLanding={() => setAuthView('landing')}
          />
        );
      case 'forgot':
        return (
          <ForgotPasswordPage
            onBackToLogin={() => setAuthView('login')}
            onBackToLanding={() => setAuthView('landing')}
          />
        );
      default:
        return (
          <EnhancedLandingPage
            onLoginClick={() => setAuthView('login')}
            onSignupClick={() => setAuthView('signup')}
          />
        );
    }
  }

  // Authenticated Routes
  const renderActiveSection = () => {
    switch (activeSection) {
      case 'dashboard':
        return <ModernDashboard setActiveSection={setActiveSection} />;
      case 'attendance':
        return <AttendanceSection />;
      case 'dual-attendance':
        return <DualAttendanceSystem />;
      case 'face-enrollment':
        return <FaceEnrollmentSystem />;
      case 'teacher-dashboard':
        return <TeacherDashboard />;
      case 'classes':
        return <ClassesSection />;
      case 'students':
        return <StudentsSection />;
      case 'faculty':
        return <FacultySection />;
      case 'reports':
        return <ReportsSection />;
      case 'analytics':
        return <AnalyticsSection />;
      case 'settings':
        return <SettingsSection />;
      default:
        return <ModernDashboard setActiveSection={setActiveSection} />;
    }
  };

  return (
    <div className="flex h-screen bg-gradient-to-br from-slate-50 via-white to-indigo-50 dark:from-gray-900 dark:via-gray-800 dark:to-indigo-900 overflow-hidden">
      {/* Sidebar */}
      <ModernSidebar 
        activeSection={activeSection} 
        setActiveSection={setActiveSection}
        sidebarOpen={sidebarOpen}
        setSidebarOpen={setSidebarOpen}
      />

      {/* Main Area */}
      <div className="flex flex-1 flex-col">
        {/* Topbar */}
        <ModernTopbar 
          setSidebarOpen={setSidebarOpen} 
          setActiveSection={setActiveSection} 
        />

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
          <div className="max-w-7xl mx-auto">
            {renderActiveSection()}
          </div>
        </main>
      </div>
    </div>
  );
};

function App() {
  return (
    <AuthProvider>
      <AppProvider>
        <AppContent />
      </AppProvider>
    </AuthProvider>
  );
}

export default App;
