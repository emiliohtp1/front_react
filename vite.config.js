import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      'react-native': 'react-native-web',
      'react-native-screens': 'react-native-web',
      'react-native-safe-area-context': 'react-native-web',
    },
  },
  server: {
    port: 3000,
    host: true,
  },
  build: {
    outDir: 'dist',
  },
  optimizeDeps: {
    include: ['react-native-screens', 'react-native-safe-area-context'],
  },
  esbuild: {
    loader: 'tsx',
    include: /.*\.[tj]sx?$/,
    exclude: [],
  },
  define: {
    global: 'globalThis',
  },
});
