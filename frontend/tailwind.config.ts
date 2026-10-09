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
        /* Aligned to the CHALLENGEX :root design tokens (index.css). */
        void: '#070606' /* --background */,
        abyss: '#100909' /* --surface */,
        obsidian: '#170909' /* --surface-elevated */,
        surface: {
          DEFAULT: '#100909',
          elevated: '#170909',
          hover: '#210a0d' /* --surface-hover */,
        },
        blood: {
          950: '#260305',
          900: '#3d0408',
          800: '#760b12' /* --crimson-dark */,
          600: '#e50920' /* --crimson */,
          500: '#ff2638' /* --crimson-glow */,
          400: '#ff5563',
        },
        parchment: {
          DEFAULT: '#e9dfd0' /* --text-primary */,
          light: '#f4ead9',
          dim: '#a79a8b' /* --text-secondary */,
          muted: '#71665e' /* --text-muted */,
        },
      },
      fontFamily: {
        display: ['"Cinzel Decorative"', 'Cinzel', 'serif'],
        cinzel: ['Cinzel', 'serif'],
        sans: ['Inter', 'Manrope', 'system-ui', 'sans-serif'],
        body: ['Manrope', 'Inter', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        /* --shadow-red — restrained ambient crimson shadow. */
        realm: '0 0 28px rgba(229, 9, 32, 0.09)',
        'red-glow': '0 0 28px rgba(229, 9, 32, 0.28)',
        'red-strong': '0 0 48px rgba(229, 9, 32, 0.5)',
        insetRune: 'inset 0 0 30px rgba(118, 11, 18, 0.4)',
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
