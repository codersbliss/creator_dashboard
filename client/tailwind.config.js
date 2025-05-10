/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        blue: {
          500: '#3366FF',
          600: '#2952CC',
          700: '#1F3D99',
        },
        purple: {
          500: '#7C3AED',
          600: '#6429C8',
          700: '#4B1F96',
        }
      }
    },
  },
  plugins: [],
}