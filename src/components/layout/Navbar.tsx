'use client'

import Link from 'next/link'
import Image from 'next/image'
import { usePathname } from 'next/navigation'
import { useState } from 'react'
import { Menu, X } from 'lucide-react'

const links = [
  { href: '/galleries', label: 'Galleries' },
  { href: '/#contact',  label: 'Contact' },
]

export default function Navbar() {
  const pathname = usePathname()
  const [open, setOpen] = useState(false)

  if (pathname.startsWith('/admin')) return null
  // Homepage has its own identity header — no separate navbar needed
  if (pathname === '/') return null

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-warm-50/90 backdrop-blur-sm border-b border-border-light">
      <div className="max-w-6xl mx-auto px-6 flex items-center justify-between h-16">

        {/* ── Logo ─────────────────────────────────────────────── */}
        <Link href="/" className="flex items-center" aria-label="AHMED SHIKO Photography — Home">
          <Image
            src="/logo.png"
            alt="AHMED SHIKO Photography"
            width={120}
            height={48}
            className="h-10 w-auto object-contain"
            priority
          />
        </Link>

        {/* ── Desktop nav ──────────────────────────────────────── */}
        <nav className="hidden md:flex items-center gap-10">
          {links.map(({ href, label }) => (
            <Link
              key={href}
              href={href}
              className={[
                'text-[10px] tracking-[0.15em] uppercase transition-colors',
                pathname === href
                  ? 'text-foreground'
                  : 'text-muted hover:text-foreground',
              ].join(' ')}
            >
              {label}
            </Link>
          ))}
        </nav>

        {/* ── Mobile toggle ────────────────────────────────────── */}
        <button
          className="md:hidden text-foreground p-1"
          onClick={() => setOpen((v) => !v)}
          aria-label="Toggle menu"
        >
          {open ? <X size={19} /> : <Menu size={19} />}
        </button>
      </div>

      {/* ── Mobile menu ──────────────────────────────────────── */}
      {open && (
        <div className="md:hidden border-t border-border-light bg-warm-50">
          <nav className="flex flex-col px-6 py-6 gap-6">
            {links.map(({ href, label }) => (
              <Link
                key={href}
                href={href}
                onClick={() => setOpen(false)}
                className="text-[10px] tracking-[0.15em] uppercase text-muted hover:text-foreground transition-colors"
              >
                {label}
              </Link>
            ))}
          </nav>
        </div>
      )}
    </header>
  )
}
