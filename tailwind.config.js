/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}", // <-- Pastikan ini ada
  ],
  theme: {
    extend: {
      fontFamily: {
         // Set font Inter seperti di CSS asli Anda
        'sans': ['Inter', 'sans-serif'],
      }
    },
  },
  plugins: [],
}