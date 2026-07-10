// vite.config.js
// Minimal Vite setup - just the React plugin. Nothing fancy needed for V1.
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
});