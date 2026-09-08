import type { MetadataRoute } from 'next'
import { getGalleries } from '@/lib/db/galleries'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = 'https://shikon-photography.vercel.app'

  const staticPages: MetadataRoute.Sitemap = [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 1,
    },
    {
      url: `${baseUrl}/galleries`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.9,
    },
  ]

  try {
    const galleries = await getGalleries()

    const galleryPages: MetadataRoute.Sitemap = galleries
      .filter((gallery) => gallery.slug)
      .map((gallery) => ({
        url: `${baseUrl}/gallery/${gallery.slug}`,
        lastModified: new Date(),
        changeFrequency: 'weekly',
        priority: 0.8,
      }))

    return [...staticPages, ...galleryPages]
  } catch {
    return staticPages
  }
}
