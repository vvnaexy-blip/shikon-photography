'use client'

import { useEffect, useState, useMemo } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { ChevronDown } from 'lucide-react'
import Footer from '@/components/layout/Footer'
import { getGalleries } from '@/lib/db/galleries'
import { DEMO_GALLERIES } from '@/lib/demo'
import { CATEGORY_LABELS } from '@/lib/utils'
import { formatDateShort } from '@/lib/utils'
import type { Gallery, GalleryCategory } from '@/types'

// WhatsApp link with pre-filled booking message
const WA_HREF = 'https://wa.me/201050052508?text=Hello%21%20I%20would%20like%20to%20book%20a%20photography%20session%20in%20Sharm%20El%20Sheikh%20%F0%9F%93%B8'

// ─── Minimal GalleryItem (used only on homepage) ─────────────────────────────

function GalleryItem({ gallery }: { gallery: Gallery }) {
  const cover = gallery.photos.find((p) => p.id === (gallery.coverImage || gallery.coverPhotoId))
    ?? gallery.photos[0]
  const coverSrc = cover?.imageUrl || cover?.url || null

  return (
    <Link
      href={`/gallery/${gallery.slug}`}
      className="block group"
      aria-label={`Open gallery: ${gallery.title}`}
    >
      {/* Cover — natural aspect ratio, no forced crop */}
      <div className="w-full overflow-hidden bg-warm-100">
        {coverSrc ? (
          <img
            src={coverSrc}
            alt={gallery.title}
            loading="lazy"
            decoding="async"
            className="w-full h-auto block transition-transform duration-500 group-hover:scale-[1.02]"
          />
        ) : (
          // No cover yet — height placeholder
          <div className="w-full aspect-[4/3] bg-warm-200 flex items-center justify-center">
            <span className="text-[10px] tracking-[0.15em] uppercase text-warm-400">No cover</span>
          </div>
        )}
      </div>

      {/* Meta — centered */}
      <div className="text-center mt-3 mb-1">
        <p className="font-[family-name:var(--font-cormorant)] text-[18px] sm:text-[20px] font-light leading-snug text-foreground group-hover:text-warm-600 transition-colors">
          {gallery.title}
        </p>
        <p className="text-[11px] text-warm-400 mt-1 tracking-wide">
          {formatDateShort(gallery.date)}
        </p>
      </div>
    </Link>
  )
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function HomePage() {
  const [realGalleries,  setRealGalleries]  = useState<Gallery[]>([])
  const [loading,        setLoading]        = useState(true)
  const [activeCategory, setActive]         = useState<GalleryCategory | 'all'>('all')
  const [dropOpen,       setDropOpen]       = useState(false)

  useEffect(() => {
    getGalleries()
      .then((d) => setRealGalleries(d))
      .catch(() => setRealGalleries([]))
      .finally(() => setLoading(false))
  }, [])

  const galleries = realGalleries.length > 0 ? realGalleries : DEMO_GALLERIES

  // Only show categories that have at least one gallery
  const populatedCategories = useMemo((): GalleryCategory[] => {
    const seen = new Set<GalleryCategory>()
    galleries.forEach((g) => seen.add(g.category))
    const ORDER: GalleryCategory[] = [
      'wedding', 'portrait', 'family', 'newborn', 'event', 'commercial', 'landscape', 'other',
    ]
    return ORDER.filter((c) => seen.has(c))
  }, [galleries])

  const filtered = useMemo(
    () => activeCategory === 'all' ? galleries : galleries.filter((g) => g.category === activeCategory),
    [galleries, activeCategory],
  )

  const activeCategoryLabel = activeCategory === 'all' ? 'All Galleries' : CATEGORY_LABELS[activeCategory]

  return (
    <>
      {/* ── No sticky Navbar — minimal identity header only ── */}
      <main className="min-h-screen bg-warm-50">

        {/* ════════════════════════════════════════════════
            Photographer Identity — top of every page
        ════════════════════════════════════════════════ */}
        <header className="pt-10 pb-6 px-8 sm:px-12 flex flex-col items-center text-center border-b border-border-light">
          {/* Logo */}
          <Link href="/" aria-label="SHIKO Photography">
            <Image
              src="/logo.png"
              alt="SHIKO Photography"
              width={140}
              height={56}
              className="h-12 w-auto object-contain mb-4"
              priority
            />
          </Link>

          {/* Contact row */}
          <div className="flex flex-col items-center gap-2 mt-1">
            {/* Phone / WhatsApp — tappable */}
            <a
              href={WA_HREF}
              target="_blank"
              rel="noopener noreferrer"
              className="text-[13px] text-muted hover:text-foreground transition-colors tracking-wide"
            >
              +201050052508
            </a>

            {/* Instagram */}
            <a
              href="https://instagram.com/shik0_photography_"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 text-[13px] text-muted hover:text-foreground transition-colors tracking-wide"
            >
              {/* Instagram icon */}
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
                <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
                <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
              </svg>
              @shik0_photography_
            </a>
          </div>

          {/* Thin separator */}
          <div className="w-12 h-px bg-border mt-5" />
        </header>

        {/* ════════════════════════════════════════════════
            Category Dropdown
        ════════════════════════════════════════════════ */}
        <div className="px-8 sm:px-12 py-5 flex justify-center">
          <div className="relative w-full max-w-xs sm:max-w-sm">
            <button
              onClick={() => setDropOpen((v) => !v)}
              className="w-full flex items-center justify-between gap-3 border border-border bg-warm-50 px-5 py-3.5 text-[12px] tracking-[0.15em] uppercase text-foreground hover:bg-warm-100 transition-colors"
              aria-haspopup="listbox"
              aria-expanded={dropOpen}
            >
              <span>{activeCategoryLabel}</span>
              <ChevronDown
                size={14}
                className={`transition-transform duration-200 ${dropOpen ? 'rotate-180' : ''}`}
              />
            </button>

            {dropOpen && (
              <div
                className="absolute top-full left-0 right-0 z-30 bg-warm-50 border border-border border-t-0 shadow-sm"
                role="listbox"
              >
                {/* All */}
                <button
                  role="option"
                  aria-selected={activeCategory === 'all'}
                  onClick={() => { setActive('all'); setDropOpen(false) }}
                  className={[
                    'w-full text-left px-5 py-3 text-[12px] tracking-[0.12em] uppercase transition-colors',
                    activeCategory === 'all'
                      ? 'text-foreground bg-warm-100'
                      : 'text-muted hover:text-foreground hover:bg-warm-100',
                  ].join(' ')}
                >
                  All Galleries
                </button>

                {populatedCategories.map((cat) => (
                  <button
                    key={cat}
                    role="option"
                    aria-selected={activeCategory === cat}
                    onClick={() => { setActive(cat); setDropOpen(false) }}
                    className={[
                      'w-full text-left px-5 py-3 text-[12px] tracking-[0.12em] uppercase transition-colors border-t border-border-light',
                      activeCategory === cat
                        ? 'text-foreground bg-warm-100'
                        : 'text-muted hover:text-foreground hover:bg-warm-100',
                    ].join(' ')}
                  >
                    {CATEGORY_LABELS[cat]}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Close dropdown on outside click */}
        {dropOpen && (
          <div
            className="fixed inset-0 z-20"
            onClick={() => setDropOpen(false)}
            aria-hidden="true"
          />
        )}

        {/* ════════════════════════════════════════════════
            Gallery Archive
            Mobile:  1 column, natural aspect ratio
            Desktop: 2-3 columns
        ════════════════════════════════════════════════ */}
        <section className="px-8 sm:px-12 pb-16">

          {/* Loading */}
          {loading && (
            <div className="flex items-center justify-center py-20">
              <div className="w-5 h-5 border border-muted border-t-foreground rounded-full animate-spin" />
            </div>
          )}

          {/* Empty */}
          {!loading && filtered.length === 0 && (
            <div className="text-center py-20">
              <p className="font-[family-name:var(--font-cormorant)] text-xl font-light text-warm-500">
                No galleries in this category yet.
              </p>
            </div>
          )}

          {/* Galleries */}
          {!loading && filtered.length > 0 && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-6 sm:gap-x-8 gap-y-8 sm:gap-y-12">
              {filtered.map((gallery) => (
                <GalleryItem key={gallery.id} gallery={gallery} />
              ))}
            </div>
          )}
        </section>
      </main>

      <Footer />
    </>
  )
}
