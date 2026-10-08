import type { Config } from 'tailwindcss';

/**
 * ChallengeX dark-fantasy design tokens.
 * Frontend-only config — the admin app has its own independent Tailwind config.
 */
const config: Config = {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        void: '#030303',
        abyss: '#070707',
        obsidian: '#101010',
        blood: {
          950: '#260305',
          900: '#3d0408',
          800: '#65080D',
          600: '#E5161C',
          500: '#FF2424',
          400: '#FF6666',
        },
        parchment: {
          DEFAULT: '#E8D5BD',
          light: '#F5E7D6',
          dim: '#A89588',
        },
      },
      fontFamily: {
        display: ['"Cinzel Decorative"', 'Cinzel', 'serif'],
        cinzel: ['Cinzel', 'serif'],
        sans: ['Inter', 'Manrope', 'system-ui', 'sans-serif'],
        body: ['Manrope', 'Inter', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        'red-glow': '0 0 24px rgba(229, 22, 28, 0.35)',
        'red-strong': '0 0 48px rgba(229, 22, 28, 0.55)',
        insetRune: 'inset 0 0 30px rgba(101, 8, 13, 0.5)',
      },
      keyframes: {
        'rune-pulse': {
          '0%, 100%': { opacity: '0.55', transform: 'scale(1)' },
          '50%': { opacity: '1', transform: 'scale(1.06)' },
        },
        'ember-rise': {
          '0%': { transform: 'translateY(0) scale(1)', opacity: '0' },
          '10%': { opacity: '1' },
          '100%': { transform: 'translateY(-120px) scale(0.4)', opacity: '0' },
        },
        'fog-drift': {
          '0%': { transform: 'translateX(-6%)' },
          '50%': { transform: 'translateX(6%)' },
          '100%': { transform: 'translateX(-6%)' },
        },
        'fade-in-up': {
          '0%': { opacity: '0', transform: 'translateY(14px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
      },
      animation: {
        'rune-pulse': 'rune-pulse 2.4s ease-in-out infinite',
        'ember-rise': 'ember-rise 4s linear infinite',
        'fog-drift': 'fog-drift 18s ease-in-out infinite',
        'fade-in-up': 'fade-in-up 0.5s ease-out both',
        shimmer: 'shimmer 1.8s linear infinite',
      },
    },
  },
  plugins: [],
};

export default config;
