import Link from 'next/link'
import { Camera } from 'lucide-react'
import type { Gallery } from '@/types'
import { CATEGORY_LABELS, formatDateShort, getCoverPhoto } from '@/lib/utils'
import { isDemoGallery } from '@/lib/demo'

interface GalleryCardProps {
  gallery: Gallery
}

export default function GalleryCard({ gallery }: GalleryCardProps) {
  const cover    = getCoverPhoto(gallery)
  const isDemo   = isDemoGallery(gallery.id)

  // Both real and demo galleries use /gallery/[slug].
  // Demo slugs start with "demo-" — the gallery page handles them (or shows not-found gracefully).
  const href = `/gallery/${gallery.slug}`

  // For real Supabase photos: imageUrl is a Supabase Storage public URL.
  // For demo photos: imageUrl is a /demo/<folder>/cover.jpg path.
  // addTransform in utils.ts is a no-op for non-Supabase URLs, so this is safe.
  const coverSrc = cover?.imageUrl || cover?.url || null

  return (
    <Link
      href={href}
      className="group block"
      aria-label={`View gallery: ${gallery.title}`}
    >
      {/* ── Cover image ────────────────────────────────────────────────── */}
      <div
        className="relative overflow-hidden bg-warm-200 mb-4"
        style={{ aspectRatio: '4 / 3' }}
      >
        {coverSrc ? (
          <img
            src={coverSrc}
            alt={gallery.title}
            loading="lazy"
            decoding="async"
            className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 ease-out will-change-transform group-hover:scale-[1.03]"
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center">
            <Camera size={28} strokeWidth={1} className="text-warm-400" />
          </div>
        )}

        {/* Barely-there bottom gradient — prevents metadata from bleeding into photo */}
        {coverSrc && (
          <div className="absolute inset-x-0 bottom-0 h-12 bg-gradient-to-t from-black/8 to-transparent pointer-events-none" />
        )}

        {/* Demo badge — minimal, top-left */}
        {isDemo && (
          <div className="absolute top-2.5 left-2.5 bg-warm-50/80 backdrop-blur-sm px-2 py-[3px]">
            <span className="text-[7px] tracking-[0.18em] uppercase text-muted">Preview</span>
          </div>
        )}
      </div>

      {/* ── Metadata ─────────────────────────────────────────────────────── */}
      <div className="space-y-[3px]">
        {/* Category — smallest, uppercase, most muted */}
        <p className="text-[9px] tracking-[0.25em] uppercase text-muted/70">
          {CATEGORY_LABELS[gallery.category]}
        </p>

        {/* Title — primary, editorial */}
        <h3 className="font-[family-name:var(--font-cormorant)] text-[21px] sm:text-[23px] font-light leading-snug text-foreground group-hover:text-warm-700 transition-colors duration-200">
          {gallery.title}
        </h3>

        {/* Client name — italic, secondary */}
        <p className="font-[family-name:var(--font-cormorant)] text-[14px] font-light italic text-muted leading-snug">
          {gallery.clientName}
        </p>

        {/* Location · Date — smallest, most subtle */}
        <p className="text-[10px] tracking-wide text-warm-400 pt-[2px]">
          {gallery.location}&ensp;·&ensp;{formatDateShort(gallery.date)}
        </p>
      </div>
    </Link>
  )
}
