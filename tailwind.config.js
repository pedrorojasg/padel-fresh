/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        surface: '#1c1c1e',
        card: '#2c2c2e',
        border: '#3a3a3c',
        primary: '#4f6ef7',
        accent: '#f59e0b',
        muted: '#8e8e93',
      },
    },
  },
  plugins: [],
}
