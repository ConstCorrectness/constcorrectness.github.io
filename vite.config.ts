import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/myst_assets_folder': {
        target: 'http://localhost:5173',
        changeOrigin: true,
        rewrite: (path) => `/notes${path}`,
      },
      '/favicon.ico': {
        target: 'http://localhost:5173',
        changeOrigin: true,
        rewrite: (path) => `/notes${path}`,
      },
      '/myst-theme.css': {
        target: 'http://localhost:5173',
        changeOrigin: true,
        rewrite: (path) => `/notes${path}`,
      },
    }
  }
})
