/**
 * Image storage adapter.
 *
 * When Supabase is configured:
 *   - Uploads the original file to the `gallery-photos` bucket under
 *     `{galleryId}/original/{uuid}-{filename}`
 *   - Returns the public URL as both imageUrl and thumbnailUrl
 *     (transform applied at display-time via utils.ts addTransform)
 *
 * When Supabase is NOT configured:
 *   - Reads the file as a base64 data URL (dev fallback)
 *   - Returns that data URL so the rest of the app works unchanged
 */

import { tryGetSupabaseClient, isSupabaseConfigured } from '@/lib/supabase'
import type { ImageAdapter } from '@/types'

const BUCKET = 'gallery-photos'

// ─── Helpers ─────────────────────────────────────────────────────────────────

function sanitiseFilename(name: string): string {
  return name
    .toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/[^a-z0-9.\-_]/g, '')
    .replace(/-+/g, '-')
}

function readAsDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload  = (e) => resolve(e.target?.result as string)
    reader.onerror = () => reject(new Error('Failed to read file'))
    reader.readAsDataURL(file)
  })
}

function getImageDimensions(src: string): Promise<{ width: number; height: number }> {
  return new Promise((resolve) => {
    // Remote URLs: skip — Supabase transform renders them correctly regardless
    if (!src.startsWith('data:') && !src.startsWith('blob:')) {
      resolve({ width: 0, height: 0 })
      return
    }
    const img   = new window.Image()
    const timer = setTimeout(() => resolve({ width: 0, height: 0 }), 5000)
    img.onload  = () => { clearTimeout(timer); resolve({ width: img.naturalWidth, height: img.naturalHeight }) }
    img.onerror = () => { clearTimeout(timer); resolve({ width: 0, height: 0 }) }
    img.src = src
  })
}

// ─── Fix 1: UUID-based path — no Date.now() collision ────────────────────────
function uniqueStoragePath(galleryId: string, filename: string): string {
  const clean = sanitiseFilename(filename)
  // crypto.randomUUID() is available in all modern browsers and Node 16+
  const uid   = typeof crypto !== 'undefined' && crypto.randomUUID
    ? crypto.randomUUID()
    : Math.random().toString(36).slice(2) + Math.random().toString(36).slice(2)
  return `${galleryId}/original/${uid}-${clean}`
}

// ─── Fix 3: retry with exponential back-off ───────────────────────────────────
const MAX_RETRIES  = 3
const BASE_DELAY   = 1000 // ms — doubles each retry (1s, 2s, 4s)

/** Returns true for errors that are worth retrying (transient/rate-limit). */
function isRetryable(err: unknown): boolean {
  if (!err) return false
  const msg = (err instanceof Error ? err.message : String(err)).toLowerCase()
  return (
    msg.includes('429')     ||   // rate limit
    msg.includes('timeout') ||   // request timeout
    msg.includes('network') ||   // generic network
    msg.includes('fetch')   ||   // fetch failure
    msg.includes('connect') ||   // connection refused/reset
    msg.includes('503')     ||   // service unavailable
    msg.includes('502')          // bad gateway
  )
}

async function uploadWithRetry(
  file: File,
  path:  string,
): Promise<void> {
  const sb = tryGetSupabaseClient()
  if (!sb) throw new Error('Supabase not configured')

  let lastErr: unknown

  for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
    try {
      const { error } = await sb.storage
        .from(BUCKET)
        .upload(path, file, { cacheControl: '31536000', upsert: false })

      if (!error) return // success

      // Non-retryable Supabase error (e.g. permission denied, already exists)
      if (!isRetryable(error)) {
        throw new Error(`Upload failed: ${error.message}`)
      }

      lastErr = error
    } catch (err) {
      // If the error is not retryable re-throw immediately
      if (!isRetryable(err)) throw err
      lastErr = err
    }

    if (attempt < MAX_RETRIES) {
      const delay = BASE_DELAY * Math.pow(2, attempt - 1)
      console.warn(`[storage] upload attempt ${attempt} failed — retrying in ${delay}ms…`, lastErr)
      await new Promise((r) => setTimeout(r, delay))
    }
  }

  const msg = lastErr instanceof Error ? lastErr.message : String(lastErr)
  throw new Error(`Upload failed after ${MAX_RETRIES} attempts: ${msg}`)
}

// ─── Supabase storage adapter ────────────────────────────────────────────────

const supabaseAdapter: ImageAdapter = {
  async upload(file: File, galleryId: string) {
    const sb = tryGetSupabaseClient()
    if (!sb) throw new Error('Supabase not configured')

    // Fix 1: UUID-based path — guaranteed unique even for concurrent same-name files
    const path = uniqueStoragePath(galleryId, file.name)

    console.log(`[storage] uploading → ${path}`)

    // Fix 3: retry logic (up to 3 attempts, exponential back-off)
    await uploadWithRetry(file, path)

    console.log('[storage] upload OK:', path)

    const { data: { publicUrl } } = sb.storage.from(BUCKET).getPublicUrl(path)
    return { imageUrl: publicUrl, thumbnailUrl: publicUrl }
  },

  async delete(imageUrl: string) {
    const sb = tryGetSupabaseClient()
    if (!sb) return

    const marker = `/object/public/${BUCKET}/`
    const idx    = imageUrl.indexOf(marker)
    if (idx === -1) return

    const storagePath = imageUrl.slice(idx + marker.length)
    const { error } = await sb.storage.from(BUCKET).remove([storagePath])
    if (error) console.warn('[storage] delete:', error.message)
  },
}

// ─── Local (base64) adapter ───────────────────────────────────────────────────

const localAdapter: ImageAdapter = {
  async upload(file: File) {
    const dataUrl = await readAsDataUrl(file)
    return { imageUrl: dataUrl, thumbnailUrl: dataUrl }
  },
  async delete() { /* nothing to delete */ },
}

// ─── Active adapter ───────────────────────────────────────────────────────────

export const storageAdapter: ImageAdapter = isSupabaseConfigured
  ? supabaseAdapter
  : localAdapter

// ─── Public API used by GalleryForm ──────────────────────────────────────────

export interface UploadResult {
  imageUrl:     string
  thumbnailUrl: string
  width:        number
  height:       number
}

/**
 * Upload a single image file and return URLs + dimensions.
 *
 * Fix 2: called sequentially from GalleryForm (concurrency = 1).
 * This function itself is not async-concurrent — the caller controls concurrency.
 */
export async function uploadPhoto(
  file: File,
  galleryId: string,
): Promise<UploadResult> {
  const { imageUrl, thumbnailUrl } = await storageAdapter.upload(file, galleryId)
  const { width, height }          = await getImageDimensions(imageUrl)
  return { imageUrl, thumbnailUrl, width, height }
}

export async function deleteStoredPhoto(imageUrl: string): Promise<void> {
  if (imageUrl.startsWith('data:')) return
  await storageAdapter.delete(imageUrl)
}
