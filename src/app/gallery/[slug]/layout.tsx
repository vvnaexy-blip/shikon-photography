/**
 * Server-side layout for /gallery/[slug]
 *
 * Handles generateMetadata for Open Graph / social sharing.
 * The page.tsx beneath it remains a Client Component as-is.
 *
 * This layout fetches only the gallery metadata (no photos) to keep
 * the server request fast and avoid loading large photo arrays on the server.
 */

import type { Metadata } from 'next'
import { createClient } from '@supabase/supabase-js'

// ─── Minimal server-side Supabase fetch (no auth, public data only) ──────────

interface MinimalGallery {
  id:          string
  title:       string
  client_name: string
  description: string | null
  location:    string
  date:        string
  cover_image: string | null
}

interface MinimalPhoto {
  id:        string
  image_url: string
}

async function fetchGalleryMeta(
  slug: string,
): Promise<{ gallery: MinimalGallery; coverUrl: string | null } | null> {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  if (!url || !key) return null

  try {
    const sb = createClient(url, key, { auth: { persistSession: false } })

    const { data: gallery, error } = await sb
      .from('galleries')
      .select('id, title, client_name, description, location, date, cover_image')
      .eq('slug', slug)
      .single()

    if (error || !gallery) return null

    // Resolve cover photo URL
    let coverUrl: string | null = null
    if (gallery.cover_image) {
      const { data: photo } = await (sb.from('photos') as any)
        .select('id, image_url')
        .eq('id', gallery.cover_image)
        .single()

      if (photo) {
        // Use a 1200×630 transform for OG image (standard OG size)
        const src: string = (photo as MinimalPhoto).image_url
        if (src && !src.startsWith('data:')) {
          const marker = '/storage/v1/object/public/'
          const renderBase = '/storage/v1/render/image/public/'
          if (src.includes(marker)) {
            coverUrl = `${src.replace(marker, renderBase)}?width=1200&height=630&quality=80&resize=cover`
          }
        }
      }
    }

    return { gallery: gallery as MinimalGallery, coverUrl }
  } catch {
    return null
  }
}

// ─── Dynamic metadata ─────────────────────────────────────────────────────────

export async function generateMetadata(
  { params }: { params: Promise<{ slug: string }> },
): Promise<Metadata> {
  const { slug } = await params
  const result = await fetchGalleryMeta(slug)

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://shikophotography.com'
  const galleryUrl = `${siteUrl}/gallery/${slug}`

  if (!result) {
    return {
      title:       'Gallery | SHIKO PHOTOGRAPHY',
      description: 'View your professional photography gallery.',
      openGraph: {
        title:       'Gallery | SHIKO PHOTOGRAPHY',
        description: 'Professional Photography — Sharm El Sheikh, Egypt.',
        url:         galleryUrl,
        siteName:    'SHIKO PHOTOGRAPHY',
        type:        'website',
      },
    }
  }

  const { gallery, coverUrl } = result
  const title       = `${gallery.title} | SHIKO PHOTOGRAPHY`
  const description = gallery.description
    ?? `${gallery.client_name} · ${gallery.location} · Photography by SHIKO`

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      url:      galleryUrl,
      siteName: 'SHIKO PHOTOGRAPHY',
      type:     'website',
      locale:   'en_US',
      ...(coverUrl
        ? {
            images: [
              {
                url:    coverUrl,
                width:  1200,
                height: 630,
                alt:    gallery.title,
              },
            ],
          }
        : {}),
    },
    twitter: {
      card:        coverUrl ? 'summary_large_image' : 'summary',
      title,
      description,
      ...(coverUrl ? { images: [coverUrl] } : {}),
    },
  }
}

// ─── Layout component ─────────────────────────────────────────────────────────

export default function GallerySlugLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <>{children}</>
}
