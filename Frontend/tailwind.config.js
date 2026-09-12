// tailwind.config.js
/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        obsidian: {
          950: "#08090b",
          900: "#0d0e12",
          850: "#12141a",
          800: "#181a22",
          750: "#1e212b",
          700: "#262936",
          600: "#363a4c",
        },
        brand: {
          50: "#fff7ed",
          100: "#ffedd5",
          200: "#fed7aa",
          300: "#fdba74",
          400: "#fb923c",
          500: "#f97316",
          600: "#ea580c",
          700: "#c2410c",
          accent: "#ffedd5",
        },
        primary: {
          DEFAULT: "#ea580c",
          foreground: "#ffffff",
          hover: "#c2410c",
          light: "#fff7ed",
          border: "#ffedd5",
        },
      },
      fontFamily: {
        sans: [
          "-apple-system",
          "BlinkMacSystemFont",
          '"Segoe UI"',
          "Roboto",
          '"Helvetica Neue"',
          "Arial",
          "sans-serif",
        ],
        mono: [
          '"JetBrains Mono"',
          '"Fira Code"',
          '"SF Mono"',
          "Menlo",
          "Monaco",
          "Consolas",
          "monospace",
        ],
      },
      animation: {
        "pulse-slow": "pulse 4s cubic-bezier(0.4, 0, 0.6, 1) infinite",
        "fade-in": "fadeIn 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards",
        "card-in": "cardIn 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards",
      },
      keyframes: {
        fadeIn: {
          from: { opacity: "0", transform: "translateY(8px)" },
          to: { opacity: "1", transform: "translateY(0)" },
        },
        cardIn: {
          from: { opacity: "0", transform: "translateY(12px) scale(0.99)" },
          to: { opacity: "1", transform: "translateY(0) scale(1)" },
        },
      },
    },
  },
  plugins: [],
};