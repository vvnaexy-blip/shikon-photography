'use client'

import { useEffect, useState } from 'react'
import GalleryCard from '@/components/gallery/GalleryCard'
import { getGalleries } from '@/lib/db/galleries'
import { DEMO_GALLERIES } from '@/lib/demo'
import type { Gallery } from '@/types'

export default function HomeGalleries() {
  const [galleries, setGalleries] = useState<Gallery[]>([])
  const [loading,   setLoading]   = useState(true)

  useEffect(() => {
    getGalleries()
      .then((data) => setGalleries(data.length > 0 ? data : DEMO_GALLERIES))
      .catch(() => setGalleries(DEMO_GALLERIES))
      .finally(() => setLoading(false))
  }, [])

  return (
    <section className="py-12 sm:py-20 px-5 sm:px-6">
      <div className="max-w-6xl mx-auto">
        {/* Section header */}
        <div className="text-center mb-8 sm:mb-14">
          <p className="text-[9px] sm:text-[10px] tracking-[0.3em] uppercase text-muted mb-2 sm:mb-3">
            Client Galleries
          </p>
          <h2 className="font-[family-name:var(--font-cormorant)] text-3xl sm:text-5xl font-light">
            Recent Work
          </h2>
        </div>

        {/* Loading */}
        {loading && (
          <div className="flex items-center justify-center py-16 sm:py-20">
            <div className="w-5 h-5 border border-muted border-t-foreground rounded-full animate-spin" />
          </div>
        )}

        {/* All galleries — newest first, no limit */}
        {!loading && galleries.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-6 sm:gap-x-8 gap-y-10 sm:gap-y-14">
            {galleries.map((gallery) => (
              <GalleryCard key={gallery.id} gallery={gallery} />
            ))}
          </div>
        )}
      </div>
    </section>
  )
}
