import Link from 'next/link'

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-6 text-center bg-warm-50">
      <p className="font-[family-name:var(--font-cormorant)] text-8xl font-light text-warm-200 mb-6">
        404
      </p>
      <h1 className="font-[family-name:var(--font-cormorant)] text-3xl font-light mb-3">
        Page not found
      </h1>
      <p className="text-sm text-muted mb-10">
        The page you&apos;re looking for doesn&apos;t exist or has been moved.
      </p>
      <Link
        href="/"
        className="text-[11px] tracking-[0.15em] uppercase border border-foreground px-8 py-4 hover:bg-foreground hover:text-warm-50 transition-all duration-200"
      >
        Back to Home
      </Link>
    </div>
  )
}
