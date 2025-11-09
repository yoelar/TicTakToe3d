import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  root: '.', // ensure index.html is found at project root
  build: {
    outDir: 'dist',
  },
});
