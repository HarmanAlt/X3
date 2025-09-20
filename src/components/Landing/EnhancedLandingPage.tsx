import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { glassmorphismStyles } from '../../styles/glassmorphism';
import { 
  ChevronRightIcon, 
  AcademicCapIcon, 
  ChartBarIcon, 
  CameraIcon,
  QrCodeIcon,
  UserGroupIcon,
  SparklesIcon,
  CheckCircleIcon,
  MoonIcon,
  SunIcon,
  PlayIcon,
  ShieldCheckIcon,
  ClockIcon,
  ArrowTrendingUpIcon
} from '@heroicons/react/24/outline';

interface ModernLandingPageProps {
  onLoginClick: () => void;
  onSignupClick: () => void;
}

const EnhancedLandingPage: React.FC<ModernLandingPageProps> = ({ onLoginClick, onSignupClick }) => {
  const [isVisible, setIsVisible] = useState(false);
  const [activeSection, setActiveSection] = useState('home');
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const { darkMode, toggleDarkMode } = useApp();

  useEffect(() => {
    setIsVisible(true);
    
    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({ x: e.clientX, y: e.clientY });
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
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
      color: 'from-indigo-500 to-purple-600',
      glassColor: 'bg-indigo-500/20'
    },
    {
      icon: CameraIcon,
      title: 'AI Face Recognition',
      description: 'Advanced facial recognition for seamless check-ins',
      color: 'from-green-500 to-emerald-600',
      glassColor: 'bg-green-500/20'
    },
    {
      icon: ChartBarIcon,
      title: 'Real-time Analytics',
      description: 'Live insights and predictive attendance analytics',
      color: 'from-blue-500 to-cyan-600',
      glassColor: 'bg-blue-500/20'
    },
    {
      icon: UserGroupIcon,
      title: 'Student Management',
      description: 'Comprehensive student profiles and attendance tracking',
      color: 'from-purple-500 to-pink-600',
      glassColor: 'bg-purple-500/20'
    },
    {
      icon: ShieldCheckIcon,
      title: 'Privacy First',
      description: 'Secure data handling with privacy controls',
      color: 'from-orange-500 to-red-600',
      glassColor: 'bg-orange-500/20'
    },
    {
      icon: ClockIcon,
      title: 'Real-time Updates',
      description: 'Live attendance tracking without page refresh',
      color: 'from-teal-500 to-blue-600',
      glassColor: 'bg-teal-500/20'
    }
  ];

  const stats = [
    { number: '99.9%', label: 'Accuracy Rate', icon: SparklesIcon },
    { number: 'AI-Powered', label: 'Face Recognition', icon: CameraIcon },
    { number: 'Secure', label: 'Data Protection', icon: ShieldCheckIcon },
    { number: 'Real-time', label: 'Live Updates', icon: ClockIcon }
  ];

  const testimonials = [
    {
      name: 'Dr. Sarah Johnson',
      role: 'Computer Science Professor',
      content: 'Attendify has revolutionized how we track attendance. The face recognition feature is incredibly accurate and saves us so much time.',
      avatar: 'SJ'
    },
    {
      name: 'Michael Chen',
      role: 'Student',
      content: 'As a student, I love how easy it is to mark attendance. The QR code scanning is instant and the app works perfectly on my phone.',
      avatar: 'MC'
    },
    {
      name: 'Prof. David Wilson',
      role: 'Mathematics Department',
      content: 'The analytics dashboard gives me insights I never had before. I can see attendance patterns and help struggling students proactively.',
      avatar: 'DW'
    }
  ];

  return (
    <div className={`${glassmorphismStyles.background.hero} min-h-screen overflow-hidden relative`}>
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        {/* Floating Glass Orbs */}
        <div 
          className="absolute w-96 h-96 bg-gradient-to-br from-indigo-400/20 to-purple-600/20 dark:from-indigo-600/30 dark:to-purple-800/30 rounded-full blur-3xl animate-float"
          style={{
            left: `${mousePosition.x * 0.02}px`,
            top: `${mousePosition.y * 0.02}px`,
          }}
        />
        <div 
          className="absolute w-80 h-80 bg-gradient-to-br from-green-400/20 to-blue-600/20 dark:from-green-600/30 dark:to-blue-800/30 rounded-full blur-3xl animate-float"
          style={{
            right: `${mousePosition.x * 0.01}px`,
            bottom: `${mousePosition.y * 0.01}px`,
            animationDelay: '1s'
          }}
        />
        <div 
          className="absolute w-64 h-64 bg-gradient-to-br from-purple-400/20 to-pink-600/20 dark:from-purple-600/30 dark:to-pink-800/30 rounded-full blur-2xl animate-float"
          style={{
            left: '50%',
            top: '50%',
            transform: 'translate(-50%, -50%)',
            animationDelay: '2s'
          }}
        />
      </div>

      {/* Navigation */}
      <nav className="relative z-10 bg-white/10 dark:bg-gray-900/10 backdrop-blur-xl border-b border-white/20 dark:border-gray-700/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-2">
              <div className="p-2 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-xl">
                <AcademicCapIcon className="w-8 h-8 text-white" />
              </div>
              <span className="text-2xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 dark:from-indigo-400 dark:to-purple-400 bg-clip-text text-transparent">
                Attendify
              </span>
            </div>
            
            <div className="hidden md:flex items-center space-x-8">
              <button 
                onClick={() => scrollToSection('features')} 
                className={`text-gray-700 dark:text-gray-300 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors font-medium ${
                  activeSection === 'features' ? 'text-indigo-600 dark:text-indigo-400' : ''
                }`}
              >
                Features
              </button>
              <button 
                onClick={() => scrollToSection('testimonials')} 
                className={`text-gray-700 dark:text-gray-300 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors font-medium ${
                  activeSection === 'testimonials' ? 'text-indigo-600 dark:text-indigo-400' : ''
                }`}
              >
                Testimonials
              </button>
              <button 
                onClick={() => scrollToSection('about')} 
                className={`text-gray-700 dark:text-gray-300 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors font-medium ${
                  activeSection === 'about' ? 'text-indigo-600 dark:text-indigo-400' : ''
                }`}
              >
                About
              </button>
            </div>

            <div className="flex items-center space-x-4">
              {/* Dark Mode Toggle */}
              <button
                onClick={toggleDarkMode}
                className="p-2 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-white/20 dark:hover:bg-gray-800/20 transition-colors duration-200"
                aria-label="Toggle dark mode"
              >
                {darkMode ? <SunIcon className="h-5 w-5" /> : <MoonIcon className="h-5 w-5" />}
              </button>
              
              <button
                onClick={onLoginClick}
                className="text-gray-700 dark:text-gray-300 hover:text-indigo-600 dark:hover:text-indigo-400 font-medium transition-colors"
              >
                Sign In
              </button>
              <button
                onClick={onSignupClick}
                className="bg-gradient-to-r from-indigo-500/80 to-purple-600/80 dark:from-indigo-600/80 dark:to-purple-700/80 backdrop-blur-md border border-white/20 dark:border-gray-700/20 text-white px-6 py-2 rounded-xl font-medium hover:shadow-lg hover:scale-105 transition-all duration-200"
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
            <div className="inline-flex items-center px-6 py-3 bg-white/20 dark:bg-gray-800/20 backdrop-blur-md border border-white/30 dark:border-gray-700/30 rounded-full text-indigo-600 dark:text-indigo-400 text-sm font-medium mb-8">
              <SparklesIcon className="w-5 h-5 mr-2" />
              Next-Generation Attendance Management
            </div>
            
            <h1 className="text-6xl md:text-8xl font-bold mb-8">
              <span className="bg-gradient-to-r from-indigo-600 via-purple-600 to-indigo-800 dark:from-indigo-400 dark:via-purple-400 dark:to-indigo-600 bg-clip-text text-transparent">
                Smart Attendance
              </span>
              <br />
              <span className="text-gray-800 dark:text-gray-100">Made Simple</span>
            </h1>
            
            <p className="text-xl text-gray-700 dark:text-gray-300 mb-12 max-w-4xl mx-auto leading-relaxed">
              Experience the future of attendance management with dual-mode technology. 
              QR code scanning and AI-powered face recognition in one elegant, glassmorphism-designed platform.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-6 justify-center mb-16">
              <button
                onClick={onSignupClick}
                className="group bg-gradient-to-r from-indigo-500/80 to-purple-600/80 dark:from-indigo-600/80 dark:to-purple-700/80 backdrop-blur-md border border-white/20 dark:border-gray-700/20 text-white px-8 py-4 rounded-2xl font-semibold text-lg hover:shadow-2xl hover:scale-105 transition-all duration-300 flex items-center justify-center"
              >
                Start Free Trial
                <ChevronRightIcon className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
              </button>
              <button className="bg-white/20 dark:bg-gray-800/20 backdrop-blur-md border border-white/30 dark:border-gray-700/30 text-gray-700 dark:text-gray-200 px-8 py-4 rounded-2xl font-semibold text-lg hover:shadow-lg hover:scale-105 transition-all duration-300 flex items-center justify-center">
                <PlayIcon className="w-5 h-5 mr-2" />
                Watch Demo
              </button>
            </div>

            {/* Enhanced Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 max-w-5xl mx-auto">
              {stats.map((stat, index) => (
                <div key={index} className={`${glassmorphismStyles.dashboard.statCard} text-center animate-scale-in`} style={{ animationDelay: `${index * 0.1}s` }}>
                  <div className={`w-16 h-16 bg-gradient-to-br ${stat.color} rounded-2xl flex items-center justify-center mx-auto mb-4`}>
                    <stat.icon className="w-8 h-8 text-white" />
                  </div>
                  <div className="text-4xl font-bold text-gray-800 dark:text-gray-100 mb-2">{stat.number}</div>
                  <div className="text-gray-600 dark:text-gray-300 font-medium">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="relative z-10 py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-5xl font-bold text-gray-800 dark:text-gray-100 mb-6">
              Powerful Features for Modern Education
            </h2>
            <p className="text-xl text-gray-700 dark:text-gray-300 max-w-3xl mx-auto">
              Everything you need to manage attendance efficiently with cutting-edge technology and beautiful design
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <div key={index} className={`${glassmorphismStyles.card.base} ${glassmorphismStyles.card.hover} p-8 group animate-slide-up`} style={{ animationDelay: `${index * 0.1}s` }}>
                <div className={`w-20 h-20 bg-gradient-to-br ${feature.color} rounded-3xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300`}>
                  <feature.icon className="w-10 h-10 text-white" />
                </div>
                <h3 className="text-2xl font-bold text-gray-800 dark:text-gray-100 mb-4">{feature.title}</h3>
                <p className="text-gray-700 dark:text-gray-300 leading-relaxed">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section id="testimonials" className="relative z-10 py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-5xl font-bold text-gray-800 dark:text-gray-100 mb-6">
              What Our Users Say
            </h2>
            <p className="text-xl text-gray-700 dark:text-gray-300 max-w-3xl mx-auto">
              Join thousands of educators and students who have transformed their attendance management
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <div key={index} className={`${glassmorphismStyles.card.base} ${glassmorphismStyles.card.hover} p-8 animate-fade-in`} style={{ animationDelay: `${index * 0.2}s` }}>
                <div className="flex items-center mb-6">
                  <div className="w-12 h-12 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-full flex items-center justify-center mr-4">
                    <span className="text-white font-semibold">{testimonial.avatar}</span>
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-800 dark:text-gray-100">{testimonial.name}</h4>
                    <p className="text-sm text-gray-600 dark:text-gray-300">{testimonial.role}</p>
                  </div>
                </div>
                <p className="text-gray-700 dark:text-gray-300 leading-relaxed italic">
                  "{testimonial.content}"
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* About Section */}
      <section id="about" className="relative z-10 py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-5xl font-bold text-gray-800 dark:text-gray-100 mb-6">
                About Attendify
              </h2>
              <p className="text-xl text-gray-700 dark:text-gray-300 mb-8 leading-relaxed">
                Attendify is a comprehensive automated attendance management system designed for modern educational institutions. 
                Our platform combines cutting-edge technology with beautiful glassmorphism design to streamline attendance tracking.
              </p>
              <div className="space-y-4">
                <div className="flex items-center">
                  <CheckCircleIcon className="w-6 h-6 text-green-500 mr-3" />
                  <span className="text-gray-700 dark:text-gray-300">High accuracy with QR code and face recognition</span>
                </div>
                <div className="flex items-center">
                  <CheckCircleIcon className="w-6 h-6 text-green-500 mr-3" />
                  <span className="text-gray-700 dark:text-gray-300">Real-time attendance tracking and notifications</span>
                </div>
                <div className="flex items-center">
                  <CheckCircleIcon className="w-6 h-6 text-green-500 mr-3" />
                  <span className="text-gray-700 dark:text-gray-300">Comprehensive analytics and reporting</span>
                </div>
                <div className="flex items-center">
                  <CheckCircleIcon className="w-6 h-6 text-green-500 mr-3" />
                  <span className="text-gray-700 dark:text-gray-300">Beautiful glassmorphism design system</span>
                </div>
              </div>
            </div>
            <div className={`${glassmorphismStyles.card.base} p-8`}>
              <div className="grid grid-cols-2 gap-6">
                <div className={`${glassmorphismStyles.dashboard.statCard} text-center`}>
                  <UserGroupIcon className="w-12 h-12 text-indigo-600 dark:text-indigo-400 mx-auto mb-4" />
                  <div className="text-3xl font-bold text-gray-800 dark:text-gray-100">Smart</div>
                  <div className="text-gray-600 dark:text-gray-300">Technology</div>
                </div>
                <div className={`${glassmorphismStyles.dashboard.statCard} text-center`}>
                  <AcademicCapIcon className="w-12 h-12 text-green-600 dark:text-green-400 mx-auto mb-4" />
                  <div className="text-3xl font-bold text-gray-800 dark:text-gray-100">Easy</div>
                  <div className="text-gray-600 dark:text-gray-300">Setup</div>
                </div>
                <div className={`${glassmorphismStyles.dashboard.statCard} text-center`}>
                  <ChartBarIcon className="w-12 h-12 text-purple-600 dark:text-purple-400 mx-auto mb-4" />
                  <div className="text-3xl font-bold text-gray-800 dark:text-gray-100">Fast</div>
                  <div className="text-gray-600 dark:text-gray-300">Processing</div>
                </div>
                <div className={`${glassmorphismStyles.dashboard.statCard} text-center`}>
                  <ShieldCheckIcon className="w-12 h-12 text-blue-600 dark:text-blue-400 mx-auto mb-4" />
                  <div className="text-3xl font-bold text-gray-800 dark:text-gray-100">Secure</div>
                  <div className="text-gray-600 dark:text-gray-300">Platform</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative z-10 py-24">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className={`${glassmorphismStyles.card.base} p-12`}>
            <h2 className="text-5xl font-bold text-gray-800 dark:text-gray-100 mb-6">
              Ready to Transform Your Attendance Management?
            </h2>
            <p className="text-xl text-gray-700 dark:text-gray-300 mb-8 opacity-90">
              Join the future of education with our beautiful, powerful attendance system
            </p>
            <div className="flex flex-col sm:flex-row gap-6 justify-center">
              <button
                onClick={onSignupClick}
                className="bg-gradient-to-r from-indigo-500/80 to-purple-600/80 dark:from-indigo-600/80 dark:to-purple-700/80 backdrop-blur-md border border-white/20 dark:border-gray-700/20 text-white px-8 py-4 rounded-2xl font-semibold text-lg hover:shadow-lg hover:scale-105 transition-all duration-300"
              >
                Start Free Trial
              </button>
              <button
                onClick={onLoginClick}
                className="bg-white/20 dark:bg-gray-800/20 backdrop-blur-md border border-white/30 dark:border-gray-700/30 text-gray-700 dark:text-gray-200 px-8 py-4 rounded-2xl font-semibold text-lg hover:shadow-lg hover:scale-105 transition-all duration-300"
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

export default EnhancedLandingPage;

