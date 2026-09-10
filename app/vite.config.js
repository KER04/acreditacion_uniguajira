import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      /* El front habla con /api y Vite lo reenvía al backend. Front y API
         quedan en el mismo origen, así que la cookie de sesión viaja sola
         y no hay que lidiar con CORS ni con credentials en cada fetch. */
      '/api': { target: 'http://localhost:3001', changeOrigin: true },
    },
  },
})
