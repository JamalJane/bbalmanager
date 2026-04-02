/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        stadium: '#0D0D0B',
        ink: '#1A1A18',
        parchment: '#E8E2D6',
        cream: '#F5F0E8',
        rust: '#B85C2A',
        gold: '#C8963A',
        ember: '#E8593C',
        muted: '#4A4844',
      },
      fontFamily: {
        display: ['Playfair Display', 'serif'],
        mono: ['IBM Plex Mono', 'monospace'],
        serif: ['Libre Baskerville', 'serif'],
      },
      animation: {
        'sweep-right': 'sweepRight 0.4s ease-out forwards',
        'glow-pulse': 'glowPulse 2s ease-in-out infinite',
        'drop-in': 'dropIn 0.2s cubic-bezier(0.34, 1.56, 0.64, 1) forwards',
        'slide-up': 'slideUp 0.15s ease-out forwards',
        'count-up': 'countUp 0.8s ease-out forwards',
        'typewriter': 'typewriter 0.028s steps(1) forwards',
      },
      keyframes: {
        sweepRight: {
          '0%': { transform: 'scaleX(0)', transformOrigin: 'left' },
          '100%': { transform: 'scaleX(1)', transformOrigin: 'left' },
        },
        glowPulse: {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.7' },
        },
        dropIn: {
          '0%': { opacity: '0', transform: 'translateY(-12px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(8px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        countUp: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        typewriter: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
      },
    },
  },
  plugins: [],
}
