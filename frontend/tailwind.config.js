/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        cream: {
          50: '#FDFBF7',
          100: '#FAF8F5',
          200: '#F4EFEA',
          300: '#EAE1D9',
          400: '#D5C4B5',
        },
        amber: {
          400: '#FBBF24',
          500: '#F59E0B',
          600: '#D97706',
          700: '#B45309',
        },
        coral: {
          400: '#FB7185',
          500: '#F43F5E',
          600: '#E11D48',
          700: '#BE123C',
        },
        emerald: {
          500: '#10B981',
          600: '#059669',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
        display: ['"Plus Jakarta Sans"', 'Inter', 'sans-serif'],
      },
      borderRadius: {
        '2xl': '1rem',
        '3xl': '1.5rem',
      },
      boxShadow: {
        'warm-sm': '0 1px 3px 0 rgba(120, 80, 50, 0.06)',
        'warm': '0 4px 14px 0 rgba(120, 80, 50, 0.08)',
        'warm-lg': '0 10px 25px -3px rgba(120, 80, 50, 0.12)',
      },
    },
  },
  plugins: [],
}
