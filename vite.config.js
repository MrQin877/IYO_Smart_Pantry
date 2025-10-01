import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// Vite runs at http://localhost:5173
// Apache serves at   http://localhost/IYO_Smart_Pantry
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      // Any fetch("/api/xxx") from the front-end
      // will go to http://localhost/IYO_Smart_Pantry/api/xxx
      '/api': {
        target: 'http://localhost',
        changeOrigin: true,
        secure: false,
        rewrite: p => p.replace(/^\/api/, '/IYO_Smart_Pantry/api'),
      },
    },
  },
})
