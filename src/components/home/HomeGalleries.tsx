'use client'

import { useEffect, useState } from 'react'
import GalleryCard from '@/components/gallery/GalleryCard'
import { getGalleries } from '@/lib/db/galleries'
import { DEMO_GALLERIES } from '@/lib/demo'
import type { Gallery } from '@/types'

/**
 * Dynamic gallery section for the Homepage.
 *
 * - Fetches ALL real galleries from Supabase on every page load.
 * - Newest first (getGalleries sorts by created_at desc).
 * - Falls back to demo galleries when Supabase returns zero results.
 * - No limit, no pagination, no Load More.
 * - Creating a gallery from Admin → appears here automatically.
 */
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
    <section className="py-20 px-6">
      <div className="max-w-6xl mx-auto">
        {/* Section header */}
        <div className="text-center mb-14">
          <p className="text-[10px] tracking-[0.3em] uppercase text-muted mb-3">
            Client Galleries
          </p>
          <h2 className="font-[family-name:var(--font-cormorant)] text-4xl sm:text-5xl font-light">
            Recent Work
          </h2>
        </div>

        {/* Loading */}
        {loading && (
          <div className="flex items-center justify-center py-20">
            <div className="w-5 h-5 border border-muted border-t-foreground rounded-full animate-spin" />
          </div>
        )}

        {/* All galleries — newest first, no limit */}
        {!loading && galleries.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-14">
            {galleries.map((gallery) => (
              <GalleryCard key={gallery.id} gallery={gallery} />
            ))}
          </div>
        )}
      </div>
    </section>
  )
}
