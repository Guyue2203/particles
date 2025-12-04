import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  base: '/particles/',
  server: {
    host: true, // Listen on all local IPs
    open: true  // Open browser on start
  }
})
