/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx,html}",
  ],
  theme: {
    extend: {
      colors: {
        // Dark Blue Theme
        primary: {
          50: '#e6f1ff',
          100: '#cce3ff',
          200: '#99c7ff',
          300: '#66abff',
          400: '#338fff',
          500: '#0073ff',
          600: '#005acc',
          700: '#004299',
          800: '#002b66',
          900: '#001433',
        },
        dark: {
          50: '#e8eaf0',
          100: '#d1d5e1',
          200: '#a3abc3',
          300: '#7581a5',
          400: '#475787',
          500: '#1a2d69',
          600: '#152454',
          700: '#101b3f',
          800: '#0a122a',
          900: '#050915',
        },
        accent: {
          cyan: '#06b6d4',
          blue: '#3b82f6',
          indigo: '#6366f1',
          purple: '#8b5cf6',
        },
        background: {
          primary: '#0a0e1a',
          secondary: '#0f172a',
          tertiary: '#1e293b',
          card: '#1a2332',
        },
        border: {
          light: '#334155',
          DEFAULT: '#475569',
          dark: '#64748b',
        }
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'gradient-dark-blue': 'linear-gradient(135deg, #0a0e1a 0%, #1e293b 100%)',
        'gradient-primary': 'linear-gradient(135deg, #0073ff 0%, #005acc 100%)',
        'gradient-accent': 'linear-gradient(135deg, #06b6d4 0%, #3b82f6 100%)',
      },
      boxShadow: {
        'glow-sm': '0 0 10px rgba(0, 115, 255, 0.3)',
        'glow': '0 0 20px rgba(0, 115, 255, 0.4)',
        'glow-lg': '0 0 30px rgba(0, 115, 255, 0.5)',
        'card': '0 4px 6px -1px rgba(0, 0, 0, 0.3), 0 2px 4px -1px rgba(0, 0, 0, 0.2)',
        'card-hover': '0 10px 15px -3px rgba(0, 115, 255, 0.3), 0 4px 6px -2px rgba(0, 115, 255, 0.2)',
      },
      animation: {
        'fade-in': 'fadeIn 0.5s ease-in-out',
        'slide-up': 'slideUp 0.5s ease-out',
        'slide-down': 'slideDown 0.5s ease-out',
        'pulse-glow': 'pulseGlow 2s ease-in-out infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { transform: 'translateY(20px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        slideDown: {
          '0%': { transform: 'translateY(-20px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        pulseGlow: {
          '0%, 100%': { boxShadow: '0 0 20px rgba(0, 115, 255, 0.4)' },
          '50%': { boxShadow: '0 0 30px rgba(0, 115, 255, 0.6)' },
        },
      },
    },
  },
  plugins: [],
}
