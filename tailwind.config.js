/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './pages/**/*.{js,jsx,ts,tsx}',
    './components/**/*.{js,jsx,ts,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        'outlook-blue': '#0078D4',
        'outlook-blue-hover': '#106EBE',
        'outlook-blue-light': '#2B2B2B',
        'outlook-blue-lighter': '#333333',
        'agent-indigo': '#6366F1',
        'outlook-bg': '#1F1F1F',
        'outlook-bg-alt': '#212121',
        'outlook-sidebar': '#212121',
        'outlook-rail': '#292929',
        'outlook-border': '#333333',
        'outlook-border-dark': '#3D3D3D',
        'outlook-hover': '#2B2B2B',
        'outlook-selected': '#333333',
        'outlook-text': '#FFFFFF',
        'outlook-text-secondary': '#A19F9D',
        'outlook-text-tertiary': '#8A8886',
        success: '#22C55E',
        warning: '#F59E0B',
        error: '#EF4444',
      },
      fontFamily: {
        sans: ['Segoe UI', 'Segoe UI Web (West European)', '-apple-system', 'BlinkMacSystemFont', 'Roboto', 'Helvetica Neue', 'sans-serif'],
        mono: ['SF Mono', 'Consolas', 'Monaco', 'monospace'],
      },
      boxShadow: {
        'inner-sm': 'inset 0 1px 2px 0 rgba(0, 0, 0, 0.05)',
        'glass': '0 8px 32px 0 rgba(31, 38, 135, 0.37)',
      },
      backdropBlur: {
        xs: '2px',
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'checkmark': 'checkmark 0.3s ease-in-out',
        'slide-in': 'slideIn 0.3s ease-out',
        'fade-in': 'fadeIn 0.2s ease-out',
      },
      keyframes: {
        checkmark: {
          '0%': { transform: 'scale(0)', opacity: '0' },
          '50%': { transform: 'scale(1.2)' },
          '100%': { transform: 'scale(1)', opacity: '1' },
        },
        slideIn: {
          '0%': { transform: 'translateX(20px)', opacity: '0' },
          '100%': { transform: 'translateX(0)', opacity: '1' },
        },
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
      },
    },
  },
  plugins: [],
}

