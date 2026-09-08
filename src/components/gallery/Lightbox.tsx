'use client'

import { useEffect, useCallback, useState, useRef } from 'react'
import { X, ChevronLeft, ChevronRight, Download, Heart } from 'lucide-react'
import { cn, lightboxUrl, originalUrl } from '@/lib/utils'
import { toggleFavorite, isFavorite } from '@/lib/store'
import type { Photo } from '@/types'

interface LightboxProps {
  photos: Photo[]
  currentIndex: number
  downloadsEnabled: boolean
  galleryId: string
  open: boolean
  onClose: () => void
  onNavigate: (index: number) => void
}

const SWIPE_THRESHOLD = 50

export default function Lightbox({
  photos,
  currentIndex,
  downloadsEnabled,
  galleryId,
  open,
  onClose,
  onNavigate,
}: LightboxProps) {
  const photo   = photos[currentIndex]
  const hasPrev = currentIndex > 0
  const hasNext = currentIndex < photos.length - 1

  const [favoured,  setFavoured]  = useState(false)
  const [heartAnim, setHeartAnim] = useState(false)
  const [imgLoaded, setImgLoaded] = useState(false)

  const touchStartX = useRef<number | null>(null)
  const touchStartY = useRef<number | null>(null)

  useEffect(() => {
    if (!photo) return
    setFavoured(isFavorite(photo.id))
    setImgLoaded(false)
  }, [photo?.id])

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (!open) return
      if (e.key === 'Escape')                  onClose()
      if (e.key === 'ArrowLeft'  && hasPrev)   onNavigate(currentIndex - 1)
      if (e.key === 'ArrowRight' && hasNext)   onNavigate(currentIndex + 1)
    },
    [open, onClose, onNavigate, currentIndex, hasPrev, hasNext],
  )

  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown)
    if (open) document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', handleKeyDown)
      document.body.style.overflow = ''
    }
  }, [handleKeyDown, open])

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX
    touchStartY.current = e.touches[0].clientY
  }

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStartX.current === null || touchStartY.current === null) return
    const dx = e.changedTouches[0].clientX - touchStartX.current
    const dy = e.changedTouches[0].clientY - touchStartY.current
    touchStartX.current = null
    touchStartY.current = null
    if (Math.abs(dx) < SWIPE_THRESHOLD || Math.abs(dx) < Math.abs(dy)) return
    if (dx < 0 && hasNext) onNavigate(currentIndex + 1)
    if (dx > 0 && hasPrev) onNavigate(currentIndex - 1)
  }

  const handleToggleFav = () => {
    if (!photo) return
    const added = toggleFavorite(photo.id, galleryId)
    setFavoured(added)
    setHeartAnim(true)
    setTimeout(() => setHeartAnim(false), 400)
  }

  const handleDownload = async () => {
    if (!photo) return
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

  if (!open || !photo) return null

  const displaySrc = lightboxUrl(photo)

  return (
    <div
      className="fixed inset-0 z-[100] bg-black flex flex-col"
      role="dialog"
      aria-modal="true"
      aria-label="Photo viewer"
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      {/* â”€â”€ Top bar â€” compact â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */}
      <div className="absolute top-0 left-0 right-0 z-20 flex items-center justify-between px-4 py-3">
        <span className="text-[11px] tracking-[0.2em] text-white/35 tabular-nums font-[family-name:var(--font-inter)]">
          {currentIndex + 1} / {photos.length}
        </span>

        <div className="flex items-center">
          <button
            onClick={handleToggleFav}
            className={cn(
              'p-2.5 transition-all duration-200',
              heartAnim && 'scale-125',
            )}
            aria-label={favoured ? 'Remove from favorites' : 'Add to favorites'}
          >
            <Heart
              size={18}
              className={cn(
                'transition-colors duration-200',
                favoured ? 'fill-white text-white' : 'text-white/40 hover:text-white',
              )}
            />
          </button>

          {downloadsEnabled && (
            <button
              onClick={handleDownload}
              className="p-2.5 text-white/40 hover:text-white transition-colors"
              aria-label="Download photo"
            >
              <Download size={18} />
            </button>
          )}

          <button
            onClick={onClose}
            className="p-2.5 text-white/40 hover:text-white transition-colors ml-1"
            aria-label="Close"
          >
            <X size={20} />
          </button>
        </div>
      </div>

      {/* â”€â”€ Image â€” fills remaining space â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */}
      <div className="absolute inset-0 flex items-center justify-center relative overflow-hidden select-none">
        {/* Prev â€” larger touch target, shown only when available */}
        {hasPrev && (
          <button
            onClick={() => onNavigate(currentIndex - 1)}
            className="absolute left-0 top-0 h-full w-14 sm:w-16 flex items-center justify-start pl-2 sm:pl-3 text-white/25 hover:text-white/80 transition-colors z-10"
            aria-label="Previous photo"
          >
            <ChevronLeft size={28} strokeWidth={1.5} />
          </button>
        )}

        {/* Photo */}
        <div
          className="absolute inset-0 flex items-center justify-center px-1 sm:px-8"
          onDoubleClick={handleToggleFav}
        >
          {!imgLoaded && (
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div className="w-7 h-7 border border-white/20 border-t-white/50 rounded-full animate-spin" />
            </div>
          )}
          <img
            key={photo.id}
            src={displaySrc}
            alt={photo.caption || `Photo ${currentIndex + 1}`}
            draggable={false}
            onLoad={() => setImgLoaded(true)}
            className={cn(
              'w-full h-full object-contain transition-opacity duration-150',
              imgLoaded ? 'opacity-100' : 'opacity-0',
            )}
            style={{ maxHeight: '100vh' }}
          />
        </div>

        {/* Next */}
        {hasNext && (
          <button
            onClick={() => onNavigate(currentIndex + 1)}
            className="absolute right-0 top-0 h-full w-14 sm:w-16 flex items-center justify-end pr-2 sm:pr-3 text-white/25 hover:text-white/80 transition-colors z-10"
            aria-label="Next photo"
          >
            <ChevronRight size={28} strokeWidth={1.5} />
          </button>
        )}
      </div>

      {/* â”€â”€ Caption â€” only if present â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */}
      {photo.caption && (
        <div className="flex-shrink-0 px-6 pb-4 pt-1 flex items-center justify-center">
          <p className="text-[11px] text-white/30 tracking-wider text-center">
            {photo.caption}
          </p>
        </div>
      )}
    </div>
  )
}
