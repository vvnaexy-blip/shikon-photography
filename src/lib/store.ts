'use client'

import type { Gallery, Photo, Favorite } from '@/types'

// ─── Storage keys ─────────────────────────────────────────────────────────────
const STORAGE_KEY        = 'shiko_galleries'
const ADMIN_KEY          = 'shiko_admin_auth'
const GALLERY_ACCESS_KEY = 'shiko_gallery_access'
const FAVORITES_KEY      = 'shiko_favorites'

// ─── Photo normaliser (handles old url/uploadedAt aliases) ───────────────────
function normalisePhoto(p: Photo): Photo {
  return {
    ...p,
    imageUrl:      p.imageUrl      || p.url        || '',
    thumbnailUrl:  p.thumbnailUrl  || p.url        || '',
    filename:      p.filename      || p.id         || 'photo',
    order:         p.order         ?? 0,
    galleryId:     p.galleryId     || '',
    createdAt:     p.createdAt     || p.uploadedAt || new Date().toISOString(),
  }
}

// ─── Gallery normaliser ───────────────────────────────────────────────────────
function normaliseGallery(g: Gallery): Gallery {
  return {
    ...g,
    coverImage: g.coverImage || g.coverPhotoId || '',
    photos:     (g.photos || []).map(normalisePhoto),
  }
}

// ─── Galleries ───────────────────────────────────────────────────────────────
export function getGalleries(): Gallery[] {
  if (typeof window === 'undefined') return []
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    const list = raw ? (JSON.parse(raw) as Gallery[]) : []
    return list.map(normaliseGallery)
  } catch {
    return []
  }
}

export function getGallery(id: string): Gallery | undefined {
  return getGalleries().find((g) => g.id === id)
}

export function getGalleryBySlug(slug: string): Gallery | undefined {
  return getGalleries().find((g) => g.slug === slug)
}

export function saveGallery(gallery: Gallery): void {
  const galleries = getGalleries()
  const normalised = normaliseGallery(gallery)
  const idx = galleries.findIndex((g) => g.id === normalised.id)
  if (idx >= 0) {
    galleries[idx] = normalised
  } else {
    galleries.unshift(normalised)
  }
  localStorage.setItem(STORAGE_KEY, JSON.stringify(galleries))
}

export function deleteGallery(id: string): void {
  const galleries = getGalleries().filter((g) => g.id !== id)
  localStorage.setItem(STORAGE_KEY, JSON.stringify(galleries))
  // also clean up favorites for this gallery
  const favs = getFavorites().filter((f) => f.galleryId !== id)
  localStorage.setItem(FAVORITES_KEY, JSON.stringify(favs))
}

// ─── Stats ────────────────────────────────────────────────────────────────────
export interface GalleryStats {
  totalGalleries: number
  totalPhotos: number
  privateGalleries: number
  publicGalleries: number
}

export function getStats(): GalleryStats {
  const galleries = getGalleries()
  return {
    totalGalleries:  galleries.length,
    totalPhotos:     galleries.reduce((acc, g) => acc + g.photos.length, 0),
    privateGalleries: galleries.filter((g) => g.isPrivate).length,
    publicGalleries:  galleries.filter((g) => !g.isPrivate).length,
  }
}

// ─── Admin auth ──────────────────────────────────────────────────────────────
// Moved to src/lib/auth.ts (Supabase Auth).
// These stubs are kept so any import that hasn't been updated yet
// gets a clear runtime error rather than a silent wrong-auth bug.

/** @deprecated Use adminSignIn() from src/lib/auth.ts instead */
export function adminLogin(_password: string): boolean {
  throw new Error(
    '[store] adminLogin is deprecated. Use adminSignIn() from @/lib/auth instead.',
  )
}

/** @deprecated Use isAdminAuthenticated() from src/lib/auth.ts instead */
export function isAdminLoggedIn(): boolean {
  if (typeof window === 'undefined') return false
  // Dev-only shim — returns false so AdminShell re-checks via auth.ts
  return false
}

/** @deprecated Use adminSignOut() from src/lib/auth.ts instead */
export function adminLogout(): void {
  // no-op — handled by auth.ts
}

// ─── Gallery password access ──────────────────────────────────────────────────
export function markGalleryAccessed(galleryId: string): void {
  const accessed = getAccessedGalleries()
  accessed.add(galleryId)
  sessionStorage.setItem(GALLERY_ACCESS_KEY, JSON.stringify([...accessed]))
}

export function hasGalleryAccess(galleryId: string): boolean {
  if (typeof window === 'undefined') return false
  return getAccessedGalleries().has(galleryId)
}

function getAccessedGalleries(): Set<string> {
  try {
    const raw = sessionStorage.getItem(GALLERY_ACCESS_KEY)
    return new Set(raw ? JSON.parse(raw) : [])
  } catch {
    return new Set()
  }
}

// ─── Favorites ────────────────────────────────────────────────────────────────
export function getFavorites(galleryId?: string): Favorite[] {
  if (typeof window === 'undefined') return []
  try {
    const raw = localStorage.getItem(FAVORITES_KEY)
    const all = raw ? (JSON.parse(raw) as Favorite[]) : []
    return galleryId ? all.filter((f) => f.galleryId === galleryId) : all
  } catch {
    return []
  }
}

export function isFavorite(photoId: string): boolean {
  return getFavorites().some((f) => f.photoId === photoId)
}

export function toggleFavorite(photoId: string, galleryId: string): boolean {
  const favs = getFavorites()
  const idx = favs.findIndex((f) => f.photoId === photoId)
  if (idx >= 0) {
    favs.splice(idx, 1)
    localStorage.setItem(FAVORITES_KEY, JSON.stringify(favs))
    return false // removed
  } else {
    favs.push({ photoId, galleryId, savedAt: new Date().toISOString() })
    localStorage.setItem(FAVORITES_KEY, JSON.stringify(favs))
    return true  // added
  }
}

export function clearFavorites(galleryId: string): void {
  const favs = getFavorites().filter((f) => f.galleryId !== galleryId)
  localStorage.setItem(FAVORITES_KEY, JSON.stringify(favs))
}

// ─── ID / slug helpers ────────────────────────────────────────────────────────

/** Generate a proper UUID v4 — required by Supabase uuid columns */
export function generateId(): string {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID()
  }
  // Fallback for older environments
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0
    const v = c === 'x' ? r : (r & 0x3) | 0x8
    return v.toString(16)
  })
}

export function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}
