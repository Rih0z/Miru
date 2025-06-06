/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        pink: {
          50: '#FDF2F8',
          100: '#FCE7F3',
          200: '#FBCFE8',
          400: '#EC4899',
          500: '#D946EF',
        },
        purple: {
          50: '#FAF5FF',
          100: '#F3E8FF',
          200: '#E9D5FF',
          400: '#A855F7',
          500: '#9333EA',
          600: '#9333EA',
          700: '#7E22CE',
        },
        yellow: {
          50: '#FEFCE8',
          100: '#FEF3C7',
          200: '#FDE68A',
          500: '#EAB308',
          600: '#CA8A04',
        },
        green: {
          50: '#F0FDF4',
          100: '#DCFCE7',
          200: '#BBF7D0',
          500: '#22C55E',
          600: '#16A34A',
        },
        blue: {
          50: '#EFF6FF',
        },
        gray: {
          50: '#F9FAFB',
          100: '#F3F4F6',
          200: '#E5E7EB',
          400: '#9CA3AF',
          600: '#4B5563',
          700: '#374151',
          800: '#1F2937',
        },
      },
      backgroundImage: {
        'gradient-primary': 'linear-gradient(to right, #EC4899, #A855F7)',
        'gradient-bg': 'linear-gradient(to bottom right, #FDF2F8, #FAF5FF, #EFF6FF)',
      },
      fontFamily: {
        sans: ['-apple-system', 'BlinkMacSystemFont', '"Segoe UI"', '"Hiragino Sans"', '"Noto Sans JP"', 'sans-serif'],
      },
      animation: {
        'pulse': 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'scale': 'scale 2s ease-in-out infinite',
        'float': 'float 3s ease-in-out infinite',
        'sparkle': 'sparkle 1.5s ease-in-out infinite',
      },
      keyframes: {
        pulse: {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.5' },
        },
        scale: {
          '0%, 100%': { transform: 'scale(1)' },
          '50%': { transform: 'scale(1.05)' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-10px)' },
        },
        sparkle: {
          '0%': {
            transform: 'scale(0) rotate(0deg)',
            opacity: '0',
          },
          '50%': {
            transform: 'scale(1) rotate(180deg)',
            opacity: '1',
          },
          '100%': {
            transform: 'scale(0) rotate(360deg)',
            opacity: '0',
          },
        },
      },
    },
  },
  plugins: [],
}