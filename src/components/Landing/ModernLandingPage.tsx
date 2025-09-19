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

  useEffect(() => {
    setIsVisible(true);
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

  const stats = [
    { number: '99.9%', label: 'Accuracy Rate', icon: SparklesIcon },
    { number: 'Smart', label: 'AI Recognition', icon: UserGroupIcon },
    { number: 'Secure', label: 'Data Protection', icon: AcademicCapIcon },
    { number: '24/7', label: 'System Uptime', icon: CheckCircleIcon }
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
      <section id="features" className="relative z-10 py-24 bg-white/50 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-800 mb-4">
              Powerful Features for Modern Education
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Everything you need to manage attendance efficiently with cutting-edge technology
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <div key={index} className="group">
                <div className="bg-white rounded-3xl p-8 shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 border border-gray-100">
                  <div className={`w-16 h-16 bg-gradient-to-br ${feature.color} rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300`}>
                    <feature.icon className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-800 mb-4">{feature.title}</h3>
                  <p className="text-gray-600 leading-relaxed">{feature.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Analytics Section */}
      <section id="analytics" className="relative z-10 py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-800 mb-4">
              Advanced Analytics & Insights
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Get detailed insights into attendance patterns and student performance
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white rounded-3xl p-8 shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 border border-gray-100">
              <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-cyan-600 rounded-2xl flex items-center justify-center mb-6">
                <ChartBarIcon className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-bold text-gray-800 mb-4">Real-time Reports</h3>
              <p className="text-gray-600 leading-relaxed">Generate comprehensive attendance reports with filtering and export options</p>
            </div>
            
            <div className="bg-white rounded-3xl p-8 shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 border border-gray-100">
              <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-600 rounded-2xl flex items-center justify-center mb-6">
                <SparklesIcon className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-bold text-gray-800 mb-4">Predictive Analytics</h3>
              <p className="text-gray-600 leading-relaxed">AI-powered predictions for attendance patterns and at-risk students</p>
            </div>
            
            <div className="bg-white rounded-3xl p-8 shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 border border-gray-100">
              <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl flex items-center justify-center mb-6">
                <UserGroupIcon className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-bold text-gray-800 mb-4">Student Insights</h3>
              <p className="text-gray-600 leading-relaxed">Detailed student performance analytics and attendance trends</p>
            </div>
          </div>
        </div>
      </section>
      {/* About Section */}
      <section id="about" className="relative z-10 py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-4xl font-bold text-gray-800 mb-6">About Attendify</h2>
              <p className="text-xl text-gray-600 mb-8 leading-relaxed">
                Attendify is a comprehensive automated attendance management system designed for modern educational institutions. 
                Our platform combines cutting-edge technology with user-friendly design to streamline attendance tracking.
              </p>
              <div className="space-y-4">
                <div className="flex items-center">
                  <CheckCircleIcon className="w-6 h-6 text-green-500 mr-3" />
                  <span className="text-gray-700">High accuracy with QR code and face recognition</span>
                </div>
                <div className="flex items-center">
                  <CheckCircleIcon className="w-6 h-6 text-green-500 mr-3" />
                  <span className="text-gray-700">Real-time attendance tracking and notifications</span>
                </div>
                <div className="flex items-center">
                  <CheckCircleIcon className="w-6 h-6 text-green-500 mr-3" />
                  <span className="text-gray-700">Comprehensive analytics and reporting</span>
                </div>
                <div className="flex items-center">
                  <CheckCircleIcon className="w-6 h-6 text-green-500 mr-3" />
                  <span className="text-gray-700">Easy CSV import/export for bulk operations</span>
                </div>
              </div>
            </div>
            <div className="bg-gradient-to-br from-indigo-100 to-purple-100 rounded-3xl p-8">
              <div className="grid grid-cols-2 gap-6">
                <div className="bg-white rounded-2xl p-6 text-center shadow-lg">
                  <UserGroupIcon className="w-12 h-12 text-indigo-600 mx-auto mb-4" />
                  <div className="text-3xl font-bold text-gray-800">Smart</div>
                  <div className="text-gray-600">Technology</div>
                </div>
                <div className="bg-white rounded-2xl p-6 text-center shadow-lg">
                  <AcademicCapIcon className="w-12 h-12 text-green-600 mx-auto mb-4" />
                  <div className="text-3xl font-bold text-gray-800">Easy</div>
                  <div className="text-gray-600">Setup</div>
                </div>
                <div className="bg-white rounded-2xl p-6 text-center shadow-lg">
                  <ChartBarIcon className="w-12 h-12 text-purple-600 mx-auto mb-4" />
                  <div className="text-3xl font-bold text-gray-800">Fast</div>
                  <div className="text-gray-600">Processing</div>
                </div>
                <div className="bg-white rounded-2xl p-6 text-center shadow-lg">
                  <CheckCircleIcon className="w-12 h-12 text-blue-600 mx-auto mb-4" />
                  <div className="text-3xl font-bold text-gray-800">Secure</div>
                  <div className="text-gray-600">Platform</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative z-10 py-24">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="bg-gradient-to-r from-indigo-500 to-purple-600 rounded-3xl p-12 text-white">
            <h2 className="text-4xl font-bold mb-6">Ready to Get Started with Attendify?</h2>
            <p className="text-xl mb-8 opacity-90">
              Transform your attendance management with modern technology
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button
                onClick={onSignupClick}
                className="bg-white text-indigo-600 px-8 py-4 rounded-2xl font-semibold text-lg hover:shadow-lg hover:scale-105 transition-all duration-300"
              >
                Start Free Trial
              </button>
              <button
                onClick={onLoginClick}
                className="border-2 border-white text-white px-8 py-4 rounded-2xl font-semibold text-lg hover:bg-white hover:text-indigo-600 transition-all duration-300"
              >
                Sign In
              </button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default ModernLandingPage;