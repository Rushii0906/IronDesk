/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        gym: {
          bg: '#15161A',
          panel: '#1D1F25',
          border: '#33353E',
          accent: '#F2A93B',
          accentHover: '#D9822B',
          activeBg: 'rgba(16, 185, 129, 0.15)',
          activeText: '#10B981',
          expiringBg: 'rgba(242, 169, 59, 0.15)',
          expiringText: '#F2A93B',
          expiredBg: 'rgba(239, 68, 68, 0.15)',
          expiredText: '#EF4444'
        }
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
        display: ['Space Grotesk', 'sans-serif']
      }
    },
  },
  plugins: [],
}
