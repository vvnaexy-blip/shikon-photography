'use client'

import { useEffect, useState, useCallback } from 'react'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Download, MapPin, Calendar, Heart, Layers } from 'lucide-react'
import Footer from '@/components/layout/Footer'
import PhotoGrid from '@/components/gallery/PhotoGrid'
import FavoritesPanel from '@/components/gallery/FavoritesPanel'
import ShareButton from '@/components/gallery/ShareButton'
import EmptyState from '@/components/ui/EmptyState'
import Button from '@/components/ui/Button'
import { ToastContainer, useToast } from '@/components/ui/Toast'
import { getGalleryBySlug } from '@/lib/db/galleries'
import { getFavorites } from '@/lib/db/favorites'
import { CATEGORY_LABELS, formatDate, originalUrl } from '@/lib/utils'
import type { Gallery } from '@/types'

export default function GalleryPage({ params }: PageProps<'/gallery/[slug]'>) {
  const [gallery,  setGallery]  = useState<Gallery | null>(null)
  const [loading,  setLoading]  = useState(true)
  const [notfound, setNotfound] = useState(false)
  const [showFavs, setShowFavs] = useState(false)
  const [favIds,   setFavIds]   = useState<Set<string>>(new Set())
  const [slug,     setSlug]     = useState<string | null>(null)
  const { toasts, show, dismiss } = useToast()

  useEffect(() => { params.then(({ slug: s }) => setSlug(s)) }, [params])

  useEffect(() => {
    if (!slug) return
    let cancelled = false
    setLoading(true)

    getGalleryBySlug(slug)
      .then((g) => {
        if (cancelled) return
        if (!g) { setNotfound(true); setLoading(false); return }
        setGallery(g)
        setLoading(false)
        const ids = new Set(getFavorites(g.id).map((f) => f.photoId))
        setFavIds(ids)
      })
      .catch((err) => {
        console.error('[gallery] load error:', err)
        if (!cancelled) { setNotfound(true); setLoading(false) }
      })

    return () => { cancelled = true }
  }, [slug])

  const handleFavoriteChange = useCallback((photoId: string, added: boolean) => {
    setFavIds((prev) => {
      const next = new Set(prev)
      added ? next.add(photoId) : next.delete(photoId)
      return next
    })
  }, [])

  const handleDownloadAll = async () => {
    if (!gallery) return
    for (const photo of gallery.photos) {
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
        await new Promise((r) => setTimeout(r, 280))
      } catch {
        window.open(url, '_blank')
      }
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-warm-50">
        <div className="w-6 h-6 border border-muted border-t-foreground rounded-full animate-spin" />
      </div>
    )
  }

  if (notfound || !gallery) return notFound()

  const favCount = favIds.size

  return (
    <>
      {/* No Navbar — gallery pages are client-facing, photo-first */}
      <main className="flex-1 bg-warm-50">

        {/* ── Minimal header ────────────────────────────────────────── */}
        <header className="max-w-5xl mx-auto px-4 sm:px-6 pt-8 pb-6">
          {/* Back link */}
          <Link
            href="/galleries"
            className="inline-flex items-center gap-1.5 text-[10px] tracking-[0.12em] uppercase text-muted hover:text-foreground transition-colors mb-6"
          >
            <ArrowLeft size={12} />
            All Galleries
          </Link>

          <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            {/* Left: identity */}
            <div className="min-w-0">
              <p className="text-[9px] tracking-[0.25em] uppercase text-muted mb-1.5">
                {CATEGORY_LABELS[gallery.category]}
              </p>
              <h1 className="font-[family-name:var(--font-cormorant)] text-3xl sm:text-4xl font-light leading-tight mb-0.5">
                {gallery.title}
              </h1>
              <p className="font-[family-name:var(--font-cormorant)] text-lg font-light italic text-muted mb-3">
                {gallery.clientName}
              </p>
              <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-[11px] text-muted">
                <span className="flex items-center gap-1">
                  <Calendar size={11} strokeWidth={1.5} />
                  {formatDate(gallery.date)}
                </span>
                <span className="flex items-center gap-1">
                  <MapPin size={11} strokeWidth={1.5} />
                  {gallery.location}
                </span>
                <span className="flex items-center gap-1">
                  <Layers size={11} strokeWidth={1.5} />
                  {gallery.photos.length} {gallery.photos.length === 1 ? 'photo' : 'photos'}
                </span>
              </div>
              {gallery.description && (
                <p className="text-xs text-muted mt-3 leading-relaxed max-w-md">
                  {gallery.description}
                </p>
              )}
            </div>

            {/* Right: desktop actions — hidden on mobile (use floating bar) */}
            <div className="hidden sm:flex items-center gap-2 flex-shrink-0">
              <button
                onClick={() => setShowFavs(true)}
                className="relative inline-flex items-center gap-1.5 text-[10px] tracking-[0.1em] uppercase text-muted hover:text-foreground transition-colors px-3 py-2 border border-border hover:border-foreground"
                aria-label="View favorites"
              >
                <Heart size={13} strokeWidth={1.5} />
                Favorites
                {favCount > 0 && (
                  <span className="absolute -top-1.5 -right-1.5 w-4 h-4 bg-foreground text-warm-50 text-[9px] flex items-center justify-center rounded-full">
                    {favCount}
                  </span>
                )}
              </button>

              <ShareButton
                title={gallery.title}
                onCopied={() => show('Link copied!')}
              />

              {gallery.downloadsEnabled && gallery.photos.length > 0 && (
                <Button variant="outline" size="sm" onClick={handleDownloadAll}>
                  <Download size={12} />
                  Download All
                </Button>
              )}
            </div>
          </div>
        </header>

        {/* ── Photo grid — edge-to-edge feel, minimal padding ───────── */}
        <section className="max-w-5xl mx-auto px-1 sm:px-2 pb-24 sm:pb-12">
          {gallery.photos.length === 0 ? (
            <EmptyState
              title="No photos yet"
              description="Photos will appear here once the photographer uploads them."
            />
          ) : (
            <PhotoGrid
              photos={gallery.photos}
              galleryId={gallery.id}
              downloadsEnabled={gallery.downloadsEnabled}
              favoritedIds={favIds}
              onFavoriteChange={handleFavoriteChange}
            />
          )}
        </section>

        {/* ── Mobile floating action bar ────────────────────────────── */}
        {gallery.photos.length > 0 && (
          <div className="sm:hidden fixed bottom-0 left-0 right-0 z-40 bg-warm-50/96 backdrop-blur-md border-t border-border-light px-6 py-3.5 flex items-center justify-around">
            <button
              onClick={() => setShowFavs(true)}
              className="relative flex flex-col items-center gap-1"
              aria-label="Favorites"
            >
              <Heart size={18} strokeWidth={1.5} className="text-foreground" />
              <span className="text-[8px] tracking-[0.12em] uppercase text-muted">Favorites</span>
              {favCount > 0 && (
                <span className="absolute -top-1 -right-1 w-3.5 h-3.5 bg-foreground text-warm-50 text-[8px] flex items-center justify-center rounded-full">
                  {favCount}
                </span>
              )}
            </button>

            <ShareButton
              title={gallery.title}
              onCopied={() => show('Copied!')}
              className="flex flex-col items-center gap-1"
            />

            {gallery.downloadsEnabled && (
              <button
                onClick={handleDownloadAll}
                className="flex flex-col items-center gap-1"
                aria-label="Download all"
              >
                <Download size={18} strokeWidth={1.5} className="text-foreground" />
                <span className="text-[8px] tracking-[0.12em] uppercase text-muted">Download</span>
              </button>
            )}
          </div>
        )}
      </main>

      {/* Favorites panel */}
      {showFavs && (
        <FavoritesPanel
          photos={gallery.photos}
          galleryId={gallery.id}
          favoriteIds={favIds}
          downloadsEnabled={gallery.downloadsEnabled}
          onClose={() => setShowFavs(false)}
          onFavoriteChange={handleFavoriteChange}
        />
      )}

      <Footer />
      <ToastContainer toasts={toasts} onDismiss={dismiss} />
    </>
  )
}
