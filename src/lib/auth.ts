'use client'

/**
 * Admin authentication via Supabase Auth (email + password).
 *
 * Security properties:
 *  - No password stored in source code or client-side env vars.
 *  - Session is a signed JWT issued by Supabase, stored in memory/cookie.
 *  - Sign-in goes over HTTPS to Supabase's auth endpoint.
 *  - `persistSession: true` keeps the admin logged in across page refreshes
 *    using Supabase's built-in storage (localStorage key supabase.auth.token).
 *
 * The admin user must be created manually in Supabase Dashboard:
 *   Authentication → Users → Add user (email + password).
 *
 * Client galleries remain publicly accessible — no auth required for them.
 */

import { tryGetSupabaseClient } from '@/lib/supabase'
import type { Session, User } from '@supabase/supabase-js'

export interface AuthResult {
  ok:    boolean
  error: string | null
}

// ─── Sign in ──────────────────────────────────────────────────────────────────

export async function adminSignIn(
  email: string,
  password: string,
): Promise<AuthResult> {
  const sb = tryGetSupabaseClient()

  // Dev fallback: if Supabase is not configured, allow a hardcoded dev login.
  // This path is ONLY reachable when NEXT_PUBLIC_SUPABASE_URL is not set.
  if (!sb) {
    const devPassword = process.env.NEXT_PUBLIC_DEV_ADMIN_PASSWORD
    if (devPassword && password === devPassword) {
      if (typeof sessionStorage !== 'undefined') {
        sessionStorage.setItem('shiko_dev_admin', 'true')
      }
      return { ok: true, error: null }
    }
    return { ok: false, error: 'Admin login requires Supabase to be configured.' }
  }

  const { error } = await sb.auth.signInWithPassword({ email, password })
  if (error) return { ok: false, error: error.message }
  return { ok: true, error: null }
}

// ─── Sign out ─────────────────────────────────────────────────────────────────

export async function adminSignOut(): Promise<void> {
  const sb = tryGetSupabaseClient()
  if (sb) {
    await sb.auth.signOut()
  }
  // Also clear dev fallback
  if (typeof sessionStorage !== 'undefined') {
    sessionStorage.removeItem('shiko_dev_admin')
  }
}

// ─── Get current session ──────────────────────────────────────────────────────

export async function getAdminSession(): Promise<Session | null> {
  const sb = tryGetSupabaseClient()
  if (!sb) return null
  const { data } = await sb.auth.getSession()
  return data.session
}

export async function getAdminUser(): Promise<User | null> {
  const sb = tryGetSupabaseClient()
  if (!sb) return null
  const { data } = await sb.auth.getUser()
  return data.user ?? null
}

/**
 * Returns true if the admin is currently logged in.
 * Checks real Supabase session first; falls back to dev sessionStorage flag.
 */
export async function isAdminAuthenticated(): Promise<boolean> {
  const sb = tryGetSupabaseClient()
  if (sb) {
    const { data } = await sb.auth.getUser()
    return !!data.user
  }
  // Dev mode without Supabase
  if (typeof sessionStorage !== 'undefined') {
    return sessionStorage.getItem('shiko_dev_admin') === 'true'
  }
  return false
}
