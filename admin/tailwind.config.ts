import type { Config } from 'tailwindcss';

/**
 * ChallengeX Admin design tokens — professional, data-focused,
 * premium and ChallengeX branded. Independent Tailwind config
 * (no shared configuration with the frontend).
 */
const config: Config = {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        ink: {
          950: '#030303',
          900: '#070707',
          850: '#0b0b0b',
          800: '#101010',
          700: '#171717',
          600: '#1f1f1f',
        },
        brand: {
          950: '#260305',
          900: '#3d0408',
          800: '#65080D',
          600: '#E5161C',
          500: '#FF2424',
          400: '#FF6666',
        },
        sand: {
          DEFAULT: '#E8D5BD',
          light: '#F5E7D6',
          dim: '#A89588',
        },
      },
      fontFamily: {
        display: ['Cinzel', 'serif'],
        sans: ['Inter', 'Manrope', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        panel: '0 1px 0 rgba(255,255,255,0.03), 0 12px 32px rgba(0,0,0,0.45)',
        glow: '0 0 20px rgba(229,22,28,0.25)',
      },
      keyframes: {
        'fade-in': {
          '0%': { opacity: '0', transform: 'translateY(6px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
      },
      animation: {
        'fade-in': 'fade-in 0.25s ease-out both',
      },
    },
  },
  plugins: [],
};

export default config;
