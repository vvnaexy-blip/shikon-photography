'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { PlusCircle, Pencil, Trash2, Lock, Camera, Eye, Copy, Check } from 'lucide-react'
import AdminShell from '@/components/admin/AdminShell'
import Button from '@/components/ui/Button'
import { getGalleries, deleteGallery } from '@/lib/db/galleries'
import { CATEGORY_LABELS, formatDate, getCoverPhoto, gridThumbUrl } from '@/lib/utils'
import type { Gallery } from '@/types'

export default function AdminGalleriesPage() {
  const [galleries, setGalleries] = useState<Gallery[]>([])
  const [loading,   setLoading]   = useState(true)
  const [copied,    setCopied]    = useState<string | null>(null)

  const load = () => {
    setLoading(true)
    getGalleries()
      .then(setGalleries)
      .catch(() => setGalleries([]))
      .finally(() => setLoading(false))
  }

  useEffect(() => { load() }, [])

  const handleDelete = async (id: string, title: string) => {
    if (!confirm(`Delete "${title}"? This cannot be undone.`)) return
    await deleteGallery(id)
    load()
  }

  const handleCopyLink = (slug: string) => {
    const url = `${window.location.origin}/gallery/${slug}`
    navigator.clipboard.writeText(url).catch(() => {})
    setCopied(slug)
    setTimeout(() => setCopied(null), 1800)
  }

  return (
    <AdminShell>
      <div className="px-5 sm:px-8 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8 gap-4">
          <div>
            <p className="text-[10px] tracking-[0.2em] uppercase text-muted mb-1">Admin</p>
            <h1 className="font-[family-name:var(--font-cormorant)] text-3xl font-light">Galleries</h1>
            {!loading && (
              <p className="text-xs text-muted mt-1">
                {galleries.length} {galleries.length === 1 ? 'gallery' : 'galleries'}
              </p>
            )}
          </div>
          <Link href="/admin/galleries/new">
            <Button size="sm"><PlusCircle size={13} />New Gallery</Button>
          </Link>
        </div>

        {/* Loading */}
        {loading && (
          <div className="flex items-center justify-center py-20">
            <div className="w-6 h-6 border border-muted border-t-foreground rounded-full animate-spin" />
          </div>
        )}

        {/* Empty state */}
        {!loading && galleries.length === 0 && (
          <div className="border border-border-light py-20 flex flex-col items-center text-center">
            <Camera size={36} strokeWidth={1} className="text-warm-300 mb-4" />
            <p className="font-[family-name:var(--font-cormorant)] text-xl font-light text-muted mb-2">No galleries yet</p>
            <p className="text-xs text-muted mb-6">Create your first gallery to get started.</p>
            <Link href="/admin/galleries/new">
              <Button variant="outline" size="sm"><PlusCircle size={13} />Create Gallery</Button>
            </Link>
          </div>
        )}

        {/* Gallery list */}
        {!loading && galleries.length > 0 && (
          <div className="border border-border divide-y divide-border-light">
            {galleries.map((g) => {
              const cover = getCoverPhoto(g)
              return (
                <div key={g.id} className="flex items-center gap-4 px-4 sm:px-5 py-3.5 hover:bg-warm-100/40 transition-colors">
                  {/* Thumbnail */}
                  <div className="w-12 h-12 flex-shrink-0 bg-warm-100 overflow-hidden">
                    {cover ? (
                      <img src={gridThumbUrl(cover)} alt={g.title} width={48} height={48} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <Camera size={16} strokeWidth={1} className="text-warm-300" />
                      </div>
                    )}
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5 mb-0.5">
                      <p className="font-medium text-sm truncate">{g.title}</p>
                      {g.isPrivate && <Lock size={10} className="text-muted flex-shrink-0" />}
                    </div>
                    <p className="text-xs text-muted truncate">
                      {CATEGORY_LABELS[g.category]} · {g.location} · {formatDate(g.date)}
                    </p>
                    <p className="text-[10px] text-warm-400 mt-0.5">
                      {g.photos.length} photos{!g.downloadsEnabled && ' · Downloads off'}
                    </p>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-0.5 flex-shrink-0">
                    <button onClick={() => handleCopyLink(g.slug)} className="p-2 text-muted hover:text-foreground transition-colors" aria-label="Copy link" title="Copy gallery link">
                      {copied === g.slug ? <Check size={14} className="text-foreground" /> : <Copy size={14} />}
                    </button>
                    <Link href={`/gallery/${g.slug}`} target="_blank" className="p-2 text-muted hover:text-foreground transition-colors" aria-label="View gallery"><Eye size={14} /></Link>
                    <Link href={`/admin/galleries/${g.id}`} className="p-2 text-muted hover:text-foreground transition-colors" aria-label="Edit gallery"><Pencil size={14} /></Link>
                    <button onClick={() => handleDelete(g.id, g.title)} className="p-2 text-muted hover:text-red-500 transition-colors cursor-pointer" aria-label="Delete gallery"><Trash2 size={14} /></button>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </AdminShell>
  )
}
