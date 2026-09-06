import { createClient, SupabaseClient } from '@supabase/supabase-js'
import type { Database } from './db/database.types'

// ─── Configuration guard ──────────────────────────────────────────────────────
const url = process.env.NEXT_PUBLIC_SUPABASE_URL  ?? ''
const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? ''

/**
 * True when both environment variables are present and non-empty.
 * When false the site falls back to localStorage (dev only).
 */
export const isSupabaseConfigured: boolean =
  url.length > 0 &&
  url !== 'your-project-url' &&
  key.length > 0 &&
  key !== 'your-anon-key'

/**
 * True when we are running in a production-like environment.
 * In production + Supabase configured, errors are NOT silently swallowed.
 */
export const isProduction: boolean =
  process.env.NODE_ENV === 'production' || process.env.NEXT_PUBLIC_VERCEL_ENV === 'production'

// ─── Singleton client ─────────────────────────────────────────────────────────
let _client: SupabaseClient<Database> | null = null

export function getSupabaseClient(): SupabaseClient<Database> {
  if (!isSupabaseConfigured) {
    throw new Error(
      'Supabase is not configured. Set NEXT_PUBLIC_SUPABASE_URL and ' +
      'NEXT_PUBLIC_SUPABASE_ANON_KEY in .env.local (dev) or deployment environment variables (production).',
    )
  }
  if (!_client) {
    _client = createClient<Database>(url, key, {
      auth: { persistSession: true, autoRefreshToken: true },
    })
  }
  return _client
}

/**
 * Returns the Supabase client when configured, otherwise null.
 *
 * IMPORTANT: callers in production should NOT fall back to localStorage
 * when this returns a client but the query fails — use tryGetSupabaseOrThrow
 * instead. This null-returning version is kept for places that genuinely
 * need a graceful no-op when Supabase is absent (e.g., dev without .env).
 */
export function tryGetSupabaseClient(): SupabaseClient<Database> | null {
  return isSupabaseConfigured ? getSupabaseClient() : null
}

/**
 * Returns the Supabase client, or throws a clear error if not configured.
 * Use this in operations that must NOT fall back silently (production reads/writes).
 */
export function getSupabaseOrThrow(): SupabaseClient<Database> {
  if (!isSupabaseConfigured) {
    throw new Error(
      '[Supabase] Not configured — set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY.',
    )
  }
  return getSupabaseClient()
}
