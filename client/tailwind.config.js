/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['"Plus Jakarta Sans"', 'ui-sans-serif', 'system-ui', '-apple-system', 'Segoe UI', 'sans-serif'],
        display: ['"Plus Jakarta Sans"', 'ui-sans-serif', 'system-ui', 'sans-serif'],
      },
      colors: {
        brand: {
          50: '#eef3ff',
          100: '#e0e8ff',
          200: '#c7d4fe',
          300: '#a5b6fc',
          400: '#8291f8',
          500: '#6366f1',
          600: '#4f46e5',
          700: '#4338ca',
          800: '#372fa3',
          900: '#312e81',
          950: '#1e1b4b',
        },
        ink: {
          50: '#f8fafc',
          100: '#f1f5f9',
          200: '#e2e8f0',
          300: '#cbd5e1',
          400: '#94a3b8',
          500: '#64748b',
          600: '#475569',
          700: '#334155',
          800: '#1e293b',
          900: '#0f172a',
          950: '#060d1f',
        },
      },
      boxShadow: {
        xs: '0 1px 2px 0 rgb(15 23 42 / 0.04)',
        sm: '0 1px 2px 0 rgb(15 23 42 / 0.05), 0 1px 3px 0 rgb(15 23 42 / 0.04)',
        card: '0 1px 2px 0 rgb(15 23 42 / 0.04), 0 4px 16px -4px rgb(15 23 42 / 0.06)',
        'card-hover': '0 2px 4px -2px rgb(15 23 42 / 0.06), 0 16px 40px -12px rgb(15 23 42 / 0.16)',
        glow: '0 10px 30px -8px rgb(79 70 229 / 0.40)',
        'glow-lg': '0 20px 50px -12px rgb(79 70 229 / 0.45)',
        inset: 'inset 0 1px 0 0 rgb(255 255 255 / 0.08)',
      },
      backgroundImage: {
        'grid-slate': 'linear-gradient(to right, rgb(148 163 184 / 0.08) 1px, transparent 1px), linear-gradient(to bottom, rgb(148 163 184 / 0.08) 1px, transparent 1px)',
        'radial-fade': 'radial-gradient(ellipse at top, rgb(99 102 241 / 0.18), transparent 60%)',
      },
      backgroundSize: {
        grid: '32px 32px',
      },
      borderRadius: {
        '4xl': '2rem',
      },
      letterSpacing: {
        tighter2: '-0.035em',
      },
      keyframes: {
        'fade-in': {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        'slide-up': {
          '0%': { opacity: '0', transform: 'translateY(12px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        'slide-down': {
          '0%': { opacity: '0', transform: 'translateY(-8px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        'toast-in': {
          '0%': { opacity: '0', transform: 'translateY(16px) scale(0.96)' },
          '100%': { opacity: '1', transform: 'translateY(0) scale(1)' },
        },
        'scale-in': {
          '0%': { opacity: '0', transform: 'scale(0.96)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
        'bounce-subtle': {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-3px)' },
        },
        'pulse-subtle': {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.65' },
        },
        shimmer: {
          '100%': { transform: 'translateX(100%)' },
        },
      },
      animation: {
        'fade-in': 'fade-in 0.35s ease-out both',
        'slide-up': 'slide-up 0.45s cubic-bezier(0.16, 1, 0.3, 1) both',
        'slide-down': 'slide-down 0.3s cubic-bezier(0.16, 1, 0.3, 1) both',
        'toast-in': 'toast-in 0.35s cubic-bezier(0.16, 1, 0.3, 1) both',
        'scale-in': 'scale-in 0.22s cubic-bezier(0.16, 1, 0.3, 1) both',
        'bounce-subtle': 'bounce-subtle 2.6s ease-in-out infinite',
        'pulse-subtle': 'pulse-subtle 2.4s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      },
    },
  },
  plugins: [],
}