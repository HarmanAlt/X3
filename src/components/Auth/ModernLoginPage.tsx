import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useApp } from '../../context/AppContext';
import { 
  EnvelopeIcon, 
  LockClosedIcon, 
  UserIcon,
  ArrowLeftIcon,
  EyeIcon,
  EyeSlashIcon,
  CheckCircleIcon,
  ExclamationCircleIcon,
  InformationCircleIcon,
  AcademicCapIcon,
  UserGroupIcon,
  CogIcon,
} from '@heroicons/react/24/outline';

interface ModernLoginPageProps {
  onSignupClick: () => void;
  onForgotPasswordClick: () => void;
  onBackToLanding: () => void;
}

const ModernLoginPage: React.FC<ModernLoginPageProps> = ({ 
  onSignupClick, 
  onForgotPasswordClick, 
  onBackToLanding 
}) => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    role: 'student'
  });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [validationErrors, setValidationErrors] = useState<{[key: string]: string}>({});
  const [isRememberMe, setIsRememberMe] = useState(false);
  const [isFormValid, setIsFormValid] = useState(false);
  const [focusedField, setFocusedField] = useState<string | null>(null);
  const { login, isLoading } = useAuth();
  const { darkMode } = useApp();

  // Role options with better icons and descriptions
  const roleOptions = [
    {
      id: 'student',
      name: 'Student',
      icon: AcademicCapIcon,
      description: 'Mark attendance and view progress',
      color: 'from-blue-500 to-cyan-600',
      bgColor: 'bg-blue-50 dark:bg-blue-900/20',
      borderColor: 'border-blue-200 dark:border-blue-800',
      textColor: 'text-blue-700 dark:text-blue-300'
    },
    {
      id: 'faculty',
      name: 'Faculty',
      icon: UserGroupIcon,
      description: 'Manage classes and track attendance',
      color: 'from-green-500 to-emerald-600',
      bgColor: 'bg-green-50 dark:bg-green-900/20',
      borderColor: 'border-green-200 dark:border-green-800',
      textColor: 'text-green-700 dark:text-green-300'
    },
    {
      id: 'admin',
      name: 'Admin',
      icon: CogIcon,
      description: 'System administration and management',
      color: 'from-purple-500 to-pink-600',
      bgColor: 'bg-purple-50 dark:bg-purple-900/20',
      borderColor: 'border-purple-200 dark:border-purple-800',
      textColor: 'text-purple-700 dark:text-purple-300'
    }
  ];

  // Real-time validation
  useEffect(() => {
    const errors: {[key: string]: string} = {};
    
    // Email validation
    if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      errors.email = 'Please enter a valid email address';
    }
    
    // Password validation
    if (formData.password && formData.password.length < 6) {
      errors.password = 'Password must be at least 6 characters';
    }
    
    setValidationErrors(errors);
    setIsFormValid(!!(formData.email && formData.password && Object.keys(errors).length === 0));
  }, [formData]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    if (!isFormValid) {
      setError('Please fill in all fields correctly.');
      return;
    }
    
    const success = await login(formData.email, formData.password, formData.role);
    if (!success) {
      setError('Invalid credentials. Please try again.');
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData({ ...formData, [field]: value });
    // Clear field-specific error when user starts typing
    if (validationErrors[field]) {
      setValidationErrors({ ...validationErrors, [field]: '' });
    }
  };

  const getFieldStatus = (field: string) => {
    if (focusedField === field) return 'focused';
    if (validationErrors[field]) return 'error';
    if (formData[field as keyof typeof formData] && !validationErrors[field]) return 'success';
    return 'default';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-purple-900 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Enhanced Animated Background */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-32 w-96 h-96 bg-gradient-to-br from-indigo-400/20 to-purple-600/20 dark:from-indigo-600/30 dark:to-purple-800/30 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute -bottom-40 -left-32 w-96 h-96 bg-gradient-to-br from-purple-400/20 to-pink-600/20 dark:from-purple-600/30 dark:to-pink-800/30 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-72 h-72 bg-gradient-to-br from-cyan-400/10 to-blue-600/10 dark:from-cyan-600/20 dark:to-blue-800/20 rounded-full blur-3xl animate-pulse delay-500"></div>
      </div>
      
      {/* Floating particles */}
      <div className="absolute inset-0">
        {[...Array(6)].map((_, i) => (
          <div
            key={i}
            className="absolute w-2 h-2 bg-indigo-400/30 dark:bg-indigo-300/40 rounded-full animate-float"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 3}s`,
              animationDuration: `${3 + Math.random() * 2}s`
            }}
          />
        ))}
      </div>

      <div className="relative z-10 w-full max-w-md animate-fade-in">
        {/* Enhanced Back Button */}
        <button
          onClick={onBackToLanding}
          className="flex items-center text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 dark:hover:text-indigo-300 mb-8 transition-all duration-300 group bg-white/20 dark:bg-gray-800/20 backdrop-blur-sm px-4 py-2 rounded-full border border-white/30 dark:border-gray-700/30 hover:bg-white/30 dark:hover:bg-gray-800/30 hover:scale-105"
        >
          <ArrowLeftIcon className="w-4 h-4 mr-2 group-hover:-translate-x-1 transition-transform duration-300" />
          Back to Home
        </button>

        {/* Enhanced Glassmorphism Card */}
        <div className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-2xl rounded-3xl shadow-2xl border border-white/30 dark:border-gray-700/30 p-8 hover:shadow-3xl transition-all duration-500 hover:scale-[1.02]">
          {/* Enhanced Header */}
          <div className="text-center mb-8 animate-slide-up">
            <div className="relative mb-6">
              <img 
                src="/logo.png" 
                alt="Attendify" 
                className="w-20 h-20 rounded-2xl shadow-lg hover:scale-110 transition-transform duration-300 animate-float mx-auto" 
              />
              <div className="absolute -inset-1 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-2xl blur opacity-30 animate-pulse"></div>
            </div>
            <h2 className="text-4xl font-bold bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 dark:from-indigo-400 dark:via-purple-400 dark:to-pink-400 bg-clip-text text-transparent mb-3 animate-fade-in">
              Welcome Back
            </h2>
            <p className="text-gray-600 dark:text-gray-300 text-lg">Sign in to your Attendify account</p>
            <div className="w-24 h-1 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-full mx-auto mt-4"></div>
          </div>

          {/* Enhanced Form */}
          <form onSubmit={handleSubmit} className="space-y-6 animate-fade-in">
            {/* Email Field */}
            <div className="space-y-2">
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                Email Address
              </label>
              <div className="relative group">
                <EnvelopeIcon className={`absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 transition-colors duration-200 ${
                  getFieldStatus('email') === 'error' ? 'text-red-500' :
                  getFieldStatus('email') === 'success' ? 'text-green-500' :
                  getFieldStatus('email') === 'focused' ? 'text-indigo-500' :
                  'text-gray-400 dark:text-gray-500'
                }`} />
                <input
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  onFocus={() => setFocusedField('email')}
                  onBlur={() => setFocusedField(null)}
                  className={`w-full pl-12 pr-12 py-4 bg-white/60 dark:bg-gray-700/60 backdrop-blur-sm border rounded-2xl focus:outline-none transition-all duration-300 text-gray-800 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 ${
                    getFieldStatus('email') === 'error' ? 'border-red-500 focus:ring-2 focus:ring-red-500/20' :
                    getFieldStatus('email') === 'success' ? 'border-green-500 focus:ring-2 focus:ring-green-500/20' :
                    getFieldStatus('email') === 'focused' ? 'border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 shadow-lg' :
                    'border-gray-200 dark:border-gray-600 focus:ring-2 focus:ring-indigo-500/20'
                  }`}
                  placeholder="Enter your email"
                  aria-label="Email address"
                  aria-describedby={validationErrors.email ? "email-error" : undefined}
                  aria-invalid={getFieldStatus('email') === 'error'}
                />
                {getFieldStatus('email') === 'success' && (
                  <CheckCircleIcon className="absolute right-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-green-500" />
                )}
                {getFieldStatus('email') === 'error' && (
                  <ExclamationCircleIcon className="absolute right-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-red-500" />
                )}
              </div>
              {validationErrors.email && (
                <p id="email-error" className="text-red-500 text-sm flex items-center" role="alert">
                  <ExclamationCircleIcon className="w-4 h-4 mr-1" />
                  {validationErrors.email}
                </p>
              )}
            </div>

            {/* Password Field */}
            <div className="space-y-2">
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                Password
              </label>
              <div className="relative group">
                <LockClosedIcon className={`absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 transition-colors duration-200 ${
                  getFieldStatus('password') === 'error' ? 'text-red-500' :
                  getFieldStatus('password') === 'success' ? 'text-green-500' :
                  getFieldStatus('password') === 'focused' ? 'text-indigo-500' :
                  'text-gray-400 dark:text-gray-500'
                }`} />
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  value={formData.password}
                  onChange={(e) => handleInputChange('password', e.target.value)}
                  onFocus={() => setFocusedField('password')}
                  onBlur={() => setFocusedField(null)}
                  className={`w-full pl-12 pr-12 py-4 bg-white/60 dark:bg-gray-700/60 backdrop-blur-sm border rounded-2xl focus:outline-none transition-all duration-300 text-gray-800 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 ${
                    getFieldStatus('password') === 'error' ? 'border-red-500 focus:ring-2 focus:ring-red-500/20' :
                    getFieldStatus('password') === 'success' ? 'border-green-500 focus:ring-2 focus:ring-green-500/20' :
                    getFieldStatus('password') === 'focused' ? 'border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 shadow-lg' :
                    'border-gray-200 dark:border-gray-600 focus:ring-2 focus:ring-indigo-500/20'
                  }`}
                  placeholder="Enter your password"
                  aria-label="Password"
                  aria-describedby={validationErrors.password ? "password-error" : undefined}
                  aria-invalid={getFieldStatus('password') === 'error'}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 transition-colors duration-200 hover:scale-110"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? <EyeSlashIcon className="w-5 h-5" /> : <EyeIcon className="w-5 h-5" />}
                </button>
              </div>
              {validationErrors.password && (
                <p id="password-error" className="text-red-500 text-sm flex items-center" role="alert">
                  <ExclamationCircleIcon className="w-4 h-4 mr-1" />
                  {validationErrors.password}
                </p>
              )}
            </div>

            {/* Enhanced Role Selection */}
            <div className="space-y-3">
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
                Select Your Role
              </label>
              <div className="grid grid-cols-1 gap-3">
                {roleOptions.map((role) => {
                  const Icon = role.icon;
                  const isSelected = formData.role === role.id;
                  
                  return (
                    <button
                      key={role.id}
                      type="button"
                      onClick={() => handleInputChange('role', role.id)}
                      className={`relative p-4 rounded-2xl border-2 transition-all duration-300 text-left group hover:scale-[1.02] ${
                        isSelected
                          ? `${role.bgColor} ${role.borderColor} shadow-lg`
                          : 'bg-white/40 dark:bg-gray-700/40 border-gray-200 dark:border-gray-600 hover:bg-white/60 dark:hover:bg-gray-700/60'
                      }`}
                    >
                      <div className="flex items-center space-x-4">
                        <div className={`p-3 rounded-xl transition-all duration-300 ${
                          isSelected 
                            ? `bg-gradient-to-r ${role.color} shadow-lg` 
                            : 'bg-gray-100 dark:bg-gray-600 group-hover:bg-gray-200 dark:group-hover:bg-gray-500'
                        }`}>
                          <Icon className={`w-6 h-6 ${
                            isSelected ? 'text-white' : 'text-gray-600 dark:text-gray-300'
                          }`} />
                        </div>
                        <div className="flex-1">
                          <h3 className={`font-semibold text-lg ${
                            isSelected 
                              ? role.textColor 
                              : 'text-gray-800 dark:text-gray-100'
                          }`}>
                            {role.name}
                          </h3>
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            {role.description}
                          </p>
                        </div>
                        {isSelected && (
                          <CheckCircleIcon className={`w-6 h-6 ${role.textColor}`} />
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Remember Me Checkbox */}
            <div className="flex items-center justify-between">
              <label className="flex items-center space-x-2 cursor-pointer group">
                <input
                  type="checkbox"
                  checked={isRememberMe}
                  onChange={(e) => setIsRememberMe(e.target.checked)}
                  className="w-4 h-4 text-indigo-600 bg-white/60 dark:bg-gray-700/60 border-gray-300 dark:border-gray-600 rounded focus:ring-indigo-500 focus:ring-2 transition-all duration-200"
                />
                <span className="text-sm text-gray-700 dark:text-gray-300 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors duration-200">
                  Remember me
                </span>
              </label>
            </div>

            {/* Enhanced Error Message */}
            {error && (
              <div className="bg-red-50/80 dark:bg-red-900/20 border border-red-200 dark:border-red-800/30 rounded-2xl p-4 text-red-600 dark:text-red-400 text-sm flex items-center animate-fade-in backdrop-blur-sm" role="alert" aria-live="polite">
                <ExclamationCircleIcon className="w-5 h-5 mr-2 flex-shrink-0" />
                {error}
              </div>
            )}

            {/* Enhanced Submit Button */}
            <button
              type="submit"
              disabled={isLoading || !isFormValid}
              className={`w-full py-4 rounded-2xl font-semibold text-lg transition-all duration-300 transform ${
                isFormValid && !isLoading
                  ? 'bg-gradient-to-r from-indigo-500 to-purple-600 text-white hover:shadow-xl hover:scale-[1.02] hover:from-indigo-600 hover:to-purple-700'
                  : 'bg-gray-300 dark:bg-gray-600 text-gray-500 dark:text-gray-400 cursor-not-allowed'
              }`}
            >
              {isLoading ? (
                <div className="flex items-center justify-center">
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2"></div>
                  Signing In...
                </div>
              ) : (
                <div className="flex items-center justify-center">
                  <span>Sign In</span>
                  {isFormValid && (
                    <CheckCircleIcon className="w-5 h-5 ml-2" />
                  )}
                </div>
              )}
            </button>

            {/* Forgot Password */}
            <div className="text-center">
              <button
                type="button"
                onClick={onForgotPasswordClick}
                className="text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 dark:hover:text-indigo-300 font-medium transition-all duration-200 hover:underline"
              >
                Forgot your password?
              </button>
            </div>

            {/* Divider */}
            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-200 dark:border-gray-700"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-4 bg-white dark:bg-gray-800 text-gray-500 dark:text-gray-400">or continue with</span>
              </div>
            </div>

            {/* Social Login Options */}
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                className="flex items-center justify-center px-4 py-3 border border-gray-200 dark:border-gray-700 rounded-2xl bg-white/60 dark:bg-gray-700/60 backdrop-blur-sm hover:bg-white/80 dark:hover:bg-gray-700/80 transition-all duration-200 hover:scale-105"
              >
                <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                </svg>
                Google
              </button>
              <button
                type="button"
                className="flex items-center justify-center px-4 py-3 border border-gray-200 dark:border-gray-700 rounded-2xl bg-white/60 dark:bg-gray-700/60 backdrop-blur-sm hover:bg-white/80 dark:hover:bg-gray-700/80 transition-all duration-200 hover:scale-105"
              >
                <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                </svg>
                Facebook
              </button>
            </div>

            {/* Sign Up Link */}
            <div className="text-center pt-6 border-t border-gray-200 dark:border-gray-700">
              <span className="text-gray-600 dark:text-gray-400">Don't have an account? </span>
              <button
                type="button"
                onClick={onSignupClick}
                className="text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 dark:hover:text-indigo-300 font-semibold transition-all duration-200 hover:underline"
              >
                Sign up here
              </button>
            </div>
          </form>

          {/* Enhanced Demo Credentials */}
          <div className="mt-8 p-6 bg-gradient-to-r from-indigo-50/80 to-purple-50/80 dark:from-indigo-900/20 dark:to-purple-900/20 rounded-2xl border border-indigo-100/50 dark:border-indigo-800/30 backdrop-blur-sm">
            <div className="flex items-center mb-3">
              <InformationCircleIcon className="w-5 h-5 text-indigo-600 dark:text-indigo-400 mr-2" />
              <h4 className="text-sm font-semibold text-indigo-800 dark:text-indigo-300">Demo Credentials</h4>
            </div>
            <div className="text-xs text-indigo-700 dark:text-indigo-400 space-y-2">
              <div className="flex justify-between items-center p-2 bg-white/50 dark:bg-gray-800/50 rounded-lg">
                <span className="font-medium">Admin:</span>
                <span className="font-mono">admin@attendify.com / password123</span>
              </div>
              <div className="flex justify-between items-center p-2 bg-white/50 dark:bg-gray-800/50 rounded-lg">
                <span className="font-medium">Faculty:</span>
                <span className="font-mono">faculty@attendify.com / password123</span>
              </div>
              <div className="flex justify-between items-center p-2 bg-white/50 dark:bg-gray-800/50 rounded-lg">
                <span className="font-medium">Student:</span>
                <span className="font-mono">student@attendify.com / password123</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ModernLoginPage;