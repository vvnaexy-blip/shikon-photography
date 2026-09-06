'use client'

import { Info } from 'lucide-react'
import AdminShell from '@/components/admin/AdminShell'

export default function AdminSettingsPage() {
  return (
    <AdminShell>
      <div className="px-6 sm:px-8 py-8 max-w-2xl">
        <div className="mb-10">
          <p className="text-[10px] tracking-[0.2em] uppercase text-muted mb-1">Admin</p>
          <h1 className="font-[family-name:var(--font-cormorant)] text-3xl font-light">Settings</h1>
        </div>

        {/* Photographer info */}
        <section className="mb-10">
          <p className="text-[10px] tracking-[0.2em] uppercase text-muted border-b border-border-light pb-2 mb-5">
            Photographer Info
          </p>
          <div className="grid gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] tracking-[0.15em] uppercase text-muted">Studio Name</label>
              <input readOnly defaultValue="SHIKO PHOTOGRAPHY" className="w-full bg-warm-100 border border-border px-4 py-3 text-sm text-foreground" />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] tracking-[0.15em] uppercase text-muted">Location</label>
              <input readOnly defaultValue="Sharm El Sheikh, Egypt" className="w-full bg-warm-100 border border-border px-4 py-3 text-sm text-foreground" />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] tracking-[0.15em] uppercase text-muted">WhatsApp</label>
              <input readOnly defaultValue="01050052508" className="w-full bg-warm-100 border border-border px-4 py-3 text-sm text-foreground" />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] tracking-[0.15em] uppercase text-muted">Instagram</label>
              <input readOnly defaultValue="@shik0_photography_" className="w-full bg-warm-100 border border-border px-4 py-3 text-sm text-foreground" />
            </div>
          </div>
        </section>

        {/* Storage */}
        <section className="mb-10">
          <p className="text-[10px] tracking-[0.2em] uppercase text-muted border-b border-border-light pb-2 mb-5">
            Storage
          </p>
          <div className="flex gap-3 p-4 bg-warm-100 border border-border-light">
            <Info size={14} className="text-muted flex-shrink-0 mt-0.5" />
            <div className="text-xs text-muted leading-relaxed">
              <p className="font-medium text-foreground mb-1">Supabase Storage</p>
              <p>Photos are uploaded to the <code className="bg-warm-200 px-1 py-0.5 text-[11px]">gallery-photos</code> bucket in Supabase Storage.</p>
              <p className="mt-2">Image URLs are public and permanent. Thumbnails are generated on-the-fly using Supabase Image Transform.</p>
            </div>
          </div>
        </section>

        {/* Authentication */}
        <section className="mb-10">
          <p className="text-[10px] tracking-[0.2em] uppercase text-muted border-b border-border-light pb-2 mb-5">
            Authentication
          </p>
          <div className="flex gap-3 p-4 bg-warm-100 border border-border-light">
            <Info size={14} className="text-muted flex-shrink-0 mt-0.5" />
            <div className="text-xs text-muted leading-relaxed">
              <p className="font-medium text-foreground mb-1">Supabase Auth</p>
              <p>Admin login uses Supabase Authentication (email + password).</p>
              <p className="mt-2">To change your password, go to the <strong>Supabase Dashboard → Authentication → Users</strong> and update your user account.</p>
            </div>
          </div>
        </section>
      </div>
    </AdminShell>
  )
}
