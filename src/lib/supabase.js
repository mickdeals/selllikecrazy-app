import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://dcadvvtrhkaxkwpxedyz.supabase.co'
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRjYWR2dnRyaGtheGt3cHhlZHl6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODYwNzA1MTEsImV4cCI6MjEwMTY0NjUxMX0.sgPVBzjJRG2Y-lcxbgzrXMyHcbYducm62XIYrsG4DHU'

export const supabase = createClient(supabaseUrl, supabaseKey)
