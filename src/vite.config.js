import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  define: {
    'import.meta.env.VITE_SUPABASE_URL': JSON.stringify('https://dcadvvtrhkaxkwpxedyz.supabase.co'),
    'import.meta.env.VITE_SUPABASE_ANON_KEY': JSON.stringify('eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRjYWR2dnRyaGtheGt3cHhlZHl6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODYwNzA1MTEsImV4cCI6MjEwMTY0NjUxMX0.sgPVBzjJRG2Y-lcxbgzrXMyHcbYducm62XIYrsG4DHU'),
  },
})
