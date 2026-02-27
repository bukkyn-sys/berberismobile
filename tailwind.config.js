/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,jsx,ts,tsx}",
    "./components/**/*.{js,jsx,ts,tsx}",
  ],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        gold: {
          DEFAULT: "#C89B3C",
          light: "#E0B85A",
          dark: "#A07C2A",
        },
        dark: {
          DEFAULT: "#0A0A0A",
          card: "#141414",
          border: "#2A2A2A",
          muted: "#3A3A3A",
        },
      },
      fontFamily: {
        sans: ["System"],
      },
    },
  },
  plugins: [],
};
