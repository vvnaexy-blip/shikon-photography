import Link from 'next/link'
import { ArrowRight, MessageCircle } from 'lucide-react'
import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'
import HomeGalleries from '@/components/home/HomeGalleries'
import { CATEGORIES, CATEGORY_LABELS } from '@/lib/utils'

export default function HomePage() {
  return (
    <>
      <Navbar />
      <main className="flex-1">
        {/* ── Hero ─────────────────────────────────────────────── */}
        <section className="min-h-screen flex flex-col items-center justify-center px-6 pt-16 text-center">
          <p className="text-[10px] tracking-[0.3em] uppercase text-muted mb-8">
            Sharm El Sheikh, Egypt
          </p>
          <h1 className="font-[family-name:var(--font-cormorant)] text-6xl sm:text-8xl md:text-9xl font-light leading-none tracking-tight mb-6">
            SHIKO
          </h1>
          <p className="font-[family-name:var(--font-cormorant)] text-xl sm:text-2xl font-light italic text-muted mb-12 tracking-wide">
            Photography
          </p>
          <p className="text-sm text-muted max-w-sm leading-relaxed mb-12 tracking-wide">
            Capturing timeless moments with an editorial eye. Weddings,
            portraits, events, and more.
          </p>
          <div className="flex flex-col sm:flex-row items-center gap-4">
            <Link
              href="/galleries"
              className="inline-flex items-center gap-2 text-[11px] tracking-[0.15em] uppercase border border-foreground px-8 py-4 hover:bg-foreground hover:text-warm-50 transition-all duration-200"
            >
              View Galleries
              <ArrowRight size={14} />
            </Link>
            <a
              href="#contact"
              className="text-[11px] tracking-[0.15em] uppercase text-muted hover:text-foreground transition-colors px-8 py-4"
            >
              Get in Touch
            </a>
          </div>

          {/* Scroll hint */}
          <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 opacity-50">
            <div className="w-px h-10 bg-warm-400" />
          </div>
        </section>

        {/* ── Divider ───────────────────────────────────────────── */}
        <div className="border-t border-border-light" />

        {/* ── Categories ───────────────────────────────────────── */}
        <section className="py-24 px-6">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-16">
              <p className="text-[10px] tracking-[0.3em] uppercase text-muted mb-4">
                Specialties
              </p>
              <h2 className="font-[family-name:var(--font-cormorant)] text-4xl sm:text-5xl font-light">
                What We Capture
              </h2>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-px bg-border-light">
              {CATEGORIES.map((cat) => (
                <Link
                  key={cat}
                  href={`/galleries?category=${cat}`}
                  className="group bg-warm-50 flex flex-col items-center justify-center py-10 px-6 text-center hover:bg-warm-100 transition-colors"
                >
                  <span className="font-[family-name:var(--font-cormorant)] text-xl font-light group-hover:text-muted transition-colors">
                    {CATEGORY_LABELS[cat]}
                  </span>
                </Link>
              ))}
            </div>
          </div>
        </section>

        {/* ── Divider ───────────────────────────────────────────── */}
        <div className="border-t border-border-light" />

        {/* ── About / Philosophy ───────────────────────────────── */}
        <section className="py-24 px-6">
          <div className="max-w-3xl mx-auto text-center">
            <p className="text-[10px] tracking-[0.3em] uppercase text-muted mb-6">
              The Approach
            </p>
            <blockquote className="font-[family-name:var(--font-cormorant)] text-3xl sm:text-4xl font-light italic leading-relaxed text-warm-700 mb-8">
              &ldquo;Every frame tells a story. Every moment, preserved
              forever.&rdquo;
            </blockquote>
            <p className="text-sm text-muted leading-relaxed max-w-lg mx-auto">
              Based in the vibrant city of Sharm El Sheikh, we bring a clean,
              editorial perspective to every shoot — whether it&apos;s an
              intimate wedding, a family session, or a corporate event.
            </p>
          </div>
        </section>

        {/* ── Divider ───────────────────────────────────────────── */}
        <div className="border-t border-border-light" />

        {/* ── Recent Galleries — fetched live from Supabase ────── */}
        <HomeGalleries />

        {/* ── Divider ───────────────────────────────────────────── */}
        <div className="border-t border-border-light" />

        {/* ── CTA ──────────────────────────────────────────────── */}
        <section className="py-24 px-6 bg-warm-100">
          <div className="max-w-4xl mx-auto text-center">
            <p className="text-[10px] tracking-[0.3em] uppercase text-muted mb-6">
              Your Galleries
            </p>
            <h2 className="font-[family-name:var(--font-cormorant)] text-4xl sm:text-5xl font-light mb-6">
              View Client Galleries
            </h2>
            <p className="text-sm text-muted leading-relaxed mb-10 max-w-sm mx-auto">
              If you&apos;ve had a session with us, your photos are waiting.
              Browse and download your memories.
            </p>
            <Link
              href="/galleries"
              className="inline-flex items-center gap-2 text-[11px] tracking-[0.15em] uppercase bg-foreground text-warm-50 px-8 py-4 hover:bg-warm-800 transition-colors"
            >
              Go to Galleries
              <ArrowRight size={14} />
            </Link>
          </div>
        </section>

        {/* ── Divider ───────────────────────────────────────────── */}
        <div className="border-t border-border-light" />

        {/* ── Contact ──────────────────────────────────────────── */}
        <section id="contact" className="py-24 px-6">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-16">
              <p className="text-[10px] tracking-[0.3em] uppercase text-muted mb-4">
                Let&apos;s Work Together
              </p>
              <h2 className="font-[family-name:var(--font-cormorant)] text-4xl sm:text-5xl font-light">
                Get in Touch
              </h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 max-w-2xl mx-auto gap-6">
              <a
                href="https://wa.me/201050052508"
                target="_blank"
                rel="noopener noreferrer"
                className="group border border-border p-8 flex flex-col items-center text-center gap-4 hover:border-foreground hover:bg-warm-100 transition-all duration-200"
              >
                <MessageCircle size={24} strokeWidth={1.5} className="text-muted group-hover:text-foreground transition-colors" />
                <div>
                  <p className="text-[10px] tracking-[0.15em] uppercase text-muted mb-1">WhatsApp</p>
                  <p className="font-[family-name:var(--font-cormorant)] text-lg font-medium">01050052508</p>
                </div>
              </a>

              <a
                href="https://instagram.com/shik0_photography_"
                target="_blank"
                rel="noopener noreferrer"
                className="group border border-border p-8 flex flex-col items-center text-center gap-4 hover:border-foreground hover:bg-warm-100 transition-all duration-200"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"
                  fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"
                  className="text-muted group-hover:text-foreground transition-colors" aria-hidden="true">
                  <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
                  <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
                  <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
                </svg>
                <div>
                  <p className="text-[10px] tracking-[0.15em] uppercase text-muted mb-1">Instagram</p>
                  <p className="font-[family-name:var(--font-cormorant)] text-lg font-medium">@shik0_photography_</p>
                </div>
              </a>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  )
}
