import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    proxy: {
      '/api': {
        target: 'http://192.168.1.193:5000',
        changeOrigin: true,
        secure: false,
      },
    },
    allowedHosts: true,
  },
});
