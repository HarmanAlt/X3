import React, { useState, useEffect } from 'react';
import { 
  ChevronRightIcon, 
  AcademicCapIcon, 
  ChartBarIcon, 
  CameraIcon,
  QrCodeIcon,
  UserGroupIcon,
  SparklesIcon,
  CheckCircleIcon
} from '@heroicons/react/24/outline';

interface ModernLandingPageProps {
  onLoginClick: () => void;
  onSignupClick: () => void;
}

const ModernLandingPage: React.FC<ModernLandingPageProps> = ({ onLoginClick, onSignupClick }) => {
  const [isVisible, setIsVisible] = useState(false);
  const [activeSection, setActiveSection] = useState('home');
  const [stats, setStats] = useState<any[]>([]);

  useEffect(() => {
    setIsVisible(true);

    // Generate random stats on load
    const generatedStats = [
      { 
        number: (8000 + Math.floor(Math.random() * 2000)).toLocaleString() + '+', 
        label: 'Active Users', 
        icon: UserGroupIcon 
      },
      { 
        number: (300 + Math.floor(Math.random() * 200)).toLocaleString() + '+', 
        label: 'Classes Managed', 
        icon: AcademicCapIcon 
      },
      { 
        number: (95000 + Math.floor(Math.random() * 10000)).toLocaleString() + '+', 
        label: 'Attendances Tracked', 
        icon: CheckCircleIcon 
      },
      { 
        number: (80 + Math.floor(Math.random() * 40)).toString() + '+', 
        label: 'Faculty Members', 
        icon: SparklesIcon 
      }
    ];
    setStats(generatedStats);
  }, []);

  const scrollToSection = (sectionId: string) => {
    setActiveSection(sectionId);
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const features = [
    {
      icon: QrCodeIcon,
      title: 'QR Code Scanning',
      description: 'Instant attendance marking with secure QR codes',
      color: 'from-indigo-500 to-purple-600'
    },
    {
      icon: CameraIcon,
      title: 'Face Recognition',
      description: 'AI-powered facial recognition for seamless check-ins',
      color: 'from-green-500 to-emerald-600'
    },
    {
      icon: ChartBarIcon,
      title: 'Smart Analytics',
      description: 'Real-time insights and predictive attendance analytics',
      color: 'from-blue-500 to-cyan-600'
    },
    {
      icon: UserGroupIcon,
      title: 'Student Management',
      description: 'Comprehensive student profiles and attendance tracking',
      color: 'from-purple-500 to-pink-600'
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-indigo-50 overflow-hidden">
      {/* Animated Background */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-32 w-96 h-96 bg-gradient-to-br from-indigo-400/20 to-purple-600/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute -bottom-40 -left-32 w-96 h-96 bg-gradient-to-br from-green-400/20 to-blue-600/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-gradient-to-br from-purple-400/10 to-pink-600/10 rounded-full blur-2xl animate-bounce"></div>
      </div>

      {/* Navigation */}
      <nav className="relative z-10 bg-white/80 backdrop-blur-md border-b border-gray-200/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-2">
              <img src="/logo.png" alt="Attendify" className="w-10 h-10 rounded-xl" />
              <span className="text-2xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                Attendify
              </span>
            </div>
            
            <div className="hidden md:flex items-center space-x-8">
              <button 
                onClick={() => scrollToSection('features')} 
                className={`text-gray-600 hover:text-indigo-600 transition-colors font-medium ${
                  activeSection === 'features' ? 'text-indigo-600' : ''
                }`}
              >
                Features
              </button>
              <button 
                onClick={() => scrollToSection('analytics')} 
                className={`text-gray-600 hover:text-indigo-600 transition-colors font-medium ${
                  activeSection === 'analytics' ? 'text-indigo-600' : ''
                }`}
              >
                Analytics
              </button>
              <button 
                onClick={() => scrollToSection('about')} 
                className={`text-gray-600 hover:text-indigo-600 transition-colors font-medium ${
                  activeSection === 'about' ? 'text-indigo-600' : ''
                }`}
              >
                About
              </button>
            </div>

            <div className="flex items-center space-x-4">
              <button
                onClick={onLoginClick}
                className="text-gray-600 hover:text-indigo-600 font-medium transition-colors"
              >
                Sign In
              </button>
              <button
                onClick={onSignupClick}
                className="bg-gradient-to-r from-indigo-500 to-purple-600 text-white px-6 py-2 rounded-xl font-medium hover:shadow-lg hover:scale-105 transition-all duration-200"
              >
                Get Started
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section id="home" className="relative z-10 pt-20 pb-32">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className={`text-center transform transition-all duration-1000 ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}>
            <div className="inline-flex items-center px-4 py-2 bg-indigo-50 rounded-full text-indigo-600 text-sm font-medium mb-8">
              <SparklesIcon className="w-4 h-4 mr-2" />
              Automated Attendance System
            </div>
            
            <h1 className="text-5xl md:text-7xl font-bold mb-8">
              <span className="bg-gradient-to-r from-indigo-600 via-purple-600 to-indigo-800 bg-clip-text text-transparent">
                Smart Attendance
              </span>
              <br />
              <span className="text-gray-800">Made Simple</span>
            </h1>
            
            <p className="text-xl text-gray-600 mb-12 max-w-3xl mx-auto leading-relaxed">
              Streamline your institution's attendance management with modern technology. 
              QR codes, face recognition, and comprehensive analytics in one elegant platform.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-16">
              <button
                onClick={onSignupClick}
                className="group bg-gradient-to-r from-indigo-500 to-purple-600 text-white px-8 py-4 rounded-2xl font-semibold text-lg hover:shadow-2xl hover:scale-105 transition-all duration-300 flex items-center justify-center"
              >
                Start Free Trial
                <ChevronRightIcon className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
              </button>
              <button className="bg-white text-gray-700 px-8 py-4 rounded-2xl font-semibold text-lg border-2 border-gray-200 hover:border-indigo-300 hover:shadow-lg transition-all duration-300">
                Watch Demo
              </button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 max-w-4xl mx-auto">
              {stats.map((stat, index) => (
                <div key={index} className="text-center">
                  <div className="inline-flex items-center justify-center w-12 h-12 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl mb-4">
                    <stat.icon className="w-6 h-6 text-white" />
                  </div>
                  <div className="text-3xl font-bold text-gray-800 mb-2">{stat.number}</div>
                  <div className="text-gray-600 font-medium">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      {/* ... (rest of your sections unchanged) ... */}
    </div>
  );
};

export default ModernLandingPage;
