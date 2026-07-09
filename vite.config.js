import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// GitHub Pages sirve este repo en https://hchaps404.github.io/Portfolio/
// Para dominio propio en la raíz, define BASE_PATH=/ al hacer build.
export default defineConfig({
  plugins: [react()],
  base: process.env.BASE_PATH || "/Portfolio/",
});

