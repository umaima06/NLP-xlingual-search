import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// In dev mode (npm run dev) API calls to /api are forwarded to the FastAPI backend.
export default defineConfig({
  plugins: [react()],
  server: { port: 5173, proxy: { '/api': 'http://127.0.0.1:8000' } },
})
