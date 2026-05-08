import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
  ],
  server: {
    host: '0.0.0.0',
    port: 5173,
    proxy: {
      '/api': 'https://sports-booking-backend-new-2.onrender.com',
      '/admin/bookings': 'https://sports-booking-backend-new-2.onrender.com',
    },
  },
})
