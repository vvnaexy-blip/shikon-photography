import type { Metadata } from 'next'
import { Cormorant_Garamond, Inter } from 'next/font/google'
import './globals.css'

const cormorant = Cormorant_Garamond({
  variable: '--font-cormorant',
  subsets: ['latin'],
  weight: ['300', '400', '500', '600'],
  style: ['normal', 'italic'],
})

const inter = Inter({
  variable: '--font-inter',
  subsets: ['latin'],
  weight: ['300', '400', '500'],
})

export const metadata: Metadata = {
  title: {
    default: 'AHMED SHIKO Photography',
    template: '%s | AHMED SHIKO Photography',
  },
  description:
    'Professional photography in Sharm El Sheikh, Egypt. Wedding, portrait, event, and family photography.',
  keywords: ['photography', 'Sharm El Sheikh', 'Egypt', 'wedding', 'portrait'],
  icons: {
    icon: '/logo.png',
    apple: '/logo.png',
  },
  openGraph: {
    title: 'AHMED SHIKO Photography',
    description: 'Professional photography in Sharm El Sheikh, Egypt.',
    images: [{ url: '/logo.png', width: 1200, height: 630, alt: 'AHMED SHIKO Photography' }],
    type: 'website',
    locale: 'en_US',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'AHMED SHIKO Photography',
    description: 'Professional photography in Sharm El Sheikh, Egypt.',
    images: ['/logo.png'],
  },
}

export default function RootLayout({ children }: LayoutProps<'/'>) {
  return (
    <html
      lang="en"
      className={`${cormorant.variable} ${inter.variable} h-full`}
    >
      <body className="min-h-full flex flex-col bg-warm-50 text-foreground antialiased">
        {children}
      </body>
    </html>
  )
}
