// ─── Gallery category ─────────────────────────────────────────────────────────
export type GalleryCategory =
  | 'wedding'
  | 'portrait'
  | 'event'
  | 'family'
  | 'newborn'
  | 'commercial'
  | 'landscape'
  | 'other'

// ─── Photo ────────────────────────────────────────────────────────────────────
export interface Photo {
  id: string
  galleryId: string
  imageUrl: string        // full-resolution URL (data URL or remote)
  thumbnailUrl: string    // compressed / resized URL
  filename: string
  width: number
  height: number
  caption?: string
  order: number
  createdAt: string

  // Legacy aliases kept for backward compat during migration
  url?: string
  uploadedAt?: string
}

// ─── Gallery ──────────────────────────────────────────────────────────────────
export interface Gallery {
  id: string
  slug: string
  clientName: string
  title: string
  date: string            // ISO date string  "2026-09-05"
  location: string
  category: GalleryCategory
  description?: string
  coverImage?: string     // photo id used as cover
  /** @deprecated use coverImage */
  coverPhotoId?: string
  photos: Photo[]
  isPrivate: boolean
  password?: string
  downloadsEnabled: boolean
  createdAt: string
  updatedAt: string
}

// ─── Favorite ─────────────────────────────────────────────────────────────────
export interface Favorite {
  photoId: string
  galleryId: string
  savedAt: string
}

// ─── Admin ────────────────────────────────────────────────────────────────────
export interface AdminCredentials {
  password: string
}

// ─── Image service adapter (future-proof) ────────────────────────────────────
// When you switch to Supabase / Cloudinary / S3, implement this interface
// and inject it into the store. Local file reads use the built-in base64 adapter.
export interface ImageAdapter {
  upload(file: File, galleryId: string): Promise<{ imageUrl: string; thumbnailUrl: string }>
  delete(imageUrl: string): Promise<void>
}
