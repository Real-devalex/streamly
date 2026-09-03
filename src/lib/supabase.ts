import { createClient, type SupabaseClient } from '@supabase/supabase-js'

const rawUrl = (import.meta.env.VITE_SUPABASE_URL ?? '').trim()
const rawKey = (import.meta.env.VITE_SUPABASE_ANON_KEY ?? '').trim()

/**
 * True when real Supabase credentials are present.
 * When false the app runs in DEMO MODE: mock movies, mock comments and a
 * mock auth session, so every screen stays fully explorable.
 */
export const isSupabaseConfigured =
  rawUrl.length > 0 &&
  rawKey.length > 0 &&
  !rawUrl.includes('your-project-url') &&
  !rawKey.includes('your-anon-key')

const supabaseUrl = isSupabaseConfigured ? rawUrl : 'https://placeholder.supabase.co'
const supabaseAnonKey = isSupabaseConfigured
  ? rawKey
  : 'placeholder-anon-key-placeholder-anon-key-placeholder-anon-key'

export const supabase: SupabaseClient = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: isSupabaseConfigured,
    autoRefreshToken: isSupabaseConfigured,
    detectSessionInUrl: isSupabaseConfigured,
  },
  global: {
    headers: { 'x-application-name': import.meta.env.VITE_APP_NAME || 'Streamly' },
  },
})

export const appName: string = import.meta.env.VITE_APP_NAME || 'Streamly'
export const appUrl: string = import.meta.env.VITE_APP_URL || 'http://localhost:5173'

/** Small helper for consistent error messages across data calls. */
export function toErrorMessage(error: unknown): string {
  if (error instanceof Error) return error.message
  if (typeof error === 'string') return error
  if (error && typeof error === 'object' && 'message' in error) {
    return String((error as { message: unknown }).message)
  }
  return 'Something went wrong. Please try again.'
}
