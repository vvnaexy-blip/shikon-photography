/**
 * Gallery data-access functions.
 *
 * Behaviour:
 *   - Supabase configured + production: errors throw, NO localStorage fallback.
 *   - Supabase configured + dev:        errors console.error + localStorage fallback.
 *   - Supabase not configured:          localStorage only (dev without .env).
 */

import { tryGetSupabaseClient, isSupabaseConfigured, isProduction } from '@/lib/supabase'
import {
  getGalleries as lsGetGalleries,
  getGallery   as lsGetGallery,
  getGalleryBySlug as lsGetGalleryBySlug,
  saveGallery  as lsSaveGallery,
  deleteGallery as lsDeleteGallery,
  getStats     as lsGetStats,
  type GalleryStats,
} from '@/lib/store'
import type { Gallery, GalleryCategory } from '@/types'
import type { GalleryRow, PhotoRow } from './database.types'

// ─── Helpers ──────────────────────────────────────────────────────────────────

/**
 * In production with Supabase configured, throw on DB errors.
 * In dev, log and fall back to localStorage.
 */
function handleReadError(context: string, error: unknown): never | null {
  const msg = error instanceof Error ? error.message : String(error)
  if (isSupabaseConfigured && isProduction) {
    throw new Error(`[db/${context}] ${msg}`)
  }
  console.error(`[db/${context}]:`, msg)
  return null
}

// ─── Row → Domain mappers ─────────────────────────────────────────────────────

function photoRowToPhoto(p: PhotoRow): Gallery['photos'][number] {
  return {
    id:           p.id,
    galleryId:    p.gallery_id,
    imageUrl:     p.image_url,
    thumbnailUrl: p.thumbnail_url,
    filename:     p.filename,
    width:        p.width,
    height:       p.height,
    caption:      p.caption ?? undefined,
    order:        p.display_order,
    createdAt:    p.created_at,
    url:          p.image_url,
  }
}

function rowToGallery(row: GalleryRow, photos: Gallery['photos'] = []): Gallery {
  return {
    id:               row.id,
    slug:             row.slug,
    clientName:       row.client_name,
    title:            row.title,
    date:             row.date,
    location:         row.location,
    category:         row.category as GalleryCategory,
    description:      row.description ?? undefined,
    coverImage:       row.cover_image ?? '',
    coverPhotoId:     row.cover_image ?? '',
    isPrivate:        row.is_private,
    password:         row.password ?? undefined,
    downloadsEnabled: row.downloads_enabled,
    photos,
    createdAt:        row.created_at,
    updatedAt:        row.updated_at,
  }
}

// ─── Fetch with photos ────────────────────────────────────────────────────────

async function fetchWithPhotos(row: GalleryRow): Promise<Gallery> {
  const sb = tryGetSupabaseClient()!
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data, error } = await (sb.from('photos') as any)
    .select('*')
    .eq('gallery_id', row.id)
    .order('display_order', { ascending: true })

  if (error) {
    console.error('[db/fetchWithPhotos] photos query failed:', error.message, 'gallery_id:', row.id)
    return rowToGallery(row, [])
  }

  const photos = ((data as PhotoRow[]) ?? []).map(photoRowToPhoto)
  return rowToGallery(row, photos)
}

// ─── Public API ───────────────────────────────────────────────────────────────

export async function getGalleries(): Promise<Gallery[]> {
  const sb = tryGetSupabaseClient()
  if (!sb) return lsGetGalleries()

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data, error } = await (sb.from('galleries') as any)
    .select('*')
    .order('created_at', { ascending: false })

  if (error || !data) {
    if (handleReadError('getGalleries', error ?? new Error('No data returned')) === null) {
      return lsGetGalleries() // dev fallback only
    }
  }

  return Promise.all((data as GalleryRow[]).map(fetchWithPhotos))
}

export async function getGallery(id: string): Promise<Gallery | undefined> {
  const sb = tryGetSupabaseClient()
  if (!sb) return lsGetGallery(id)

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data, error } = await (sb.from('galleries') as any)
    .select('*').eq('id', id).single()

  if (error || !data) {
    if (handleReadError('getGallery', error ?? new Error('Not found')) === null) {
      return lsGetGallery(id)
    }
  }

  return fetchWithPhotos(data as GalleryRow)
}

