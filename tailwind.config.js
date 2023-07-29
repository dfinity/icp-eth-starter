/** @type {import('tailwindcss').Config} */

module.exports = {
  content: ['./index.html', './src/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {
      colors: {
        background: '#111',
        primary: '#83c9f4',
      },
    },
  },
  plugins: [],
};
