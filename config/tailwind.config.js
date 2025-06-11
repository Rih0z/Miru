/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        // Dark Mode First - Primary Palette
        bg: {
          primary: 'var(--bg-primary)',
          secondary: 'var(--bg-secondary)',
          tertiary: 'var(--bg-tertiary)',
          elevated: 'var(--bg-elevated)',
        },
        text: {
          primary: 'var(--text-primary)',
          secondary: 'var(--text-secondary)',
          tertiary: 'var(--text-tertiary)',
          disabled: 'var(--text-disabled)',
        },
        // Neobrutalism Accent Colors
        accent: {
          primary: 'var(--accent-primary)',
          secondary: 'var(--accent-secondary)',
          tertiary: 'var(--accent-tertiary)',
          warning: 'var(--accent-warning)',
          success: 'var(--accent-success)',
          error: 'var(--accent-error)',
          info: 'var(--accent-info)',
        },
        // Glassmorphism
        glass: {
          5: 'var(--glass-white-5)',
          10: 'var(--glass-white-10)',
          15: 'var(--glass-white-15)',
          20: 'var(--glass-white-20)',
          border: 'var(--glass-border)',
        },
      },
      fontFamily: {
        display: ['var(--font-display)'],
        body: ['var(--font-body)'],
        mono: ['var(--font-mono)'],
      },
      fontSize: {
        'xs': 'var(--text-xs)',
        'sm': 'var(--text-sm)',
        'base': 'var(--text-base)',
        'lg': 'var(--text-lg)',
        'xl': 'var(--text-xl)',
        '2xl': 'var(--text-2xl)',
        '3xl': 'var(--text-3xl)',
        '4xl': 'var(--text-4xl)',
        'hero': 'var(--text-hero)',
      },
      fontWeight: {
        light: 'var(--font-light)',
        regular: 'var(--font-regular)',
        medium: 'var(--font-medium)',
        semibold: 'var(--font-semibold)',
        bold: 'var(--font-bold)',
        extrabold: 'var(--font-extrabold)',
        black: 'var(--font-black)',
      },
      spacing: {
        '0': 'var(--space-0)',
        '1': 'var(--space-1)',
        '2': 'var(--space-2)',
        '3': 'var(--space-3)',
        '4': 'var(--space-4)',
        '5': 'var(--space-5)',
        '6': 'var(--space-6)',
        '8': 'var(--space-8)',
        '10': 'var(--space-10)',
        '12': 'var(--space-12)',
        '16': 'var(--space-16)',
        '20': 'var(--space-20)',
        '24': 'var(--space-24)',
      },
      borderRadius: {
        'none': 'var(--radius-none)',
        'sm': 'var(--radius-sm)',
        'md': 'var(--radius-md)',
        'lg': 'var(--radius-lg)',
        'xl': 'var(--radius-xl)',
        '2xl': 'var(--radius-2xl)',
        '3xl': 'var(--radius-3xl)',
        'full': 'var(--radius-full)',
      },
      boxShadow: {
        'sm': 'var(--shadow-sm)',
        'md': 'var(--shadow-md)',
        'lg': 'var(--shadow-lg)',
        'xl': 'var(--shadow-xl)',
        'inner': 'var(--shadow-inner)',
        'glow': 'var(--shadow-glow)',
        // Neobrutalism shadows
        'brutal-sm': 'var(--shadow-brutal-sm)',
        'brutal-md': 'var(--shadow-brutal-md)',
        'brutal-lg': 'var(--shadow-brutal-lg)',
        'brutal-xl': 'var(--shadow-brutal-xl)',
      },
      backdropBlur: {
        'light': 'var(--glass-blur-light)',
        'medium': 'var(--glass-blur-medium)',
        'heavy': 'var(--glass-blur-heavy)',
      },
      animation: {
        // Basic animations
        'fade-in': 'fade-in var(--duration-normal) var(--ease-out)',
        'slide-up': 'slide-up var(--duration-normal) var(--ease-out)',
        'scale-in': 'scale-in var(--duration-normal) var(--ease-bounce)',
        'spin': 'spin 1s linear infinite',
        'pulse': 'pulse 2s var(--ease-in-out) infinite',
        // Micro-interactions
        'bounce-in': 'bounce-in var(--duration-slow) var(--ease-bounce)',
        'shake': 'shake var(--duration-fast) var(--ease-out)',
        'wiggle': 'wiggle var(--duration-slower) var(--ease-in-out) infinite',
        // AI animations
        'ai-pulse': 'ai-pulse 2s infinite',
        'gradient-shift': 'gradient-shift 3s ease infinite',
        // 3D animations
        'float-3d': 'float-3d 6s ease-in-out infinite',
        'rotate-3d': 'rotate-3d 10s linear infinite',
      },
      keyframes: {
        'fade-in': {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        'slide-up': {
          '0%': { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        'scale-in': {
          '0%': { opacity: '0', transform: 'scale(0.9)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
        'bounce-in': {
          '0%': { opacity: '0', transform: 'scale(0.3)' },
          '40%': { opacity: '1', transform: 'scale(1.1)' },
          '60%': { transform: 'scale(0.9)' },
          '80%': { transform: 'scale(1.03)' },
          '100%': { transform: 'scale(1)' },
        },
        'shake': {
          '0%, 100%': { transform: 'translateX(0)' },
          '10%, 30%, 50%, 70%, 90%': { transform: 'translateX(-2px)' },
          '20%, 40%, 60%, 80%': { transform: 'translateX(2px)' },
        },
        'wiggle': {
          '0%, 100%': { transform: 'rotate(-3deg)' },
          '50%': { transform: 'rotate(3deg)' },
        },
        'ai-pulse': {
          '0%': { transform: 'translateX(0)' },
          '100%': { transform: 'translateX(200%)' },
        },
        'gradient-shift': {
          '0%, 100%': { backgroundPosition: '0% 50%' },
          '50%': { backgroundPosition: '100% 50%' },
        },
        'float-3d': {
          '0%, 100%': { transform: 'translateY(0) rotateX(0) rotateY(0)' },
          '25%': { transform: 'translateY(-10px) rotateX(2deg) rotateY(2deg)' },
          '50%': { transform: 'translateY(0) rotateX(0) rotateY(0)' },
          '75%': { transform: 'translateY(-5px) rotateX(-2deg) rotateY(-2deg)' },
        },
        'rotate-3d': {
          '0%': { transform: 'rotateX(0) rotateY(0) rotateZ(0)' },
          '100%': { transform: 'rotateX(360deg) rotateY(360deg) rotateZ(360deg)' },
        },
      },
      transitionDuration: {
        'instant': 'var(--duration-instant)',
        'fast': 'var(--duration-fast)',
        'normal': 'var(--duration-normal)',
        'slow': 'var(--duration-slow)',
        'slower': 'var(--duration-slower)',
      },
      transitionTimingFunction: {
        'out': 'var(--ease-out)',
        'in-out': 'var(--ease-in-out)',
        'bounce': 'var(--ease-bounce)',
        'spring': 'var(--ease-spring)',
      },
      zIndex: {
        '-1': 'var(--z-negative)',
        '0': 'var(--z-base)',
        '10': 'var(--z-elevated)',
        '20': 'var(--z-dropdown)',
        '30': 'var(--z-sticky)',
        '40': 'var(--z-fixed)',
        '50': 'var(--z-modal-backdrop)',
        '60': 'var(--z-modal)',
        '70': 'var(--z-popover)',
        '80': 'var(--z-tooltip)',
        '90': 'var(--z-notification)',
        '100': 'var(--z-max)',
      },
      backgroundImage: {
        // AI Aesthetic gradients
        'ai-gradient': 'linear-gradient(135deg, var(--accent-primary) 0%, var(--accent-secondary) 50%, var(--accent-tertiary) 100%)',
        'ai-mesh': 'radial-gradient(at 40% 20%, var(--accent-primary) 0px, transparent 50%), radial-gradient(at 80% 0%, var(--accent-secondary) 0px, transparent 50%), radial-gradient(at 0% 50%, var(--accent-tertiary) 0px, transparent 50%)',
        // Grid patterns
        'grid-pattern': 'linear-gradient(var(--glass-border) 1px, transparent 1px), linear-gradient(90deg, var(--glass-border) 1px, transparent 1px)',
      },
      backgroundSize: {
        'grid': '20px 20px',
      },
    },
  },
  plugins: [
    // Custom plugin for glassmorphism utilities
    function({ addUtilities }) {
      const glassmorphismUtilities = {
        '.glass': {
          background: 'var(--glass-white-10)',
          backdropFilter: 'var(--glass-blur-medium)',
          WebkitBackdropFilter: 'var(--glass-blur-medium)',
          border: '1px solid var(--glass-border)',
        },
        '.glass-subtle': {
          background: 'var(--glass-white-5)',
          backdropFilter: 'var(--glass-blur-light)',
          WebkitBackdropFilter: 'var(--glass-blur-light)',
          border: '1px solid var(--glass-border)',
        },
        '.glass-prominent': {
          background: 'var(--glass-white-20)',
          backdropFilter: 'var(--glass-blur-heavy)',
          WebkitBackdropFilter: 'var(--glass-blur-heavy)',
          border: '1px solid var(--glass-border)',
        },
        '.brutal-border': {
          border: '3px solid var(--text-primary)',
        },
        '.preserve-3d': {
          transformStyle: 'preserve-3d',
        },
        '.perspective-1000': {
          perspective: '1000px',
        },
        '.backface-hidden': {
          backfaceVisibility: 'hidden',
        },
      }
      addUtilities(glassmorphismUtilities)
    },
  ],
}