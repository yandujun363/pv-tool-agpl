import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import path from 'path';

export default defineConfig({
  plugins: [vue()],
  base: '/',
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      '@core': path.resolve(__dirname, './src/core'),
      '@effects': path.resolve(__dirname, './src/effects'),
      '@templates': path.resolve(__dirname, './src/templates'),
      '@config': path.resolve(__dirname, './src/config'),
      '@i18n': path.resolve(__dirname, './src/i18n'),
    }
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks: (id) => {
          if (id.includes('node_modules/pixi.js') || id.includes('@pixi/')) {
            return 'pixi';
          }
          if (id.includes('node_modules/jszip')) {
            return 'jszip';
          }
          if (id.includes('/effects/')) {
            return 'effects';
          }
          if (id.includes('/templates/')) {
            return 'templates';
          }
          if (id.includes('node_modules')) {
            return 'vendor';
          }
          return undefined;
        },
        entryFileNames: 'assets/[name].[hash].js',
        chunkFileNames: 'assets/[name].[hash].js',
        assetFileNames: 'assets/[name].[hash].[ext]'
      }
    },
    chunkSizeWarningLimit: 800,
    cssCodeSplit: true,
    sourcemap: true
  },
  optimizeDeps: {
    include: ['pixi.js', 'jszip', 'vue']
  }
});