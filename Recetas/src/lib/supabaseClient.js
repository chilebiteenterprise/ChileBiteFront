import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://tnzpojvhsxjzfachozid.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRuenBvanZoc3hqemZhY2hvemlkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzM1ODE1NjcsImV4cCI6MjA4OTE1NzU2N30.6C9T_4tj4jHNtCB7KkUbUqFAK58XObRwXDTOQXf0S_M'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)
