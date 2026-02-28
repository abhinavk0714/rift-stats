import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

/**
 * Backend (Project 2) runs on port 8000 (uvicorn api.main:app).
 * Proxy /api -> http://localhost:8000 so frontend calls /api/teams etc.
 */
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: 'http://localhost:8000',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, ''),
      },
    },
  },
})
