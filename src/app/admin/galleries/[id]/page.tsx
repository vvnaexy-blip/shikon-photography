'use client'

import { useEffect, useState } from 'react'
import { notFound } from 'next/navigation'
import AdminShell from '@/components/admin/AdminShell'
import GalleryForm from '@/components/admin/GalleryForm'
import { getGallery } from '@/lib/db/galleries'
import type { Gallery } from '@/types'

export default function EditGalleryPage({ params }: PageProps<'/admin/galleries/[id]'>) {
  const [gallery, setGallery] = useState<Gallery | null | undefined>(undefined)

  useEffect(() => {
    params.then(({ id }) => {
      getGallery(id)
        .then((g) => setGallery(g ?? null))
        .catch(() => setGallery(null))
    })
  }, [params])

  if (gallery === undefined) {
    return (
      <AdminShell>
        <div className="flex items-center justify-center h-64">
          <div className="w-6 h-6 border border-muted border-t-foreground rounded-full animate-spin" />
        </div>
      </AdminShell>
    )
  }

  if (gallery === null) return notFound()

  return (
    <AdminShell>
      <GalleryForm initial={gallery} />
    </AdminShell>
  )
}
