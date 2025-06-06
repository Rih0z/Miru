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
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'gradient-conic': 'conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))',
      },
      colors: {
        // プライマリカラー（v2.0仕様）
        primary: {
          50: '#FFF5F5',
          100: '#FFE1E6',
          200: '#FFC2CC',
          300: '#FF94A3',
          400: '#FF6B7A',
          500: '#FF5864',
          600: '#E85A6F',
          700: '#D63384',
          800: '#B02A5B',
          900: '#8B2252',
        },
        // Kawaiiカラー（v2.0新規）
        kawaii: {
          pink: '#FFB6C1',
          peach: '#FFCCCB',
          lavender: '#E6E6FA',
          mint: '#F0FFF0',
          cream: '#FFF8DC',
          sky: '#E0F6FF',
          coral: '#FF7F7F',
          soft: '#FFE4E1',
          romantic: '#FFF0F5',
          magical: 'linear-gradient(135deg, #E6E6FA 0%, #DDA0DD 50%, #FFB6C1 100%)',
          dream: 'linear-gradient(135deg, #FFE4E1 0%, #FFCCCB 30%, #FFB6C1 70%, #DDA0DD 100%)',
        },
        // 温度カラー（v2.0新規）
        temperature: {
          hot: '#FF5864',
          warm: '#FFB548',
          cool: '#4FC3F7',
        },
        // セカンダリカラー（ラベンダー系）
        secondary: {
          50: '#F8F6FF',
          100: '#F0EBFF',
          200: '#E6E6FA',
          300: '#DDA0DD',
          400: '#DA70D6',
          500: '#BA55D3',
          600: '#9932CC',
          700: '#8B008B',
          800: '#6A0B83',
          900: '#4B0082',
        },
        // サクセスカラー（ミント系）
        success: {
          50: '#F0FFF0',
          100: '#E0FFE0',
          200: '#C1FFC1',
          300: '#98FB98',
          400: '#90EE90',
          500: '#4ADE80',
          600: '#48D1CC',
          700: '#20B2AA',
          800: '#008B8B',
          900: '#006666',
        },
        // セマンティックカラー
        hope: '#FFD700',
        caution: '#FFA500',
        error: '#FF69B4',
        info: '#87CEEB',
        warning: '#FFCCCB',
        celebration: '#FF1493',
      },
      spacing: {
        'safe-top': 'env(safe-area-inset-top)',
        'safe-bottom': 'env(safe-area-inset-bottom)',
        'safe-left': 'env(safe-area-inset-left)',
        'safe-right': 'env(safe-area-inset-right)',
      },
      screens: {
        'xs': '475px',
      },
      animation: {
        // 基本アニメーション
        'fadeIn': 'fadeIn 0.35s ease-out',
        'slideInRight': 'slideInRight 0.25s ease-out',
        'kawaii-pulse': 'kawaii-pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'heartbeat': 'heartbeat 1.5s ease-in-out infinite',
        'float': 'float 3s ease-in-out infinite',
        'wiggle': 'wiggle 0.5s ease-in-out',
        'sparkle': 'sparkle 1s ease-in-out infinite',
        'bounceIn': 'bounceIn 0.6s cubic-bezier(0.68, -0.55, 0.265, 1.55)',
      },
      boxShadow: {
        // Kawaiiシャドウ（v2.0仕様）
        'xs': '0 2px 4px 0 rgba(255, 182, 193, 0.15)',
        'sm': '0 4px 8px 0 rgba(255, 182, 193, 0.2), 0 2px 4px 0 rgba(255, 182, 193, 0.1)',
        'base': '0 8px 16px -2px rgba(255, 182, 193, 0.25), 0 4px 8px -2px rgba(255, 182, 193, 0.15)',
        'md': '0 12px 24px -4px rgba(255, 182, 193, 0.3), 0 6px 12px -3px rgba(255, 182, 193, 0.2)',
        'lg': '0 20px 32px -6px rgba(255, 182, 193, 0.35), 0 12px 20px -6px rgba(255, 182, 193, 0.25)',
        'xl': '0 32px 48px -12px rgba(255, 182, 193, 0.4)',
        '2xl': '0 40px 64px -16px rgba(255, 182, 193, 0.45)',
        'inner': 'inset 0 4px 8px 0 rgba(255, 182, 193, 0.1)',
        // カラードシャドウ
        'primary': '0 12px 32px -8px rgba(255, 182, 193, 0.5)',
        'secondary': '0 12px 32px -8px rgba(230, 230, 250, 0.6)',
        'success': '0 12px 32px -8px rgba(152, 251, 152, 0.5)',
        'kawaii-glow': '0 0 20px rgba(255, 182, 193, 0.3)',
        'magical': '0 8px 25px rgba(221, 160, 221, 0.4)',
        'dreamy': '0 10px 30px rgba(255, 204, 203, 0.45)',
      },
      borderRadius: {
        'xs': '0.125rem',
        'sm': '0.25rem',
        'base': '0.5rem',
        'md': '0.75rem',
        'lg': '1rem',
        'xl': '1.5rem',
        '2xl': '2rem',
        '3xl': '2.5rem',
      },
      maxWidth: {
        'app': '430px',
      },
    },
  },
  plugins: [],
}