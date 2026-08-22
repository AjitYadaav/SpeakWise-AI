import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// Vite config for SpeakWise AI frontend.
// Dev server proxies /api calls to the Express backend to avoid CORS friction locally.
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: 'http://localhost:8080',
        changeOrigin: true,
      },
    },
  },
})
