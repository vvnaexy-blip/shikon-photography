'use client'

import { tryGetSupabaseClient } from '@/lib/supabase'
import {
  getFavorites   as lsGetFavorites,
  isFavorite     as lsIsFavorite,
  toggleFavorite as lsToggleFavorite,
  clearFavorites as lsClearFavorites,
} from '@/lib/store'
import type { Favorite } from '@/types'

// ─── Anonymous client ID ─────────────────────────────────────────────────────

const CLIENT_ID_KEY = 'shiko_client_id'

function getClientId(): string {
  if (typeof window === 'undefined') return 'server'
  let id = localStorage.getItem(CLIENT_ID_KEY)
  if (!id) {
    id = Math.random().toString(36).slice(2) + Date.now().toString(36)
    localStorage.setItem(CLIENT_ID_KEY, id)
  }
  return id
}

// ─── Public API ───────────────────────────────────────────────────────────────

export function getFavorites(galleryId?: string): Favorite[] {
  return lsGetFavorites(galleryId)
}

export function isFavorite(photoId: string): boolean {
  return lsIsFavorite(photoId)
}

export function toggleFavorite(photoId: string, galleryId: string): boolean {
  const added = lsToggleFavorite(photoId, galleryId)

  const sb = tryGetSupabaseClient()
  if (sb) {
    const clientId = getClientId()
    if (added) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      ;(sb.from('favorites') as any)
        .insert({ gallery_id: galleryId, photo_id: photoId, client_identifier: clientId })
        .then(({ error }: { error: { message: string } | null }) => {
          if (error) console.warn('[db] toggleFavorite insert:', error.message)
        })
    } else {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      ;(sb.from('favorites') as any)
        .delete()
        .eq('photo_id', photoId)
        .eq('client_identifier', clientId)
        .then(({ error }: { error: { message: string } | null }) => {
          if (error) console.warn('[db] toggleFavorite delete:', error.message)
        })
    }
  }

  return added
}

export function clearFavorites(galleryId: string): void {
  lsClearFavorites(galleryId)

  const sb = tryGetSupabaseClient()
  if (sb) {
    const clientId = getClientId()
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    ;(sb.from('favorites') as any)
      .delete()
      .eq('gallery_id', galleryId)
      .eq('client_identifier', clientId)
      .then(({ error }: { error: { message: string } | null }) => {
        if (error) console.warn('[db] clearFavorites:', error.message)
      })
  }
}
