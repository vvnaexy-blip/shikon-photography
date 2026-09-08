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
  const href     = `/gallery/${gallery.slug}`
  const coverSrc = cover?.imageUrl || cover?.url || null

  return (
    <Link
      href={href}
      className="group block"
      aria-label={`View gallery: ${gallery.title}`}
    >
      {/* Cover — natural aspect ratio, no forced crop */}
      <div className="w-full overflow-hidden bg-warm-100 relative">
        {coverSrc ? (
          <img
            src={coverSrc}
            alt={gallery.title}
            loading="lazy"
            decoding="async"
            className="w-full aspect-[3/2] object-cover block transition-transform duration-500 group-hover:scale-[1.02]"
          />
        ) : (
          <div className="w-full aspect-[4/3] flex items-center justify-center bg-warm-200">
            <Camera size={24} strokeWidth={1} className="text-warm-400" />
          </div>
        )}

        {isDemo && (
          <div className="absolute top-2 left-2 bg-warm-50/80 backdrop-blur-sm px-2 py-[3px]">
            <span className="text-[7px] tracking-[0.15em] uppercase text-muted">Preview</span>
          </div>
        )}
      </div>

      {/* Meta — centered */}
      <div className="text-center mt-3 space-y-[3px]">
        <p className="text-[9px] tracking-[0.22em] uppercase text-muted/60">
          {CATEGORY_LABELS[gallery.category]}
        </p>
        <h3 className="font-[family-name:var(--font-cormorant)] text-[18px] sm:text-[20px] font-light leading-snug text-foreground group-hover:text-warm-600 transition-colors">
          {gallery.title}
        </h3>
        <p className="font-[family-name:var(--font-cormorant)] text-[13px] font-light italic text-muted">
          {gallery.clientName}
        </p>
        <p className="text-[11px] text-warm-400 tracking-wide pt-[2px]">
          {gallery.location}&ensp;·&ensp;{formatDateShort(gallery.date)}
        </p>
      </div>
    </Link>
  )
}
