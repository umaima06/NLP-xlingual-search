/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: { cream: '#F7F4EC', pink: '#F4A9CD', blush: '#FCE4F0', rose: '#B83277', ink: '#1A1A1A' },
      fontFamily: {
        display: ['Fraunces', 'Georgia', '"Nirmala UI"', 'serif'],
        sans: ['"DM Sans"', '"Nirmala UI"', '"Noto Sans Telugu"', '"Noto Sans Devanagari"', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
}