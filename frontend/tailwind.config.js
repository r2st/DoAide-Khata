/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        khata: {
          dark: '#064E3B',
          DEFAULT: '#047857',
          light: '#10B981',
          wa: '#25D366',
          bg: '#F0FDF4',
          chat: '#E7F5EC',
        },
      },
      fontFamily: {
        sans: ['"Noto Sans"', '"Noto Sans Devanagari"', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
