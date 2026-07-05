import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    // Proxy so `npm run dev` also works locally with Vercel-style /api routes
    // when using `vercel dev` this is not needed, but kept for clarity.
  }
})
