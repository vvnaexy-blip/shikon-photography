'use client'

import { useState, useRef, useEffect } from 'react'
import { Share2, Copy, Check, MessageCircle } from 'lucide-react'
import { cn } from '@/lib/utils'

interface ShareButtonProps {
  title: string
  url?: string
  onCopied?: () => void
  className?: string
}

export default function ShareButton({ title, url, onCopied, className }: ShareButtonProps) {
  const [open, setOpen] = useState(false)
  const [copied, setCopied] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  const shareUrl = url || (typeof window !== 'undefined' ? window.location.href : '')
  const shareText = `View my gallery: ${title}`

  // Close on outside click
  useEffect(() => {
    function handle(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', handle)
    return () => document.removeEventListener('mousedown', handle)
  }, [])

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl)
      setCopied(true)
      onCopied?.()
      setTimeout(() => {
        setCopied(false)
        setOpen(false)
      }, 1800)
    } catch {
      // fallback
      const ta = document.createElement('textarea')
      ta.value = shareUrl
      document.body.appendChild(ta)
      ta.select()
      document.execCommand('copy')
      document.body.removeChild(ta)
      setCopied(true)
      onCopied?.()
      setTimeout(() => { setCopied(false); setOpen(false) }, 1800)
    }
  }

  const handleWhatsApp = () => {
    const msg = encodeURIComponent(`${shareText}\n${shareUrl}`)
    window.open(`https://wa.me/?text=${msg}`, '_blank')
    setOpen(false)
  }

  const handleNative = async () => {
    if (navigator.share) {
      try {
        await navigator.share({ title, url: shareUrl, text: shareText })
      } catch {
        // user cancelled — ignore
      }
      setOpen(false)
    }
  }

  const hasNativeShare = typeof navigator !== 'undefined' && 'share' in navigator

  return (
    <div ref={ref} className={cn('relative', className)}>
      <button
        onClick={() => setOpen((v) => !v)}
        className="inline-flex items-center gap-2 text-[11px] tracking-[0.1em] uppercase text-muted hover:text-foreground transition-colors px-3 py-2 border border-border hover:border-foreground"
        aria-label="Share gallery"
        aria-expanded={open}
      >
        <Share2 size={14} />
        <span className="hidden sm:inline">Share</span>
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-1 w-52 bg-warm-50 border border-border shadow-lg z-50">
          <button
            onClick={handleCopy}
            className="flex items-center gap-3 w-full px-4 py-3 text-sm hover:bg-warm-100 transition-colors text-left"
          >
            {copied ? (
              <Check size={14} className="text-foreground" />
            ) : (
              <Copy size={14} className="text-muted" />
            )}
            <span>{copied ? 'Link copied!' : 'Copy link'}</span>
          </button>

          <button
            onClick={handleWhatsApp}
            className="flex items-center gap-3 w-full px-4 py-3 text-sm hover:bg-warm-100 transition-colors text-left border-t border-border-light"
          >
            <MessageCircle size={14} className="text-muted" />
            <span>Share via WhatsApp</span>
          </button>

          {hasNativeShare && (
            <button
              onClick={handleNative}
              className="flex items-center gap-3 w-full px-4 py-3 text-sm hover:bg-warm-100 transition-colors text-left border-t border-border-light"
            >
              <Share2 size={14} className="text-muted" />
              <span>More options…</span>
            </button>
          )}
        </div>
      )}
    </div>
  )
}
