import type { Config } from "tailwindcss";

export default {
  darkMode: ["class"],
  content: [
    "./pages/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./app/**/*.{ts,tsx}",
    "./src/**/*.{ts,tsx}",
  ],
  prefix: "",
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {
      colors: {
        game: {
          background: "#1A1F2C",
          bird: "#9b87f5",
          bullish: "#4CAF50",
          bearish: "#FF5252",
        },
      },
      keyframes: {
        "bird-float": {
          "0%, 100%": { transform: "translateY(-2px)" },
          "50%": { transform: "translateY(2px)" },
        },
      },
      animation: {
        "bird-float": "bird-float 2s ease-in-out infinite",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
} satisfies Config;
