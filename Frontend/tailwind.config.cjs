/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./index.html", "./src/**/*.{ts,tsx,js,jsx}"],
  theme: {
    extend: {
      fontFamily: {
        sans: ["Open Sans", "Quicksand", "sans-serif"],
        display: ["Quicksand", "Open Sans", "sans-serif"]
      },
      colors: {
        brand: {
          blue: "#3c5eab",
          green: "#00835e",
          black: "#0b0b0b",
          gold: "#f2c24b"
        }
      }
    }
  },
  plugins: []
};
