/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./app/**/*.{js,jsx}", "./lib/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        ink: "#111827",
        paper: "#f7f8fa",
        accent: "#3559e0"
      }
    }
  },
  plugins: []
};
