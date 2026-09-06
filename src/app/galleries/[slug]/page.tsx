'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

/** Redirect old /galleries/[slug] links to new /gallery/[slug] */
export default function OldGalleryRedirect({ params }: PageProps<'/galleries/[slug]'>) {
  const router = useRouter()

  useEffect(() => {
    params.then(({ slug }) => {
      router.replace(`/gallery/${slug}`)
    })
  }, [params, router])

  return (
    <div className="min-h-screen flex items-center justify-center bg-warm-50">
      <div className="w-6 h-6 border border-muted border-t-foreground rounded-full animate-spin" />
    </div>
  )
}
