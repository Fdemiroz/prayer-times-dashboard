import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './lib/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  darkMode: 'class',
  theme: {
    extend: {
      // Custom fonts for mosque-style typography
      fontFamily: {
        arabic: ['Amiri', 'serif'],
        mono: ['IBM Plex Mono', 'monospace'],
        display: ['Outfit', 'sans-serif'],
      },
      // Extended font sizes for large display
      fontSize: {
        '8xl': '6rem',
        '9xl': '8rem',
      },
      // Custom animations
      animation: {
        'gradient-slow': 'gradient 15s ease infinite',
        'pulse-slow': 'pulse 4s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'glow': 'glow 2s ease-in-out infinite alternate',
      },
      keyframes: {
        gradient: {
          '0%, 100%': { backgroundPosition: '0% 50%' },
          '50%': { backgroundPosition: '100% 50%' },
        },
        glow: {
          '0%': { boxShadow: '0 0 20px rgba(34, 197, 94, 0.3)' },
          '100%': { boxShadow: '0 0 40px rgba(34, 197, 94, 0.6)' },
        },
      },
      // Colors for Islamic theme
      colors: {
        islamic: {
          green: '#22c55e',
          gold: '#d4af37',
          dark: '#0a0a0a',
        },
      },
    },
  },
  plugins: [],
}

export default config
