import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
    server: {
    proxy: {
      '/api': 'http://18.209.30.21:8080'
    }
  },
  plugins: [react(), tailwindcss()],
});