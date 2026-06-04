/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        brand: {
          blue: '#1e3a5f',
          'blue-mid': '#2d5a8e',
          'blue-light': '#3b82f6',
          lime: '#84cc16',
          'lime-dark': '#65a30d',
        },
      },
    },
  },
  plugins: [],
}
