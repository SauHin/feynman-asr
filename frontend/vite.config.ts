import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  // Mode mic: WebSocket ke backend lokal (backend/app.py), jadi frontend cukup memakai origin-nya sendiri.
  server: { proxy: { '/ws': { target: 'ws://localhost:8000', ws: true } } },
})
