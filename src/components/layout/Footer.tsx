import Link from 'next/link'
import Image from 'next/image'

export default function Footer() {
  const year = new Date().getFullYear()

  return (
    <footer className="border-t border-border mt-auto">
      <div className="max-w-6xl mx-auto px-6 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10 mb-10">

          {/* Brand */}
          <div>
            <Image
              src="/logo.png"
              alt="AHMED SHIKO Photography"
              width={130}
              height={52}
              className="h-10 w-auto object-contain mb-4"
            />
            <p className="text-xs text-muted tracking-wide leading-relaxed">
              Professional Photography<br />
              Sharm El Sheikh, Egypt
            </p>
          </div>

          {/* Navigation */}
          <div>
            <p className="text-[9px] tracking-[0.22em] uppercase text-muted mb-4">Navigation</p>
            <nav className="flex flex-col gap-3">
              {[
                { href: '/',          label: 'Home' },
                { href: '/galleries', label: 'Galleries' },
                { href: '/#contact',  label: 'Contact' },
              ].map(({ href, label }) => (
                <Link key={href} href={href}
                  className="text-sm text-muted hover:text-foreground transition-colors">
                  {label}
                </Link>
              ))}
            </nav>
          </div>

          {/* Contact */}
          <div>
            <p className="text-[9px] tracking-[0.22em] uppercase text-muted mb-4">Contact</p>
            <div className="flex flex-col gap-3">
              <a href="https://wa.me/201050052508" target="_blank" rel="noopener noreferrer"
                className="text-sm text-muted hover:text-foreground transition-colors">
                WhatsApp: 01050052508
              </a>
              <a href="https://instagram.com/shik0_photography_" target="_blank" rel="noopener noreferrer"
                className="text-sm text-muted hover:text-foreground transition-colors">
                Instagram: @shik0_photography_
              </a>
            </div>
          </div>
        </div>

        <div className="border-t border-border-light pt-6 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-[10px] text-muted tracking-wide">
            © {year} AHMED SHIKO Photography. All rights reserved.
          </p>
          <Link href="/admin"
            className="text-[10px] text-muted hover:text-foreground transition-colors tracking-wide">
            Admin
          </Link>
        </div>
      </div>
    </footer>
  )
}