export async function getGalleryBySlug(slug: string): Promise<Gallery | undefined> {
  // ── Demo galleries: resolve locally, never touch Supabase ────────────────
  // Import inline to avoid circular deps and keep this isolated
  if (slug.startsWith('demo-')) {
    const { DEMO_GALLERIES } = await import('@/lib/demo')
    return DEMO_GALLERIES.find((g) => g.slug === slug)
  }

  const sb = tryGetSupabaseClient()
  if (!sb) return lsGetGalleryBySlug(slug)

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data, error } = await (sb.from('galleries') as any)
    .select('*').eq('slug', slug).single()

  if (error) {
    // PGRST116 = no rows found (not a server error)
    const isNotFound = (error as Record<string, unknown>).code === 'PGRST116'
    if (isNotFound) return undefined

    if (handleReadError('getGalleryBySlug', error) === null) {
      return lsGetGalleryBySlug(slug)
    }
  }

  if (!data) return undefined
  return fetchWithPhotos(data as GalleryRow)
}

export async function createGallery(gallery: Gallery): Promise<Gallery> {
  const sb = tryGetSupabaseClient()
  if (!sb) { lsSaveGallery(gallery); return gallery }

  const coverId = gallery.coverImage || gallery.coverPhotoId || null

  const insert = {
    id:                gallery.id,
    client_name:       gallery.clientName,
    title:             gallery.title,
    slug:              gallery.slug,
    date:              gallery.date,
    location:          gallery.location,
    category:          gallery.category,
    description:       gallery.description ?? null,
    cover_image:       null as null,
    is_private:        false,
    password:          null as null,
    downloads_enabled: gallery.downloadsEnabled,
    created_at:        gallery.createdAt,
    updated_at:        gallery.updatedAt,
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data, error } = await (sb.from('galleries') as any)
    .upsert(insert, { onConflict: 'id' }).select().single()

  if (error || !data) {
    const msg = error?.message ?? 'Unknown Supabase error'
    console.error('[db] createGallery failed:', {
      message: msg,
      details: (error as unknown as Record<string, unknown>)?.details,
      hint:    (error as unknown as Record<string, unknown>)?.hint,
      code:    (error as unknown as Record<string, unknown>)?.code,
    })
    lsSaveGallery(gallery)
    throw new Error(`Gallery save failed: ${msg}`)
  }

  if (gallery.photos.length > 0) {
    await syncPhotos(sb, gallery.id, gallery.photos)
  }

  if (coverId) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await (sb.from('galleries') as any)
      .update({ cover_image: coverId })
      .eq('id', gallery.id)
  }

  lsSaveGallery(gallery)
  return fetchWithPhotos(data as GalleryRow)
}

export async function updateGallery(gallery: Gallery): Promise<Gallery> {
  return createGallery(gallery)
}

export async function deleteGallery(id: string): Promise<void> {
  lsDeleteGallery(id)
  const sb = tryGetSupabaseClient()
  if (!sb) return

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { error } = await (sb.from('galleries') as any).delete().eq('id', id)
  if (error) {
    console.error('[db] deleteGallery:', error.message)
    if (isProduction) throw new Error(`Delete failed: ${error.message}`)
  }
}

export async function getStats(): Promise<GalleryStats> {
  const sb = tryGetSupabaseClient()
  if (!sb) return lsGetStats()

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data, error } = await (sb.from('galleries') as any).select('id, is_private')
  if (error || !data) return lsGetStats()

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { count: photoCount } = await (sb.from('photos') as any)
    .select('id', { count: 'exact', head: true })

  const rows = data as { id: string; is_private: boolean }[]
  return {
    totalGalleries:   rows.length,
    totalPhotos:      photoCount ?? 0,
    privateGalleries: rows.filter((g) => g.is_private).length,
    publicGalleries:  rows.filter((g) => !g.is_private).length,
  }
}

// ─── Internal photo sync ──────────────────────────────────────────────────────

// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function syncPhotos(sb: any, galleryId: string, photos: Gallery['photos']): Promise<void> {
  await (sb.from('photos') as any).delete().eq('gallery_id', galleryId)
  if (!photos.length) return

  const rows = photos.map((p, i) => ({
    id:            p.id,
    gallery_id:    galleryId,
    image_url:     p.imageUrl || p.url || '',
    thumbnail_url: p.thumbnailUrl || p.imageUrl || p.url || '',
    filename:      p.filename || p.id,
    width:         p.width  || 0,
    height:        p.height || 0,
    caption:       p.caption ?? null,
    display_order: p.order ?? i,
  }))

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { error } = await (sb.from('photos') as any).insert(rows)
  if (error) {
    console.error('[db] syncPhotos failed:', {
      message: error.message,
      details: (error as unknown as Record<string, unknown>)?.details,
      hint:    (error as unknown as Record<string, unknown>)?.hint,
    })
    throw new Error(`Photos save failed: ${error.message}`)
  }
}
