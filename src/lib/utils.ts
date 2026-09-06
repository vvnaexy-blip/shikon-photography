import type { GalleryCategory, Gallery, Photo } from '@/types'

export const CATEGORY_LABELS: Record<GalleryCategory, string> = {
  wedding:    'Wedding',
  portrait:   'Portrait',
  event:      'Event',
  family:     'Family',
  newborn:    'Newborn',
  commercial: 'Commercial',
  landscape:  'Landscape',
  other:      'Other',
}

export const CATEGORIES: GalleryCategory[] = [
  'wedding',
  'portrait',
  'event',
  'family',
  'newborn',
  'commercial',
  'landscape',
  'other',
]

export function formatDate(dateStr: string): string {
  const d = new Date(dateStr)
  return d.toLocaleDateString('en-US', {
    year:  'numeric',
    month: 'long',
    day:   'numeric',
  })
}

export function formatDateShort(dateStr: string): string {
  const d = new Date(dateStr)
  return d.toLocaleDateString('en-US', { year: 'numeric', month: 'long' })
}

/** Returns the effective cover photo of a gallery */
export function getCoverPhoto(gallery: Gallery): Photo | undefined {
  if (!gallery.photos.length) return undefined
  const coverId = gallery.coverImage || gallery.coverPhotoId
  if (coverId) {
    const found = gallery.photos.find((p) => p.id === coverId)
    if (found) return found
  }
  return gallery.photos[0]
}

/** Get the best display URL for a photo (imageUrl with url fallback) */
export function photoUrl(photo: Photo): string {
  return photo.imageUrl || photo.url || ''
}

/** Get thumbnail URL for a photo */
export function thumbUrl(photo: Photo): string {
  return photo.thumbnailUrl || photo.imageUrl || photo.url || ''
}

// ─── Supabase Image Transform helpers ────────────────────────────────────────

const SUPABASE_STORAGE_MARKER = '/storage/v1/object/public/'
const SUPABASE_RENDER_BASE    = '/storage/v1/render/image/public/'

/**
 * Returns an optimised URL for grid thumbnails via Supabase Image Transform.
 * Falls back to the original URL for non-Supabase URLs (base64, etc.).
 *
 * width=600, quality=75 — good balance for 2-4 col grids on mobile/desktop.
 */
export function gridThumbUrl(photo: Photo): string {
  const src = photo.imageUrl || photo.url || ''
  return addTransform(src, 600, 75)
}

/**
 * Returns an optimised URL for the Lightbox fullscreen view.
 * width=1600, quality=90 — crisp on retina, still much smaller than originals.
 */
export function lightboxUrl(photo: Photo): string {
  const src = photo.imageUrl || photo.url || ''
  return addTransform(src, 1600, 90)
}

/**
 * Always returns the original full-resolution URL — used for downloads.
 */
export function originalUrl(photo: Photo): string {
  return photo.imageUrl || photo.url || ''
}

/** Internal: swap /object/public/ → /render/image/public/ and append query */
function addTransform(url: string, width: number, quality: number): string {
  if (!url || url.startsWith('data:') || url.startsWith('blob:')) return url
  if (!url.includes(SUPABASE_STORAGE_MARKER)) return url

  const renderUrl = url.replace(SUPABASE_STORAGE_MARKER, SUPABASE_RENDER_BASE)
  // Append or replace query params
  const separator = renderUrl.includes('?') ? '&' : '?'
  return `${renderUrl}${separator}width=${width}&quality=${quality}&resize=contain`
}

export function cn(...classes: (string | undefined | false | null)[]): string {
  return classes.filter(Boolean).join(' ')
}
