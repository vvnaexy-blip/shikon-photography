'use client'

import {
  useState,
  useRef,
  useCallback,
  ChangeEvent,
  DragEvent,
} from 'react'
import { useRouter } from 'next/navigation'
import {
  Upload,
  X,
  Star,
  Download,
  ArrowLeft,
  Check,
  Trash2,
  GripVertical,
  AlertCircle,
  ExternalLink,
  Copy,
} from 'lucide-react'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'
import Select from '@/components/ui/Select'
import Textarea from '@/components/ui/Textarea'
import { generateId, slugify } from '@/lib/store'
import { createGallery, updateGallery } from '@/lib/db/galleries'
import { uploadPhoto, deleteStoredPhoto } from '@/lib/storage'
import { isSupabaseConfigured } from '@/lib/supabase'
import { CATEGORIES, CATEGORY_LABELS, gridThumbUrl } from '@/lib/utils'
import type { Gallery, Photo, GalleryCategory } from '@/types'

interface GalleryFormProps {
  initial?: Gallery
}

const CATEGORY_OPTIONS = CATEGORIES.map((c) => ({ value: c, label: CATEGORY_LABELS[c] }))

// ─── Toggle ───────────────────────────────────────────────────────────────────

function Toggle({
  checked,
  onChange,
  label,
  description,
  icon,
}: {
  checked: boolean
  onChange: (v: boolean) => void
  label: string
  description: string
  icon: React.ReactNode
}) {
  return (
    <div className="flex items-start gap-4 p-4 border border-border-light">
      <div className="text-muted mt-0.5 flex-shrink-0">{icon}</div>
      <div className="flex-1 flex items-center justify-between gap-4">
        <div>
          <p className="text-sm font-medium">{label}</p>
          <p className="text-xs text-muted mt-0.5">{description}</p>
        </div>
        <button
          type="button"
          role="switch"
          aria-checked={checked}
          onClick={() => onChange(!checked)}
          className={[
            'w-10 h-5 rounded-full transition-colors relative flex-shrink-0 cursor-pointer',
            checked ? 'bg-foreground' : 'bg-warm-300',
          ].join(' ')}
        >
          <span
            className={[
              'absolute top-0.5 w-4 h-4 rounded-full bg-warm-50 shadow transition-transform',
              checked ? 'translate-x-5' : 'translate-x-0.5',
            ].join(' ')}
          />
        </button>
      </div>
    </div>
  )
}

// ─── Main form ────────────────────────────────────────────────────────────────

