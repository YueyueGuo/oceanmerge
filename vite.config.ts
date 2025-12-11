import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  base: './', // Important for relative paths in Capacitor
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
  }
});