import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    port: 1234,
    host: true
  },
  preview: {
    port: 3000,
    host: '0.0.0.0',
    strictPort: false,
    allowedHosts: 'all'
  },
  build: {
    outDir: 'dist',
    sourcemap: false,
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom'],
          router: ['react-router-dom'],
          ui: ['framer-motion', 'recharts']
        }
      }
    }
  }
})