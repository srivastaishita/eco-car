export default {
  darkMode: "class",
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        primary: "#13ec5b",
        darkBg: "#0a0d0b",
        cardBg: "#111812",
        innerCard: "#1a231b",
        footerBg: "#0f1711",
      },
      borderRadius: {
        custom: "8px",
      },
      fontFamily: {
        sans: ["Inter", "sans-serif"],
      },
    },
  },
  plugins: [],
};