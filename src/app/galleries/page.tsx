'use client'

import { Suspense, useEffect, useState, useMemo } from 'react'
import { useSearchParams } from 'next/navigation'
import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'
import GalleryCard from '@/components/gallery/GalleryCard'
import { getGalleries } from '@/lib/db/galleries'
import { DEMO_GALLERIES } from '@/lib/demo'
import { CATEGORY_LABELS } from '@/lib/utils'
import type { Gallery, GalleryCategory } from '@/types'

// ─── Main content (wrapped in Suspense so useSearchParams is safe) ───────────

function GalleriesContent() {
  const searchParams = useSearchParams()

  const [realGalleries,  setRealGalleries]  = useState<Gallery[]>([])
  const [loading,        setLoading]        = useState(true)
  const [activeCategory, setActive]         = useState<GalleryCategory | 'all'>('all')

  useEffect(() => {
    // Honour ?category=wedding URL param
    const cat = searchParams.get('category') as GalleryCategory | null
    if (cat) setActive(cat)

    getGalleries()
      .then(setRealGalleries)
      .catch(() => setRealGalleries([]))
      .finally(() => setLoading(false))
  }, [searchParams])

  // Real galleries take priority; demo shown only when Supabase is empty
  const galleries: Gallery[] = realGalleries.length > 0 ? realGalleries : DEMO_GALLERIES
  const isShowingDemo        = !loading && realGalleries.length === 0

  // Build the category tab list: "All" + only categories that have ≥1 gallery.
  // This keeps the filter clean — no empty categories cluttering the nav.
  const populatedCategories = useMemo((): GalleryCategory[] => {
    const seen = new Set<GalleryCategory>()
    galleries.forEach((g) => seen.add(g.category))
    // Preserve a logical order rather than insertion order
    const ORDER: GalleryCategory[] = [
      'wedding', 'portrait', 'family', 'newborn',
      'event', 'commercial', 'landscape', 'other',
    ]
    return ORDER.filter((c) => seen.has(c))
  }, [galleries])

  // Filtered albums for the active category tab
  const filtered = useMemo(
    () => activeCategory === 'all'
      ? galleries
      : galleries.filter((g) => g.category === activeCategory),
    [galleries, activeCategory],
  )

  return (
    <>
      {/* ── Category filter nav ─────────────────────────────────────────── */}
      {/*
        sticky top-16 keeps this below the fixed Navbar (h-16).
        Scrolls horizontally on mobile — no line wrapping.
      */}
      <nav
        aria-label="Filter galleries by category"
        className="sticky top-16 z-10 bg-warm-50/94 backdrop-blur-sm border-b border-border-light"
      >
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div
            className="flex overflow-x-auto"
            style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
          >
            {/* "All" tab */}
            <button
              onClick={() => setActive('all')}
              className={[
                'flex-shrink-0 px-4 sm:px-5 py-3.5 text-[9px] tracking-[0.22em] uppercase',
                'border-b transition-colors duration-150 whitespace-nowrap',
                activeCategory === 'all'
                  ? 'border-foreground text-foreground'
                  : 'border-transparent text-muted hover:text-foreground',
              ].join(' ')}
            >
              All
            </button>

            {/* One tab per populated category */}
            {populatedCategories.map((cat) => (
              <button
                key={cat}
                onClick={() => setActive(cat)}
                className={[
                  'flex-shrink-0 px-4 sm:px-5 py-3.5 text-[9px] tracking-[0.22em] uppercase',
                  'border-b transition-colors duration-150 whitespace-nowrap',
                  activeCategory === cat
                    ? 'border-foreground text-foreground'
                    : 'border-transparent text-muted hover:text-foreground',
                ].join(' ')}
              >
                {CATEGORY_LABELS[cat]}
              </button>
            ))}
          </div>
        </div>
      </nav>

      {/* ── Albums grid ──────────────────────────────────────────────────── */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 pt-10 pb-20">

        {/* Preview notice — only when showing demo data */}
        {isShowingDemo && !loading && (
          <p className="text-center text-[9px] tracking-[0.2em] uppercase text-warm-400 mb-10">
            Preview — upload your own galleries from the admin to replace this demo
          </p>
        )}

        {/* Loading */}
        {loading && (
          <div className="flex items-center justify-center py-32">
            <div className="w-5 h-5 border border-muted border-t-foreground rounded-full animate-spin" />
          </div>
        )}

        {/* Empty category */}
        {!loading && filtered.length === 0 && (
          <div className="text-center py-28">
            <p className="font-[family-name:var(--font-cormorant)] text-2xl font-light text-warm-500 mb-2">
              No galleries in this category yet.
            </p>
          </div>
        )}

        {/* Albums — all rendered at once, no pagination, no Load More */}
        {!loading && filtered.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-14 sm:gap-y-16">
            {filtered.map((gallery) => (
              <GalleryCard key={gallery.id} gallery={gallery} />
            ))}
          </div>
        )}
      </section>
    </>
  )
}

// ─── Page shell ───────────────────────────────────────────────────────────────

export default function GalleriesPage() {
  return (
    <>
      <Navbar />
      {/* pt-16 offsets the fixed Navbar */}
      <main className="flex-1 pt-16">
        <Suspense
          fallback={
            <div className="flex items-center justify-center py-32">
              <div className="w-5 h-5 border border-muted border-t-foreground rounded-full animate-spin" />
            </div>
          }
        >
          <GalleriesContent />
        </Suspense>
      </main>
      <Footer />
    </>
  )
}
