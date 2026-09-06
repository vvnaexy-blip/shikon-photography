'use client'

import { useState } from 'react'
import { Heart, X, Download, Trash2 } from 'lucide-react'
import { cn, originalUrl, gridThumbUrl } from '@/lib/utils'
import { clearFavorites, toggleFavorite } from '@/lib/store'
import type { Photo } from '@/types'
import Button from '@/components/ui/Button'

interface FavoritesPanelProps {
  photos: Photo[]           // all gallery photos
  galleryId: string
  favoriteIds: Set<string>
  downloadsEnabled: boolean
  onClose: () => void
  onFavoriteChange: (photoId: string, added: boolean) => void
}

export default function FavoritesPanel({
  photos,
  galleryId,
  favoriteIds,
  downloadsEnabled,
  onClose,
  onFavoriteChange,
}: FavoritesPanelProps) {
  const favPhotos = photos.filter((p) => favoriteIds.has(p.id))

  const handleRemove = (photo: Photo) => {
    toggleFavorite(photo.id, galleryId)
    onFavoriteChange(photo.id, false)
  }

  const handleClearAll = () => {
    clearFavorites(galleryId)
    favPhotos.forEach((p) => onFavoriteChange(p.id, false))
  }

  const handleDownloadAll = async () => {
    for (const photo of favPhotos) {
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
        await new Promise((r) => setTimeout(r, 300))
      } catch {
        window.open(url, '_blank')
      }
    }
  }

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-[60] bg-foreground/20 backdrop-blur-sm"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Panel */}
      <div className="fixed right-0 top-0 bottom-0 z-[70] w-full max-w-sm bg-warm-50 flex flex-col shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-border">
          <div className="flex items-center gap-2.5">
            <Heart size={16} className="text-foreground" strokeWidth={1.5} />
            <h2 className="font-[family-name:var(--font-cormorant)] text-xl font-medium">
              Favorites
            </h2>
            <span className="text-xs text-muted">({favPhotos.length})</span>
          </div>
          <button
            onClick={onClose}
            className="text-muted hover:text-foreground transition-colors p-1"
            aria-label="Close favorites"
          >
            <X size={18} />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto">
          {favPhotos.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full gap-4 px-8 text-center">
              <Heart size={36} strokeWidth={1} className="text-warm-300" />
              <p className="font-[family-name:var(--font-cormorant)] text-xl font-light text-warm-500">
                No favorites yet
              </p>
              <p className="text-xs text-muted leading-relaxed">
                Tap the heart icon on any photo to save it here.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-3 gap-0.5 p-0.5">
              {favPhotos.map((photo) => (
                <div key={photo.id} className="group relative aspect-square overflow-hidden bg-warm-100">
                  <img
                    src={gridThumbUrl(photo)}
                    alt={photo.caption || 'Favorite photo'}
                    className="absolute inset-0 w-full h-full object-cover"
                    loading="lazy"
                    decoding="async"
                  />
                  {/* Remove overlay */}
                  <button
                    onClick={() => handleRemove(photo)}
                    className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors flex items-center justify-center opacity-0 group-hover:opacity-100"
                    aria-label="Remove from favorites"
                  >
                    <X size={16} className="text-white" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer actions */}
        {favPhotos.length > 0 && (
          <div className="border-t border-border px-6 py-4 flex flex-col gap-3">
            {downloadsEnabled && (
              <Button
                onClick={handleDownloadAll}
                className="w-full justify-center"
                size="sm"
              >
                <Download size={13} />
                Download {favPhotos.length} {favPhotos.length === 1 ? 'Photo' : 'Photos'}
              </Button>
            )}
            <button
              onClick={handleClearAll}
              className="flex items-center justify-center gap-2 text-[11px] tracking-[0.1em] uppercase text-muted hover:text-red-500 transition-colors py-1"
            >
              <Trash2 size={12} />
              Clear All Favorites
            </button>
          </div>
        )}
      </div>
    </>
  )
}
