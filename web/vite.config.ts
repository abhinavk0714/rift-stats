import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

/**
 * Backend (Project 2) runs on port 8000 (uvicorn api.main:app).
 * Proxy /api -> backend. Target is 127.0.0.1 to avoid IPv6 (::1) ECONNREFUSED on macOS.
 * If you still see ::1:8000 errors, run: npm run dev:ipv4
 */
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: 'http://127.0.0.1:8000',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, ''),
      },
    },
  },
})
