/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        primary: 'var(--color-primary, #3B82F6)',
        secondary: 'var(--color-secondary, #1E40AF)',
        accent: 'var(--color-accent, #60A5FA)',
      }
    },
  },
  plugins: [],
};
