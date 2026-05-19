/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        scas: {
          dark: "#2f394e",
          mid: "#3a4e59",
          green: "#5f796b",
        },
      },
      fontFamily: {
        sans: ["Lato", "sans-serif"],
        display: ["Playfair Display", "serif"],
      },
    },
  },
  plugins: [],
};
