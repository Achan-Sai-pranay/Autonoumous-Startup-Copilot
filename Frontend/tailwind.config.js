// tailwind.config.js
// Dark-mode-only startup UI. "class" strategy isn't even needed since we
// force dark mode by default, but it's harmless to keep for V2 flexibility.
/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  darkMode: "class",
  theme: {
    extend: {},
  },
  plugins: [],
};