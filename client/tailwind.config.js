/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        // Base Theme Colors
        'ms-blue': {
          start: '#2563eb',
          end: '#1d4ed8',
        },
        // Panel Colors
        'panel': {
          'gradient-from': 'rgba(25, 30, 35, 0.95)',
          'gradient-to': 'rgba(30, 35, 45, 0.98)',
          'glass-bg': 'rgba(255, 255, 255, 0.05)',
          'dark-border': 'rgba(100, 120, 140, 0.2)',
          'glass-border': 'rgba(255, 255, 255, 0.1)',
        },
        // Status Colors
        'status': {
          'ready': 'rgba(34, 197, 94, 1)',
          'processing': 'rgba(59, 130, 246, 1)',
          'error': 'rgba(239, 68, 68, 1)',
        },
        // Button Colors
        'button': {
          'primary': 'rgba(37, 99, 235, 1)',
          'secondary': 'rgba(75, 85, 99, 1)',
        },
      },
      spacing: {
        'panel': {
          'sm': '16px',
          'md': '20px',
          'lg': '24px',
        },
      },
      boxShadow: {
        'panel-primary': '0 20px 40px rgba(0, 0, 0, 0.4)',
        'panel-secondary': '0 15px 30px rgba(0, 0, 0, 0.3)',
        'panel-tertiary': '0 10px 20px rgba(0, 0, 0, 0.2)',
      },
      backgroundImage: {
        'panel-gradient': 'linear-gradient(135deg, var(--tw-gradient-from), var(--tw-gradient-to))',
      },
    },
  },
  plugins: [
    require('@tailwindcss/forms'),
    require('@tailwindcss/typography'),
  ],
}
