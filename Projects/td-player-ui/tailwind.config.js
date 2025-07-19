/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{html,ts}",
    "./projects/**/*.{html,ts}",
  ],
  theme: {
    screens: {
      'sm': '640px',
      'md': '768px', 
      'lg': '1024px',
      'xl': '1280px',
      '2xl': '1536px',
    },
    extend: {
      fontFamily: {
        'display': ['ui-serif', 'Georgia', 'Cambria', 'serif'],
      },
      animation: {
        'fade-in': 'fadeIn 0.5s ease-in-out',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0', transform: 'translateY(10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        }
      },
      colors: {
        // Top Dog Arena Gaming Colors
        'tda': {
          'primary': {
            50: '#fff7ed',
            100: '#ffedd5',
            200: '#fed7aa',
            300: '#fdba74',
            400: '#fb923c',
            500: '#f97316', // Main orange
            600: '#ea580c',
            700: '#c2410c',
            800: '#9a3412',
            900: '#7c2d12',
          },
          'secondary': {
            50: '#f8fafc',
            100: '#f1f5f9',
            200: '#e2e8f0',
            300: '#cbd5e1',
            400: '#94a3b8',
            500: '#64748b', // Secondary gray-blue
            600: '#475569',
            700: '#334155',
            800: '#1e293b',
            900: '#0f172a',
          },
          'accent': {
            50: '#fef7ff',
            100: '#fce7ff',
            200: '#f9d0fe',
            300: '#f4a7fc',
            400: '#ec71f8',
            500: '#e439f1', // Neon purple accent
            600: '#d61bd1',
            700: '#b413a8',
            800: '#941189',
            900: '#7a1270',
          },
          'error': {
            50: '#fef2f2',
            100: '#fee2e2',
            200: '#fecaca',
            300: '#fca5a5',
            400: '#f87171',
            500: '#ef4444', // Error red
            600: '#dc2626',
            700: '#b91c1c',
            800: '#991b1b',
            900: '#7f1d1d',
          }
        },
        // Theme-aware colors
        'bg-primary': 'rgb(var(--color-bg-primary) / <alpha-value>)',
        'bg-secondary': 'rgb(var(--color-bg-secondary) / <alpha-value>)',
        'bg-tertiary': 'rgb(var(--color-bg-tertiary) / <alpha-value>)',
        'text-primary': 'rgb(var(--color-text-primary) / <alpha-value>)',
        'text-secondary': 'rgb(var(--color-text-secondary) / <alpha-value>)',
        'text-muted': 'rgb(var(--color-text-muted) / <alpha-value>)',
        'border': 'rgb(var(--color-border) / <alpha-value>)',
        'border-light': 'rgb(var(--color-border-light) / <alpha-value>)',
      },
      boxShadow: {
        'theme': '0 4px 6px -1px rgb(var(--shadow-color) / 0.1), 0 2px 4px -1px rgb(var(--shadow-color) / 0.06)',
      },
    },
  },
  plugins: [],
}
