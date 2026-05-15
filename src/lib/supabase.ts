import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = 'https://tixgzezefjjsyuzgdhcd.supabase.co'
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRpeGd6ZXplZmpqc3l1emdkaGNkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzgxNDkzNzgsImV4cCI6MjA5MzcyNTM3OH0.Hpr0F_kgFc9OkOla-UGHBioR6y2OBB2jbI-0xKMU1M4'

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY)

export interface DbArticle {
  id?: number
  slug: string
  tool_path: string
  title: string
  description: string
  keywords: string[]
  category: string
  published_at: string
  content: string
  created_at?: string
  updated_at?: string
}
