/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{html,ts}"],
  theme: {
    extend: {
      colors: {
        brand: {
          50:  "#f4f2ff",
          100: "#e7e2ff",
          200: "#d3caff",
          300: "#b9a7ff",
          400: "#9a7cff",
          500: "#7c5aed", // base
          600: "#6b45e3",
          700: "#5a33c8",
          800: "#47299f",
          900: "#371f7a"
        }
      }
    }
  },
  plugins: []
};