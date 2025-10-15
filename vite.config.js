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
  test: {
    include: ['tests/**/*.js', 'tests/**/*.jsx'],
    environment: 'jsdom',
    setupFiles: './tests/setupTests.js',
    globals: true,                 // allows `describe`, `it`, etc. without import
    css: false,                    // ignore CSS imports in components
    exclude: ['**/node_modules/**', '**/dist/**', '**/tests/setupTests.js']
    // If you use path aliases like "@/..." add:
    // alias: { '@': new URL('./src', import.meta.url).pathname },
  },
})
