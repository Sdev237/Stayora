/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        stayora: {
          turquoise: '#06B6D4',
          hover: '#0891B2',
          light: '#ECFEFF',
          dark: '#1E293B',
          gray: '#64748B',
          border: '#E2E8F0',
        },
        airbnb: {
          coral: '#06B6D4',
          hover: '#0891B2',
          dark: '#1E293B',
          gray: '#64748B',
          light: '#F8FAFC',
          border: '#E2E8F0',
          'border-light': '#F1F5F9'
        }
      },
      boxShadow: {
        'airbnb': '0 1px 2px rgba(0, 0, 0, 0.08), 0 4px 12px rgba(0, 0, 0, 0.05)',
        'airbnb-hover': '0 2px 4px rgba(0,0,0,0.18)',
        'airbnb-modal': '0 8px 28px rgba(0,0,0,0.28)'
      },
      borderRadius: {
        'airbnb': '32px',
      }
    },
  },
  plugins: [],
}
