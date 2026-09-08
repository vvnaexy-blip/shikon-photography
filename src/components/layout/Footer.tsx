import Link from 'next/link'

const WA_HREF = 'https://wa.me/201050052508?text=Hello%21%20I%20would%20like%20to%20book%20a%20photography%20session%20in%20Sharm%20El%20Sheikh%20%F0%9F%93%B8'

export default function Footer() {
  const year = new Date().getFullYear()

  return (
    <footer className="border-t border-border-light py-6 px-8">
      <div className="flex flex-col items-center gap-3 text-center">
        <p className="font-[family-name:var(--font-cormorant)] text-base tracking-[0.2em] uppercase text-foreground">
          SHIKO Photography
        </p>

        <div className="flex items-center gap-5">
          {/* Instagram */}
          <a
            href="https://instagram.com/shik0_photography_"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 text-[11px] text-muted hover:text-foreground transition-colors tracking-wide"
          >
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor"
              strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
              <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
              <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
            </svg>
            Instagram
          </a>

          {/* WhatsApp */}
          <a
            href={WA_HREF}
            target="_blank"
            rel="noopener noreferrer"
            className="text-[11px] text-muted hover:text-foreground transition-colors tracking-wide"
          >
            WhatsApp
          </a>

          {/* Admin */}
          <Link
            href="/admin"
            className="text-[11px] text-muted hover:text-foreground transition-colors tracking-wide"
          >
            Admin
          </Link>
        </div>

        <p className="text-[10px] text-warm-400 tracking-wide">
          © {year} SHIKO Photography
        </p>
      </div>
    </footer>
  )
}
