'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { PlusCircle, Images, Lock, Globe, ArrowRight } from 'lucide-react'
import AdminShell from '@/components/admin/AdminShell'
import { getStats, getGalleries } from '@/lib/db/galleries'
import { CATEGORY_LABELS, formatDate, getCoverPhoto, gridThumbUrl } from '@/lib/utils'
import type { GalleryStats } from '@/lib/store'
import type { Gallery } from '@/types'

function StatCard({ label, value, icon }: { label: string; value: number; icon: React.ReactNode }) {
  return (
    <div className="border border-border p-6 flex flex-col gap-3">
      <div className="text-muted">{icon}</div>
      <div>
        <p className="font-[family-name:var(--font-cormorant)] text-4xl font-light tabular-nums">{value}</p>
        <p className="text-[10px] tracking-[0.15em] uppercase text-muted mt-1">{label}</p>
      </div>
    </div>
  )
}

export default function AdminDashboardPage() {
  const [stats,  setStats]  = useState<GalleryStats>({ totalGalleries: 0, totalPhotos: 0, privateGalleries: 0, publicGalleries: 0 })
  const [recent, setRecent] = useState<Gallery[]>([])

  useEffect(() => {
    getStats().then(setStats).catch(() => {})
    getGalleries().then((gs) => setRecent(gs.slice(0, 5))).catch(() => {})
  }, [])

  return (
    <AdminShell>
      <div className="px-6 sm:px-8 py-8 max-w-4xl">
        <div className="mb-10">
          <p className="text-[10px] tracking-[0.2em] uppercase text-muted mb-1">Overview</p>
          <h1 className="font-[family-name:var(--font-cormorant)] text-3xl font-light">Dashboard</h1>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-12">
          <StatCard label="Total Galleries" value={stats.totalGalleries}   icon={<Images size={18} strokeWidth={1.5} />} />
          <StatCard label="Total Photos"    value={stats.totalPhotos}      icon={<Images size={18} strokeWidth={1.5} />} />
          <StatCard label="Private"         value={stats.privateGalleries} icon={<Lock   size={18} strokeWidth={1.5} />} />
          <StatCard label="Public"          value={stats.publicGalleries}  icon={<Globe  size={18} strokeWidth={1.5} />} />
        </div>

        {/* Quick actions */}
        <div className="mb-12">
          <p className="text-[10px] tracking-[0.2em] uppercase text-muted mb-4">Quick Actions</p>
          <div className="flex flex-wrap gap-3">
            <Link href="/admin/galleries/new" className="inline-flex items-center gap-2 text-[11px] tracking-[0.1em] uppercase bg-foreground text-warm-50 px-5 py-3 hover:bg-warm-800 transition-colors">
              <PlusCircle size={13} />New Gallery
            </Link>
            <Link href="/admin/galleries" className="inline-flex items-center gap-2 text-[11px] tracking-[0.1em] uppercase border border-foreground px-5 py-3 hover:bg-foreground hover:text-warm-50 transition-colors">
              <Images size={13} />All Galleries
            </Link>
          </div>
        </div>

        {/* Recent */}
        {recent.length > 0 && (
          <div>
            <div className="flex items-center justify-between mb-5">
              <p className="text-[10px] tracking-[0.2em] uppercase text-muted">Recent Galleries</p>
              <Link href="/admin/galleries" className="text-[10px] tracking-[0.1em] uppercase text-muted hover:text-foreground transition-colors flex items-center gap-1">
                View all <ArrowRight size={11} />
              </Link>
            </div>
            <div className="border border-border divide-y divide-border-light">
              {recent.map((g) => {
                const cover = getCoverPhoto(g)
                return (
                  <Link key={g.id} href={`/admin/galleries/${g.id}`} className="flex items-center gap-4 px-5 py-3.5 hover:bg-warm-100/50 transition-colors group">
                    <div className="w-12 h-12 flex-shrink-0 bg-warm-100 overflow-hidden">
                      {cover ? <img src={gridThumbUrl(cover)} alt={g.title} width={48} height={48} className="w-full h-full object-cover" /> : <div className="w-full h-full" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate group-hover:text-muted transition-colors">{g.title}</p>
                      <p className="text-xs text-muted truncate">
                        {CATEGORY_LABELS[g.category as keyof typeof CATEGORY_LABELS]} · {formatDate(g.date)}
                      </p>
                    </div>
                    <div className="text-[10px] text-warm-400 flex-shrink-0">{g.photos.length} photos</div>
                  </Link>
                )
              })}
            </div>
          </div>
        )}
      </div>
    </AdminShell>
  )
}
