import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  build: {
    rollupOptions: {
      output: {
        // React rarely changes between deploys; a separate chunk stays cached.
        manualChunks: { vendor: ['react', 'react-dom', 'react-router-dom', 'react-helmet-async'] },
      },
    },
  },
  server: {
    port: 3102,
    host: '0.0.0.0',
    proxy: {
      '/api': { target: 'http://localhost:3101', changeOrigin: true },
    },
  },
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: './src/test/setup.js',
  },
})
