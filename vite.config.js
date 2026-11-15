import { defineConfig } from 'vite';

// En GitHub Pages el sitio vive en https://hchaps404.github.io/Portfolio/
// El workflow define BASE_PATH=/Portfolio/ al compilar. En local se sirve desde "/".
export default defineConfig({
  base: process.env.BASE_PATH || '/',
  build: {
    outDir: 'dist',
    sourcemap: false,
  },
});
