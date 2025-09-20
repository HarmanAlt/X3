// Glassmorphism Design System
export const glassmorphismStyles = {
  // Base glass card styles
  card: {
    base: "bg-white/10 dark:bg-gray-900/10 backdrop-blur-md border border-white/20 dark:border-gray-700/20 rounded-2xl shadow-xl",
    hover: "hover:bg-white/20 dark:hover:bg-gray-900/20 hover:shadow-2xl transition-all duration-300",
    active: "bg-white/30 dark:bg-gray-900/30 shadow-2xl"
  },

  // Glass button styles
  button: {
    primary: "bg-gradient-to-r from-indigo-500/80 to-purple-600/80 dark:from-indigo-600/80 dark:to-purple-700/80 backdrop-blur-md border border-white/20 dark:border-gray-700/20 text-white font-semibold px-6 py-3 rounded-xl shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-300",
    secondary: "bg-white/20 dark:bg-gray-800/20 backdrop-blur-md border border-white/30 dark:border-gray-600/30 text-gray-800 dark:text-gray-200 font-semibold px-6 py-3 rounded-xl shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-300",
    ghost: "bg-transparent backdrop-blur-sm border border-white/20 dark:border-gray-700/20 text-gray-700 dark:text-gray-300 font-medium px-4 py-2 rounded-lg hover:bg-white/10 dark:hover:bg-gray-800/10 transition-all duration-300"
  },

  // Glass input styles
  input: {
    base: "bg-white/20 dark:bg-gray-800/20 backdrop-blur-md border border-white/30 dark:border-gray-600/30 text-gray-800 dark:text-gray-200 placeholder-gray-500 dark:placeholder-gray-400 px-4 py-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500/50 transition-all duration-300",
    error: "border-red-500/50 focus:ring-red-500/50"
  },

  // Glass modal styles
  modal: {
    overlay: "fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4",
    content: "bg-white/10 dark:bg-gray-900/10 backdrop-blur-xl border border-white/20 dark:border-gray-700/20 rounded-3xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
  },

  // Glass navigation styles
  navigation: {
    sidebar: "bg-white/10 dark:bg-gray-900/10 backdrop-blur-xl border-r border-white/20 dark:border-gray-700/20",
    topbar: "bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl border-b border-white/20 dark:border-gray-700/20"
  },

  // Glass dashboard styles
  dashboard: {
    card: "bg-white/10 dark:bg-gray-800/10 backdrop-blur-md border border-white/20 dark:border-gray-700/20 rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300",
    statCard: "bg-gradient-to-br from-white/20 to-white/10 dark:from-gray-800/20 dark:to-gray-700/10 backdrop-blur-md border border-white/30 dark:border-gray-600/30 rounded-2xl p-6 shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-300"
  },

  // Glass background styles
  background: {
    primary: "bg-gradient-to-br from-indigo-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-purple-900",
    secondary: "bg-gradient-to-br from-blue-50 via-white to-cyan-50 dark:from-gray-900 dark:via-gray-800 dark:to-cyan-900",
    hero: "bg-gradient-to-br from-indigo-100 via-purple-50 to-pink-100 dark:from-gray-900 dark:via-purple-900 dark:to-pink-900"
  },

  // Glass animation styles
  animation: {
    fadeIn: "animate-fade-in",
    slideUp: "animate-slide-up",
    scaleIn: "animate-scale-in",
    float: "animate-float"
  }
};

// Custom CSS classes for glassmorphism effects
export const glassmorphismClasses = `
  @keyframes fade-in {
    from { opacity: 0; transform: translateY(20px); }
    to { opacity: 1; transform: translateY(0); }
  }

  @keyframes slide-up {
    from { opacity: 0; transform: translateY(30px); }
    to { opacity: 1; transform: translateY(0); }
  }

  @keyframes scale-in {
    from { opacity: 0; transform: scale(0.9); }
    to { opacity: 1; transform: scale(1); }
  }

  @keyframes float {
    0%, 100% { transform: translateY(0px); }
    50% { transform: translateY(-10px); }
  }

  .animate-fade-in {
    animation: fade-in 0.6s ease-out;
  }

  .animate-slide-up {
    animation: slide-up 0.8s ease-out;
  }

  .animate-scale-in {
    animation: scale-in 0.5s ease-out;
  }

  .animate-float {
    animation: float 3s ease-in-out infinite;
  }

  .glass-card {
    background: rgba(255, 255, 255, 0.1);
    backdrop-filter: blur(10px);
    border: 1px solid rgba(255, 255, 255, 0.2);
    box-shadow: 0 8px 32px 0 rgba(31, 38, 135, 0.37);
  }

  .glass-card:hover {
    background: rgba(255, 255, 255, 0.2);
    box-shadow: 0 12px 40px 0 rgba(31, 38, 135, 0.5);
  }

  .glass-button {
    background: rgba(255, 255, 255, 0.2);
    backdrop-filter: blur(10px);
    border: 1px solid rgba(255, 255, 255, 0.3);
    transition: all 0.3s ease;
  }

  .glass-button:hover {
    background: rgba(255, 255, 255, 0.3);
    transform: translateY(-2px);
    box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15);
  }
`;

export default glassmorphismStyles;

