import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// VITE_BASE lets GitHub Pages serve the site from a sub-path (/xoiom/).
export default defineConfig({
  base: process.env.VITE_BASE || '/',
  plugins: [react()],
  server: {
    host: true,
    port: 5173,
    proxy: {
      '/api': 'http://localhost:3000'
    }
  },
  build: {
    outDir: 'dist',
    sourcemap: false,
    target: 'es2019'
  }
});
