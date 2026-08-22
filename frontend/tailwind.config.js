/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        // Deep, near-black green — the calm, premium "study at night" backdrop.
        ink: {
          950: '#080B0A',
          900: '#0D1210',
          800: '#121816',
          700: '#1A2220',
          600: '#242F2C',
          500: '#33413D',
        },
        // Warm, muted gold — the single accent used sparingly for focus states.
        ember: {
          300: '#F1DDA8',
          400: '#E6C888',
          500: '#D4AF6A',
          600: '#B8934F',
        },
        // Soft sage — a secondary, quieter accent for supporting UI.
        sage: {
          300: '#BFD8CC',
          400: '#9CC3B2',
          500: '#7AAB97',
        },
      },
      fontFamily: {
        serif: ['"Fraunces"', 'Georgia', 'serif'],
        body: ['"Inter"', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'monospace'],
      },
      boxShadow: {
        glass: '0 8px 32px rgba(0,0,0,0.45)',
        glow: '0 0 50px rgba(212,175,106,0.18)',
      },
      keyframes: {
        'pulse-ring': {
          '0%': { transform: 'scale(0.9)', opacity: '0.6' },
          '70%': { transform: 'scale(1.5)', opacity: '0' },
          '100%': { transform: 'scale(1.5)', opacity: '0' },
        },
        'breathe': {
          '0%, 100%': { opacity: '0.5' },
          '50%': { opacity: '1' },
        },
      },
      animation: {
        'pulse-ring': 'pulse-ring 2s cubic-bezier(0.2,0.6,0.35,1) infinite',
        'breathe': 'breathe 3.2s ease-in-out infinite',
      },
    },
  },
  plugins: [],
}

