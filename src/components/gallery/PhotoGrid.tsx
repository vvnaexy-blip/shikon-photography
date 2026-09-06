'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { Download, Heart } from 'lucide-react'
import { cn, gridThumbUrl, originalUrl } from '@/lib/utils'
import { isFavorite, toggleFavorite } from '@/lib/store'
import Lightbox from './Lightbox'
import type { Photo } from '@/types'

interface PhotoGridProps {
  photos: Photo[]
  galleryId: string
  downloadsEnabled: boolean
  favoritedIds?: Set<string>
  onFavoriteChange?: (photoId: string, added: boolean) => void
}

const PAGE_SIZE = 40

export default function PhotoGrid({
  photos,
  galleryId,
  downloadsEnabled,
  favoritedIds,
  onFavoriteChange,
}: PhotoGridProps) {
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null)
  const [localFavs,     setLocalFavs]     = useState<Set<string>>(new Set())
  const [visibleCount,  setVisibleCount]  = useState(PAGE_SIZE)
  const sentinelRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (favoritedIds) {
      setLocalFavs(favoritedIds)
    } else {
      const ids = new Set(photos.filter((p) => isFavorite(p.id)).map((p) => p.id))
      setLocalFavs(ids)
    }
  }, [photos, favoritedIds])

  useEffect(() => {
    setVisibleCount(PAGE_SIZE)
  }, [photos])

  const loadMore = useCallback(() => {
    setVisibleCount((n) => Math.min(n + PAGE_SIZE, photos.length))
  }, [photos.length])

  useEffect(() => {
    const el = sentinelRef.current
    if (!el) return
    const obs = new IntersectionObserver(
      (entries) => { if (entries[0].isIntersecting) loadMore() },
      { rootMargin: '600px' },
    )
    obs.observe(el)
    return () => obs.disconnect()
  }, [loadMore])

  const handleToggleFav = (e: React.MouseEvent, photo: Photo) => {
    e.stopPropagation()
    const added = toggleFavorite(photo.id, galleryId)
    setLocalFavs((prev) => {
      const next = new Set(prev)
      added ? next.add(photo.id) : next.delete(photo.id)
      return next
    })
    onFavoriteChange?.(photo.id, added)
  }

  const handleDownload = async (e: React.MouseEvent, photo: Photo) => {
    e.stopPropagation()
    const url = originalUrl(photo)
    try {
      const res = await fetch(url)
      const blob = await res.blob()
      const objectUrl = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = objectUrl
      a.download = photo.filename || `shiko-${photo.id}.jpg`
      a.click()
      URL.revokeObjectURL(objectUrl)
    } catch {
      window.open(url, '_blank')
    }
  }

  if (!photos.length) return null

  const visiblePhotos = photos.slice(0, visibleCount)

  return (
    <>
      {/*
        Uniform square grid — 2 cols mobile, 3 cols sm, 4 cols lg.
        object-cover preserves aspect ratio within each cell.
        No CSS columns masonry to avoid rendering quirks.
      */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-0.5 sm:gap-1">
        {visiblePhotos.map((photo, idx) => {
          const faved = localFavs.has(photo.id)
          const src   = gridThumbUrl(photo)

          return (
            <div
              key={photo.id}
              className="group relative aspect-square overflow-hidden bg-warm-100 cursor-pointer"
              onClick={() => setLightboxIndex(idx)}
              role="button"
              tabIndex={0}
              aria-label={`View photo ${idx + 1}`}
              onKeyDown={(e) => e.key === 'Enter' && setLightboxIndex(idx)}
            >
              <img
                src={src}
                alt={photo.caption || `Photo ${idx + 1}`}
                loading="lazy"
                decoding="async"
                className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-[1.02]"
              />

              {/* Hover overlay — very subtle */}
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-300 pointer-events-none" />

              {/* Action buttons */}
              <div className="absolute bottom-2 right-2 flex gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-auto">
                <button
                  onClick={(e) => handleToggleFav(e, photo)}
                  className="bg-white/85 backdrop-blur-sm p-1.5 shadow-sm"
                  aria-label={faved ? 'Remove from favorites' : 'Add to favorites'}
                >
                  <Heart
                    size={12}
                    className={cn(
                      'transition-colors',
                      faved ? 'fill-foreground text-foreground' : 'text-foreground/70',
                    )}
                  />
                </button>
                {downloadsEnabled && (
                  <button
                    onClick={(e) => handleDownload(e, photo)}
                    className="bg-white/85 backdrop-blur-sm p-1.5 shadow-sm"
                    aria-label="Download photo"
                  >
                    <Download size={12} className="text-foreground/70" />
                  </button>
                )}
              </div>

              {/* Persistent fav indicator */}
              {faved && (
                <div className="absolute top-2 left-2 group-hover:opacity-0 transition-opacity pointer-events-none">
                  <Heart size={11} className="fill-white text-white drop-shadow-sm" />
                </div>
              )}
            </div>
          )
        })}
      </div>

      {/* Load-more sentinel */}
      {visibleCount < photos.length && (
        <div ref={sentinelRef} className="flex items-center justify-center py-10">
          <div className="w-5 h-5 border border-muted border-t-foreground rounded-full animate-spin" />
        </div>
      )}

      <Lightbox
        photos={photos}
        currentIndex={lightboxIndex ?? 0}
        downloadsEnabled={downloadsEnabled}
        galleryId={galleryId}
        onClose={() => setLightboxIndex(null)}
        onNavigate={setLightboxIndex}
        open={lightboxIndex !== null}
      />
    </>
  )
}