export default function GalleryForm({ initial }: GalleryFormProps) {
  const router    = useRouter()
  const fileRef   = useRef<HTMLInputElement>(null)
  const galleryId = useRef(initial?.id ?? generateId())

  const [draggingOver, setDraggingOver] = useState(false)
  const [dragIdx,      setDragIdx]      = useState<number | null>(null)

  // ── Form fields ───────────────────────────────────────────────────────────
  const [title,            setTitle]       = useState(initial?.title ?? '')
  const [clientName,       setClientName]  = useState(initial?.clientName ?? '')
  const [date,             setDate]        = useState(initial?.date ?? new Date().toISOString().slice(0, 10))
  const [location,         setLocation]    = useState(initial?.location ?? '')
  const [category,         setCategory]    = useState<GalleryCategory>(initial?.category ?? 'other')
  const [description,      setDescription] = useState(initial?.description ?? '')
  const [downloadsEnabled, setDownloads]   = useState(initial?.downloadsEnabled ?? true)
  const [photos,           setPhotos]      = useState<Photo[]>(initial?.photos ?? [])
  const [coverPhotoId,     setCover]       = useState(initial?.coverImage || initial?.coverPhotoId || '')
  const [selected,         setSelected]    = useState<Set<string>>(new Set())

  // ── UI state ──────────────────────────────────────────────────────────────
  const [saving,         setSaving]        = useState(false)
  const [savedSlug,      setSavedSlug]     = useState<string | null>(null)
  const [urlCopied,      setUrlCopied]     = useState(false)
  const [saveError,      setSaveError]     = useState<string | null>(null)
  const [uploadProgress, setUploadProgress] = useState<Record<string, 'uploading' | 'done' | 'error'>>({})
  const [uploadErrMsgs,  setUploadErrMsgs] = useState<string[]>([])
  const [errors,         setErrors]        = useState<Record<string, string>>({})

  const uploadingCount = Object.values(uploadProgress).filter((s) => s === 'uploading').length
  const hasUploadErrors = Object.values(uploadProgress).some((s) => s === 'error')

  // ── File ingestion ────────────────────────────────────────────────────────
  const ingestFiles = useCallback(async (files: File[]) => {
    const images = files.filter((f) => f.type.startsWith('image/'))
    if (!images.length) return

    setUploadErrMsgs([])

    // Fix 2: sequential uploads (concurrency = 1) — avoids Supabase rate
    // limits and race conditions on simultaneous same-name files.
    // Each file is uploaded one at a time; the UI updates after each one.
    for (const file of images) {
      const tempId = generateId()
      setUploadProgress((p) => ({ ...p, [tempId]: 'uploading' }))

      try {
        const { imageUrl, thumbnailUrl, width, height } = await uploadPhoto(
          file,
          galleryId.current,
        )

        const photo: Photo = {
          id:           tempId,
          galleryId:    galleryId.current,
          imageUrl,
          thumbnailUrl,
          filename:     file.name,
          width,
          height,
          order:        0,
          createdAt:    new Date().toISOString(),
          url:          imageUrl,
          uploadedAt:   new Date().toISOString(),
        }

        setPhotos((prev) => [...prev, photo])
        setUploadProgress((p) => ({ ...p, [tempId]: 'done' }))
      } catch (err) {
        const msg = err instanceof Error ? err.message : String(err)
        console.error(`[GalleryForm] upload error for "${file.name}":`, err)
        setUploadProgress((p) => ({ ...p, [tempId]: 'error' }))
        setUploadErrMsgs((prev) => [...prev, `${file.name}: ${msg}`])
      }
    }
  }, [])

  const handleFileInput = (e: ChangeEvent<HTMLInputElement>) => {
    ingestFiles(Array.from(e.target.files ?? []))
    e.target.value = ''
  }

  // ── Drag-drop ─────────────────────────────────────────────────────────────
  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    setDraggingOver(false)
    ingestFiles(Array.from(e.dataTransfer.files))
  }

  // ── Reorder within grid ───────────────────────────────────────────────────
  const handleDragStart = (idx: number) => setDragIdx(idx)
  const handleDragOver  = (e: DragEvent, idx: number) => {
    e.preventDefault()
    if (dragIdx === null || dragIdx === idx) return
    setPhotos((prev) => {
      const next = [...prev]
      const [moved] = next.splice(dragIdx, 1)
      next.splice(idx, 0, moved)
      return next
    })
    setDragIdx(idx)
  }
  const handleDragEnd = () => setDragIdx(null)

  // ── Bulk selection ────────────────────────────────────────────────────────
  const toggleSelect  = (id: string) => setSelected((prev) => { const n = new Set(prev); n.has(id) ? n.delete(id) : n.add(id); return n })
  const selectAll     = () => setSelected(new Set(photos.map((p) => p.id)))
  const deselectAll   = () => setSelected(new Set())

  const handleBulkDelete = async () => {
    if (!confirm(`Delete ${selected.size} photo(s)?`)) return
    const toDelete = photos.filter((p) => selected.has(p.id))
    await Promise.all(toDelete.map((p) => deleteStoredPhoto(p.imageUrl)))
    setPhotos((prev) => prev.filter((p) => !selected.has(p.id)))
    if (selected.has(coverPhotoId)) setCover('')
    setSelected(new Set())
  }

  const handleRemovePhoto = async (photo: Photo) => {
    await deleteStoredPhoto(photo.imageUrl)
    setPhotos((prev) => prev.filter((p) => p.id !== photo.id))
    if (coverPhotoId === photo.id) setCover('')
    setSelected((prev) => { const n = new Set(prev); n.delete(photo.id); return n })
  }

  // ── Validation ────────────────────────────────────────────────────────────
  const validate = () => {
    const errs: Record<string, string> = {}
    if (!title.trim())      errs.title      = 'Title is required'
    if (!clientName.trim()) errs.clientName = 'Client name is required'
    if (!location.trim())   errs.location   = 'Location is required'
    setErrors(errs)
    return Object.keys(errs).length === 0
  }

  // ── Save ──────────────────────────────────────────────────────────────────
  const handleSave = async () => {
    if (!validate()) return
    setSaving(true)
    setSaveError(null)

    const now           = new Date().toISOString()
    const orderedPhotos = photos.map((p, i) => ({ ...p, order: i }))
    const slug          = initial?.slug ?? (slugify(title) || galleryId.current)

    const gallery: Gallery = {
      id:               galleryId.current,
      slug,
      title:            title.trim(),
      clientName:       clientName.trim(),
      date,
      location:         location.trim(),
      category,
      description:      description.trim(),
      isPrivate:        false,
      password:         undefined,
      downloadsEnabled,
      photos:           orderedPhotos,
      coverImage:       coverPhotoId || orderedPhotos[0]?.id || '',
      coverPhotoId:     coverPhotoId || orderedPhotos[0]?.id || '',
      createdAt:        initial?.createdAt ?? now,
      updatedAt:        now,
    }

    try {
      if (initial) {
        await updateGallery(gallery)
      } else {
        await createGallery(gallery)
      }
      setSavedSlug(slug)
      setSaving(false)
    } catch (err) {
      console.error('[GalleryForm] save error:', err)
      setSaveError(err instanceof Error ? err.message : 'Save failed. Please try again.')
      setSaving(false)
    }
  }

  const handleCopyUrl = () => {
    if (!savedSlug) return
    const url = `${window.location.origin}/gallery/${savedSlug}`
    navigator.clipboard.writeText(url).catch(() => {})
    setUrlCopied(true)
    setTimeout(() => setUrlCopied(false), 2000)
  }

  // ─────────────────────────────────────────────────────────────────────────
  return (
    <div className="max-w-3xl mx-auto px-5 sm:px-8 py-8">
      {/* Back */}
      <button
        onClick={() => router.back()}
        className="inline-flex items-center gap-2 text-[11px] tracking-[0.1em] uppercase text-muted hover:text-foreground transition-colors mb-8 cursor-pointer"
      >
        <ArrowLeft size={13} />
        Back
      </button>

      <h1 className="font-[family-name:var(--font-cormorant)] text-3xl font-light mb-2">
        {initial ? 'Edit Gallery' : 'New Gallery'}
      </h1>

      <p className="text-[10px] tracking-[0.1em] uppercase text-muted mb-8">
        {isSupabaseConfigured ? '● Connected to Supabase' : '○ Local mode'}
      </p>

      {/* ── Saved state: show gallery URL ─────────────────────── */}
      {savedSlug && (
        <div className="mb-8 p-5 border border-border bg-warm-100">
          <p className="text-[10px] tracking-[0.2em] uppercase text-muted mb-3">
            {initial ? 'Gallery updated' : 'Gallery created'} — share this link with your client
          </p>
          <div className="flex items-center gap-2 flex-wrap">
            <code className="flex-1 text-sm bg-warm-50 border border-border px-3 py-2 truncate min-w-0">
              {typeof window !== 'undefined'
                ? `${window.location.origin}/gallery/${savedSlug}`
                : `/gallery/${savedSlug}`}
            </code>
            <button
              onClick={handleCopyUrl}
              className="flex items-center gap-1.5 text-[11px] tracking-[0.1em] uppercase text-muted hover:text-foreground transition-colors border border-border px-3 py-2 bg-warm-50 flex-shrink-0"
            >
              {urlCopied ? <Check size={13} /> : <Copy size={13} />}
              {urlCopied ? 'Copied' : 'Copy'}
            </button>
            <a
              href={`/gallery/${savedSlug}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 text-[11px] tracking-[0.1em] uppercase text-muted hover:text-foreground transition-colors border border-border px-3 py-2 bg-warm-50 flex-shrink-0"
            >
              <ExternalLink size={13} />
              Open
            </a>
          </div>
          <button
            onClick={() => router.push('/admin/galleries')}
            className="mt-4 text-[11px] tracking-[0.1em] uppercase text-muted hover:text-foreground transition-colors cursor-pointer"
          >
            ← Back to all galleries
          </button>
        </div>
      )}

      <div className="flex flex-col gap-10">

        {/* ── Gallery info ─────────────────────────────────────── */}
        <section className="flex flex-col gap-5">
          <p className="text-[10px] tracking-[0.2em] uppercase text-muted border-b border-border-light pb-2">
            Gallery Info
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <Input id="title"      label="Gallery Title *" placeholder="e.g. Ahmed & Sara Wedding"       value={title}      onChange={(e) => setTitle(e.target.value)}      error={errors.title} />
            <Input id="clientName" label="Client Name *"   placeholder="e.g. Ahmed Al-Rashid"           value={clientName} onChange={(e) => setClientName(e.target.value)} error={errors.clientName} />
            <Input id="date"       label="Date *"          type="date"                                   value={date}       onChange={(e) => setDate(e.target.value)} />
            <Input id="location"   label="Location *"      placeholder="e.g. Naama Bay, Sharm El Sheikh" value={location}   onChange={(e) => setLocation(e.target.value)}   error={errors.location} />
            <Select id="category" label="Category" value={category} options={CATEGORY_OPTIONS} onChange={(e) => setCategory(e.target.value as GalleryCategory)} />
          </div>
          <Textarea id="description" label="Description (optional)" placeholder="A brief description of this session…" value={description} onChange={(e) => setDescription(e.target.value)} rows={3} />
        </section>

        {/* ── Settings ─────────────────────────────────────────── */}
        <section className="flex flex-col gap-4">
          <p className="text-[10px] tracking-[0.2em] uppercase text-muted border-b border-border-light pb-2">
            Settings
          </p>
          <Toggle
            checked={downloadsEnabled}
            onChange={setDownloads}
            label="Enable Downloads"
            description="Allow clients to download photos from this gallery."
            icon={<Download size={16} strokeWidth={1.5} />}
          />
        </section>

        {/* ── Photos ───────────────────────────────────────────── */}
        <section className="flex flex-col gap-5">
          <p className="text-[10px] tracking-[0.2em] uppercase text-muted border-b border-border-light pb-2">
            Photos ({photos.length})
            {uploadingCount > 0 && (
              <span className="ml-2 normal-case"> — uploading {uploadingCount}…</span>
            )}
          </p>

          {/* Upload zone */}
          <div
            onClick={() => fileRef.current?.click()}
            onDrop={handleDrop}
            onDragOver={(e) => { e.preventDefault(); setDraggingOver(true) }}
            onDragLeave={() => setDraggingOver(false)}
            className={[
              'border-2 border-dashed p-10 flex flex-col items-center gap-3 cursor-pointer transition-colors group',
              draggingOver
                ? 'border-foreground bg-warm-100'
                : 'border-border hover:border-foreground hover:bg-warm-100',
            ].join(' ')}
          >
            <Upload size={22} strokeWidth={1.5} className="text-muted group-hover:text-foreground transition-colors" />
            <p className="text-sm text-muted group-hover:text-foreground transition-colors text-center">
              {draggingOver ? 'Drop to upload' : 'Click or drag photos here'}
            </p>
            <p className="text-xs text-warm-400">
              JPG, PNG, WEBP · {isSupabaseConfigured ? 'Uploading to Supabase Storage' : 'Stored locally'}
            </p>
          </div>
          <input ref={fileRef} type="file" multiple accept="image/*" className="hidden" onChange={handleFileInput} />

          {/* Upload progress bars */}
          {uploadingCount > 0 && (
            <div className="space-y-1.5">
              {Object.entries(uploadProgress)
                .filter(([, s]) => s === 'uploading')
                .map(([id]) => (
                  <div key={id} className="flex items-center gap-3">
                    <div className="flex-1 h-0.5 bg-border rounded-full overflow-hidden">
                      <div className="h-full bg-foreground animate-pulse w-3/4" />
                    </div>
                    <span className="text-[10px] text-muted whitespace-nowrap">Uploading…</span>
                  </div>
                ))}
            </div>
          )}

          {/* Upload errors — show real error message */}
          {hasUploadErrors && uploadErrMsgs.length > 0 && (
            <div className="flex flex-col gap-1 bg-red-50 border border-red-200 px-4 py-3 rounded">
              <div className="flex items-center gap-2 text-xs text-red-600 font-medium">
                <AlertCircle size={13} />
                Upload failed — see details below and check the browser console (F12)
              </div>
              {uploadErrMsgs.map((msg, i) => (
                <p key={i} className="text-xs text-red-500 pl-5 font-mono">{msg}</p>
              ))}
            </div>
          )}

          {/* Bulk actions */}
          {photos.length > 0 && (
            <div className="flex items-center justify-between flex-wrap gap-3">
              <div className="flex items-center gap-3">
                <button onClick={selectAll}   className="text-[10px] tracking-[0.1em] uppercase text-muted hover:text-foreground transition-colors cursor-pointer">Select all</button>
                {selected.size > 0 && <button onClick={deselectAll} className="text-[10px] tracking-[0.1em] uppercase text-muted hover:text-foreground transition-colors cursor-pointer">Deselect</button>}
              </div>
              {selected.size > 0 && (
                <button onClick={handleBulkDelete} className="inline-flex items-center gap-1.5 text-[10px] tracking-[0.1em] uppercase text-red-500 hover:text-red-700 transition-colors cursor-pointer">
                  <Trash2 size={12} />
                  Delete {selected.size} selected
                </button>
              )}
            </div>
          )}

          {/* Photo grid */}
          {photos.length > 0 && (
            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-1.5">
              {photos.map((photo, idx) => {
                const isCover    = coverPhotoId === photo.id
                const isSelected = selected.has(photo.id)
                return (
                  <div
                    key={photo.id}
                    draggable
                    onDragStart={() => handleDragStart(idx)}
                    onDragOver={(e) => handleDragOver(e, idx)}
                    onDragEnd={handleDragEnd}
                    onClick={() => toggleSelect(photo.id)}
                    className={[
                      'group relative aspect-square overflow-hidden bg-warm-100 cursor-grab active:cursor-grabbing',
                      isCover    && 'ring-2 ring-foreground',
                      isSelected && 'ring-2 ring-blue-400',
                    ].filter(Boolean).join(' ')}
                  >
                    <img
                      src={gridThumbUrl(photo)}
                      alt="Photo"
                      className="absolute inset-0 w-full h-full object-cover pointer-events-none"
                    />
                    <div className={['absolute inset-0 transition-colors', isSelected ? 'bg-blue-400/20' : 'bg-foreground/0 group-hover:bg-foreground/25'].join(' ')} />
                    <div className="absolute top-1 right-1 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button type="button" onClick={(e) => { e.stopPropagation(); setCover(photo.id) }} className="bg-white/90 p-1 shadow-sm" title="Set as cover">
                        <Star size={11} className={isCover ? 'fill-foreground text-foreground' : 'text-foreground'} />
                      </button>
                      <button type="button" onClick={(e) => { e.stopPropagation(); handleRemovePhoto(photo) }} className="bg-white/90 p-1 shadow-sm" title="Remove photo">
                        <X size={11} className="text-foreground" />
                      </button>
                    </div>
                    <div className="absolute bottom-1 left-1 opacity-0 group-hover:opacity-60 transition-opacity">
                      <GripVertical size={12} className="text-white drop-shadow" />
                    </div>
                    {isCover && (
                      <div className="absolute bottom-1 right-1 bg-foreground px-1.5 py-0.5">
                        <span className="text-[8px] tracking-[0.1em] uppercase text-warm-50">Cover</span>
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          )}

          {photos.length > 0 && (
            <p className="text-xs text-muted">
              {photos.length} photo{photos.length !== 1 ? 's' : ''} · Drag to reorder · Hover <Star size={10} className="inline" /> to set cover
            </p>
          )}
        </section>

        {/* ── Save error ───────────────────────────────────────── */}
        {saveError && (
          <div className="flex items-center gap-2 text-sm text-red-500 bg-red-50 border border-red-200 px-4 py-3">
            <AlertCircle size={14} />
            {saveError}
          </div>
        )}

        {/* ── Save ─────────────────────────────────────────────── */}
        <div className="flex items-center gap-5 pt-4 border-t border-border-light">
          <Button onClick={handleSave} disabled={saving || uploadingCount > 0} size="lg">
            {saving
              ? 'Saving…'
              : uploadingCount > 0
              ? `Uploading ${uploadingCount}…`
              : savedSlug
              ? <><Check size={14} /> {initial ? 'Changes saved' : 'Gallery created'}</>
              : initial
              ? 'Save Changes'
              : 'Create Gallery'}
          </Button>
          <button
            onClick={() => router.push('/admin/galleries')}
            className="text-xs text-muted hover:text-foreground transition-colors tracking-wide cursor-pointer"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  )
}
