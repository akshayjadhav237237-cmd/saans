import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { resolve } from 'path';
import { vitePluginCsp } from './vite-plugin-csp';

export default defineConfig({
  base: './',
  plugins: [react(), vitePluginCsp()],
  resolve: {
    alias: {
      '@': resolve(__dirname, './src'),
    },
  },
  build: {
    target: 'es2022',
    sourcemap: false,
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('node_modules')) {
            if (id.includes('react') || id.includes('react-dom')) {
              return 'vendor-react';
            }
            if (id.includes('zustand') || id.includes('zod')) {
              return 'vendor-utils';
            }
            return 'vendor-core';
          }
        },
      },
    },
  },
});
