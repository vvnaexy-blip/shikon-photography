import { tryGetSupabaseClient } from '@/lib/supabase'
import {
  getGallery  as lsGetGallery,
  saveGallery as lsSaveGallery,
} from '@/lib/store'
import type { Photo } from '@/types'
import type { PhotoRow } from './database.types'

export async function getGalleryPhotos(galleryId: string): Promise<Photo[]> {
  const sb = tryGetSupabaseClient()
  if (!sb) return lsGetGallery(galleryId)?.photos ?? []

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data, error } = await (sb.from('photos') as any)
    .select('*')
    .eq('gallery_id', galleryId)
    .order('display_order', { ascending: true })

  if (error || !data) {
    console.error('[db] getGalleryPhotos:', error?.message)
    return lsGetGallery(galleryId)?.photos ?? []
  }

  return (data as PhotoRow[]).map((p) => ({
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
  }))
}

export async function deletePhoto(photoId: string, galleryId: string): Promise<void> {
  // Mirror to localStorage
  const g = lsGetGallery(galleryId)
  if (g) lsSaveGallery({ ...g, photos: g.photos.filter((p) => p.id !== photoId) })

  const sb = tryGetSupabaseClient()
  if (!sb) return

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { error } = await (sb.from('photos') as any).delete().eq('id', photoId)
  if (error) console.error('[db] deletePhoto:', error.message)
}

export async function updatePhotoOrder(galleryId: string, orderedIds: string[]): Promise<void> {
  // Mirror to localStorage
  const g = lsGetGallery(galleryId)
  if (g) {
    const map = new Map(g.photos.map((p) => [p.id, p]))
    const reordered = orderedIds
      .map((id, i) => { const p = map.get(id); return p ? { ...p, order: i } : null })
      .filter((p): p is Photo => p !== null)
    lsSaveGallery({ ...g, photos: reordered })
  }

  const sb = tryGetSupabaseClient()
  if (!sb) return

  await Promise.all(
    orderedIds.map((id, i) =>
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (sb.from('photos') as any).update({ display_order: i }).eq('id', id),
    ),
  )
}
