import { defineConfig } from 'vite';

export default defineConfig({
  root: 'public', // serve index.html from public folder
  build: {
    outDir: '../dist', // build output folder
    emptyOutDir: true,
    rollupOptions: {
      input: '/index.html',
    },
  },
});
