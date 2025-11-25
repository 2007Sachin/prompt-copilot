import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    open: true,
  },
  build: {
    outDir: 'dist',
    sourcemap: true,
    rollupOptions: {
      output: {
        manualChunks: {
          'vendor-react': ['react', 'react-dom'],
          'vendor-ui': ['lucide-react', 'framer-motion'],
          'vendor-charts': ['recharts'],
          'vendor-ai': ['openai', 'groq-sdk', '@anthropic-ai/sdk', '@google/generative-ai', '@supabase/supabase-js'],
        },
      },
    },
  },
})
