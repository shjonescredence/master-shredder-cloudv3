/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        // Master Shredder Brand Colors
        'ms': {
          'red': '#C41E3A',
          'dark-red': '#9B1C2F',
          'light-red': '#DC2B4A',
          'accent': '#8B1538',
          'blue-start': '#667eea',
          'blue-end': '#764ba2',
        },
        // Panel Colors
        'panel': {
          'dark': {
            'start': 'rgba(25, 30, 35, 0.95)',
            'end': 'rgba(30, 35, 45, 0.98)',
            'border': 'rgba(100, 120, 140, 0.2)',
            'hover': 'rgba(35, 40, 50, 1)',
          },
          'glass': {
            'bg': 'rgba(255, 255, 255, 0.05)',
            'hover': 'rgba(255, 255, 255, 0.08)',
            'border': 'rgba(255, 255, 255, 0.1)',
          }
        },
        // Status Colors
        'status': {
          'ready': '#10b981',
          'processing': '#f59e0b',
          'error': '#ef4444',
          'info': '#3b82f6',
        }
      },
      backdropBlur: {
        'xs': '2px',
        'sm': '4px',
        'md': '10px',
        'lg': '15px',
        'xl': '20px',
      },
      boxShadow: {
        'panel-primary': '0 20px 40px rgba(0, 0, 0, 0.4)',
        'panel-secondary': '0 15px 30px rgba(0, 0, 0, 0.3)',
        'panel-tertiary': '0 10px 20px rgba(0, 0, 0, 0.2)',
        'button-hover': '0 10px 25px rgba(0, 0, 0, 0.3)',
        'glow-blue': '0 4px 15px rgba(102, 126, 234, 0.4)',
        'glow-purple': '0 4px 15px rgba(118, 75, 162, 0.4)',
        'inner-glow': 'inset 0 2px 4px 0 rgba(255, 255, 255, 0.06)',
      },
      animation: {
        'subtle-pulse': 'subtle-pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'slide-up': 'slide-up 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        'slide-down': 'slide-down 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        'fade-in': 'fade-in 0.5s ease-out',
        'scale-in': 'scale-in 0.2s ease-out',
        'spin-slow': 'spin 3s linear infinite',
        'bounce-subtle': 'bounce-subtle 2s infinite',
        'shimmer': 'shimmer 2s linear infinite',
        'ripple': 'ripple 0.6s linear',
      },
      keyframes: {
        'subtle-pulse': {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.85' },
        },
        'slide-up': {
          '0%': { transform: 'translateY(10px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        'slide-down': {
          '0%': { transform: 'translateY(-10px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        'fade-in': {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        'scale-in': {
          '0%': { transform: 'scale(0.95)', opacity: '0' },
          '100%': { transform: 'scale(1)', opacity: '1' },
        },
        'bounce-subtle': {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-5px)' },
        },
        'shimmer': {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
        'ripple': {
          '0%': { transform: 'scale(0)', opacity: '1' },
          '100%': { transform: 'scale(4)', opacity: '0' },
        },
      },
      transitionTimingFunction: {
        'bounce-in': 'cubic-bezier(0.68, -0.55, 0.265, 1.55)',
        'smooth': 'cubic-bezier(0.4, 0, 0.2, 1)',
      },
      fontSize: {
        'xxs': '0.625rem',
      },
      spacing: {
        '18': '4.5rem',
        '88': '22rem',
        '128': '32rem',
      },
    },
  },
  plugins: [],
}
