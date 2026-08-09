/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          dark: '#0a0a0f',
          card: '#12121a',
          purple: '#8b5cf6',
          cyan: '#06b6d4',
          pink: '#ec4899',
          gold: '#f59e0b',
          green: '#10b981',
        }
      },
      animation: {
        'pulse-glow': 'pulseGlow 2s infinite alternate',
        'equalizer': 'equalizer 1s infinite ease-in-out alternate',
        'float': 'float 3s ease-in-out infinite',
      },
      keyframes: {
        pulseGlow: {
          '0%': { boxShadow: '0 0 15px rgba(139, 92, 246, 0.4)' },
          '100%': { boxShadow: '0 0 35px rgba(236, 72, 153, 0.8)' }
        },
        equalizer: {
          '0%': { height: '15%' },
          '100%': { height: '100%' }
        },
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-8px)' }
        }
      }
    },
  },
  plugins: [],
}
