/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
    './src/styles/**/*.css',
  ],
  theme: {
    extend: {
      // 🌸 Kawaii Color Palette - 完全新設計
      colors: {
        // Kawaii Primary Colors
        kawaii: {
          primary: '#FF6B8A',
          'primary-light': '#FF8FA3',
          'primary-soft': '#FFE1E8',
          'primary-bg': '#FFF8FA',
          secondary: '#B794F6',
          'secondary-light': '#D6BCFA',
          'secondary-soft': '#F3E8FF',
          'secondary-bg': '#FEFCFF',
          peach: '#FFB5A7',
          mint: '#9DECF9',
          coral: '#F093FB',
          sky: '#A8EDEA',
          cream: '#FEF5E7',
          blush: '#FFD3D3',
        },
        
        // 🔥 Temperature Colors
        temp: {
          hot: '#FF6B8A',
          'hot-light': '#FF8E53',
          warm: '#FFB347',
          'warm-light': '#FFCC02',
          cool: '#4FACFE',
          'cool-light': '#00F2FE',
        },
        
        // 🎨 Semantic Colors
        success: '#48BB78',
        warning: '#ED8936',
        error: '#F56565',
        info: '#4299E1',
      },

      // 🌈 Background Gradients
      backgroundImage: {
        'gradient-dreamy': 'linear-gradient(135deg, #FF6B8A 0%, #B794F6 50%, #9DECF9 100%)',
        'gradient-romantic': 'linear-gradient(135deg, #FFE1E8 0%, #F3E8FF 100%)',
        'gradient-magical': 'linear-gradient(135deg, #FFB5A7 0%, #F093FB 50%, #A8EDEA 100%)',
        'gradient-sunset': 'linear-gradient(135deg, #FF8E53 0%, #FFB347 100%)',
        'temp-hot': 'linear-gradient(135deg, #FF6B8A 0%, #FF8E53 100%)',
        'temp-warm': 'linear-gradient(135deg, #FFB347 0%, #FFCC02 100%)',
        'temp-cool': 'linear-gradient(135deg, #4FACFE 0%, #00F2FE 100%)',
      },

      // ✨ Kawaii Shadows
      boxShadow: {
        'kawaii': '0 8px 32px rgba(255, 107, 138, 0.15)',
        'dreamy': '0 12px 40px rgba(183, 148, 246, 0.2)',
        'magical': '0 16px 48px rgba(255, 181, 167, 0.25)',
        'soft': '0 4px 16px rgba(0, 0, 0, 0.05)',
      },

      // 🎭 Kawaii Typography
      fontFamily: {
        kawaii: ['Comic Sans MS', 'Hiragino Kaku Gothic Pro', 'ヒラギノ角ゴ Pro W3', 'sans-serif'],
        system: ['-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
      },

      // 📐 Border Radius
      borderRadius: {
        'kawaii': '20px',
        'kawaii-lg': '24px',
        'kawaii-xl': '32px',
      },

      // ⚡ Transitions
      transitionTimingFunction: {
        'kawaii-bounce': 'cubic-bezier(0.68, -0.55, 0.265, 1.55)',
        'kawaii-smooth': 'cubic-bezier(0.4, 0, 0.2, 1)',
      },

      // 💫 Animations
      animation: {
        'kawaii-heartbeat': 'kawaii-heartbeat 1.5s infinite',
        'kawaii-float': 'kawaii-float 3s ease-in-out infinite',
        'kawaii-sparkle': 'kawaii-sparkle 1s infinite',
        'kawaii-bounce': 'kawaii-bounce 0.6s ease-out',
        'kawaii-slide-in': 'kawaii-slide-in 0.4s ease-out',
        'kawaii-fade-in': 'kawaii-fade-in 0.3s ease-out',
        'spin': 'spin 1s linear infinite',
      },

      // 🎨 Keyframes
      keyframes: {
        'kawaii-heartbeat': {
          '0%, 100%': { transform: 'scale(1)' },
          '25%': { transform: 'scale(1.1)' },
          '50%': { transform: 'scale(1.05)' },
          '75%': { transform: 'scale(1.15)' },
        },
        'kawaii-float': {
          '0%, 100%': { transform: 'translateY(0px) rotate(0deg)' },
          '33%': { transform: 'translateY(-10px) rotate(1deg)' },
          '66%': { transform: 'translateY(-5px) rotate(-1deg)' },
        },
        'kawaii-sparkle': {
          '0%, 100%': { 
            opacity: '0',
            transform: 'scale(0) rotate(0deg)'
          },
          '50%': { 
            opacity: '1',
            transform: 'scale(1) rotate(180deg)'
          },
        },
        'kawaii-bounce': {
          '0%': { transform: 'translateY(-100px) scale(0)', opacity: '0' },
          '60%': { transform: 'translateY(-30px) scale(1.1)', opacity: '1' },
          '80%': { transform: 'translateY(-10px) scale(0.95)' },
          '100%': { transform: 'translateY(0) scale(1)', opacity: '1' },
        },
        'kawaii-slide-in': {
          '0%': { transform: 'translateX(-100px)', opacity: '0' },
          '100%': { transform: 'translateX(0)', opacity: '1' },
        },
        'kawaii-fade-in': {
          '0%': { opacity: '0', transform: 'scale(0.9)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
        'spin': {
          '0%': { transform: 'rotate(0deg)' },
          '100%': { transform: 'rotate(360deg)' },
        },
      },

      // 📱 Responsive Breakpoints
      screens: {
        'xs': '475px',
        'sm': '640px',
        'md': '768px',
        'lg': '1024px',
        'xl': '1280px',
        '2xl': '1536px',
      },

      // 📐 Spacing
      spacing: {
        '18': '4.5rem',
        '88': '22rem',
        '128': '32rem',
      },

      // 🎯 Z-Index
      zIndex: {
        '60': '60',
        '70': '70',
        '80': '80',
        '90': '90',
        '100': '100',
      },

      // 📏 Max Width
      maxWidth: {
        'kawaii': '1200px',
      },

      // 🌟 Backdrop Blur
      backdropBlur: {
        'kawaii': '20px',
      },
    },
  },
  plugins: [
    // カスタムユーティリティクラス
    function({ addUtilities, theme }) {
      const newUtilities = {
        // Kawaii Card Utilities
        '.card-kawaii': {
          background: 'rgba(255, 255, 255, 0.95)',
          backdropFilter: 'blur(20px)',
          borderRadius: theme('borderRadius.kawaii-xl'),
          padding: theme('spacing.8'),
          boxShadow: theme('boxShadow.kawaii'),
          border: '2px solid rgba(255, 107, 138, 0.1)',
          transition: 'all 300ms cubic-bezier(0.4, 0, 0.2, 1)',
          position: 'relative',
          overflow: 'hidden',
          '&::before': {
            content: '""',
            position: 'absolute',
            top: '0',
            left: '0',
            right: '0',
            height: '4px',
            background: 'linear-gradient(135deg, #FF6B8A 0%, #B794F6 50%, #9DECF9 100%)',
          },
          '&:hover': {
            transform: 'translateY(-8px) scale(1.02)',
            boxShadow: theme('boxShadow.magical'),
          },
        },

        // Kawaii Button Utilities
        '.btn-kawaii': {
          background: 'linear-gradient(135deg, #FF6B8A 0%, #B794F6 50%, #9DECF9 100%)',
          color: 'white',
          border: 'none',
          borderRadius: theme('borderRadius.kawaii'),
          padding: `${theme('spacing.4')} ${theme('spacing.8')}`,
          fontFamily: theme('fontFamily.kawaii').join(', '),
          fontWeight: '600',
          fontSize: theme('fontSize.base'),
          cursor: 'pointer',
          transition: 'all 400ms cubic-bezier(0.68, -0.55, 0.265, 1.55)',
          boxShadow: theme('boxShadow.kawaii'),
          position: 'relative',
          overflow: 'hidden',
          minHeight: '48px',
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: theme('spacing.2'),
          '&:hover': {
            transform: 'translateY(-4px) scale(1.05)',
            boxShadow: theme('boxShadow.dreamy'),
          },
          '&:active': {
            transform: 'translateY(-2px) scale(1.02)',
          },
        },

        // Kawaii Input Utilities
        '.input-kawaii': {
          width: '100%',
          padding: `${theme('spacing.4')} ${theme('spacing.5')}`,
          border: '2px solid rgba(255, 107, 138, 0.2)',
          borderRadius: theme('borderRadius.kawaii'),
          background: 'rgba(255, 255, 255, 0.9)',
          fontFamily: theme('fontFamily.kawaii').join(', '),
          fontSize: theme('fontSize.base'),
          transition: 'all 300ms cubic-bezier(0.4, 0, 0.2, 1)',
          boxShadow: theme('boxShadow.soft'),
          '&:focus': {
            outline: 'none',
            borderColor: theme('colors.kawaii.primary'),
            boxShadow: '0 0 0 4px rgba(255, 107, 138, 0.1)',
            transform: 'scale(1.02)',
          },
        },

        // Kawaii Badge Utilities
        '.badge-kawaii': {
          display: 'inline-flex',
          alignItems: 'center',
          gap: theme('spacing.2'),
          padding: `${theme('spacing.2')} ${theme('spacing.4')}`,
          borderRadius: '50px',
          fontSize: theme('fontSize.sm'),
          fontWeight: '600',
          background: 'linear-gradient(135deg, #FFE1E8 0%, #F3E8FF 100%)',
          color: theme('colors.kawaii.primary'),
          boxShadow: theme('boxShadow.soft'),
        },

        // Temperature Badges
        '.badge-hot': {
          background: 'linear-gradient(135deg, #FF6B8A 0%, #FF8E53 100%)',
          color: 'white',
        },
        '.badge-warm': {
          background: 'linear-gradient(135deg, #FFB347 0%, #FFCC02 100%)',
          color: 'white',
        },
        '.badge-cool': {
          background: 'linear-gradient(135deg, #4FACFE 0%, #00F2FE 100%)',
          color: 'white',
        },

        // Kawaii Progress Bar
        '.progress-kawaii': {
          width: '100%',
          height: '12px',
          background: 'rgba(255, 107, 138, 0.1)',
          borderRadius: '50px',
          overflow: 'hidden',
          position: 'relative',
        },

        // Kawaii Modal
        '.modal-kawaii': {
          background: 'rgba(255, 255, 255, 0.98)',
          borderRadius: theme('borderRadius.kawaii-xl'),
          maxWidth: '500px',
          width: '100%',
          maxHeight: '90vh',
          overflowY: 'auto',
          boxShadow: theme('boxShadow.magical'),
          border: '2px solid rgba(255, 107, 138, 0.1)',
        },

        // Kawaii Typography
        '.title-kawaii': {
          fontSize: theme('fontSize.4xl'),
          fontWeight: '800',
          background: 'linear-gradient(135deg, #FF6B8A 0%, #B794F6 50%, #9DECF9 100%)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          backgroundClip: 'text',
          marginBottom: theme('spacing.4'),
        },

        // Kawaii Hover Effects
        '.hover-kawaii': {
          transition: 'all 300ms cubic-bezier(0.4, 0, 0.2, 1)',
          cursor: 'pointer',
          '&:hover': {
            transform: 'translateY(-4px) scale(1.05)',
            boxShadow: theme('boxShadow.dreamy'),
          },
        },
      }

      addUtilities(newUtilities)
    },
  ],
}