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
    default: 'SHIKO PHOTOGRAPHY',
    template: '%s | SHIKO PHOTOGRAPHY',
  },
  description:
    'Professional photography in Sharm El Sheikh, Egypt. Wedding, portrait, event, and family photography.',
  keywords: ['photography', 'Sharm El Sheikh', 'Egypt', 'wedding', 'portrait'],
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
