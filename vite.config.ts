import { defineConfig } from 'vite';
import FullReload from 'vite-plugin-full-reload';

export default defineConfig({
  base: '/',
  plugins: [
    FullReload(['src/**/*']),
  ],
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
          if (id.includes('/ui/')) {
            return 'ui';
          }
          if (id.includes('node_modules')) {
            return 'vendor';
          }
          return undefined;
        },
        // 统一所有 chunk 的命名格式
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
    include: ['pixi.js', 'jszip'],
    exclude: []
  }
});