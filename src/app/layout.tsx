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
  verification: {
    google: 'D6_L8-iyTGdpGjpjTdSx1P6DDQkiFcpNFyofhDLk5CQ',
  },
  metadataBase: new URL('https://shikon-photography.vercel.app'),

  title: {
    default: 'Ahmed Shiko Photography | Photographer in Sharm El Sheikh',
    template: '%s | Ahmed Shiko Photography',
  },

  description:
    'Ahmed Shiko Photography — professional photographer in Sharm El Sheikh, Egypt. Wedding, couple, portrait, family, fashion and beach photography sessions.',

  keywords: [
    'Ahmed Shiko',
    'Ahmed Shiko Photography',
    'Photographer in Sharm El Sheikh',
    'Sharm El Sheikh Photographer',
    'Sharm El Sheikh Photography',
    'Wedding Photographer Sharm El Sheikh',
    'Couple Photographer Sharm El Sheikh',
    'Portrait Photographer Sharm El Sheikh',
    'Beach Photography Sharm El Sheikh',
    'Egypt Photographer',
  ],

  authors: [{ name: 'Ahmed Shiko' }],
  creator: 'Ahmed Shiko',
  publisher: 'Ahmed Shiko Photography',

  alternates: {
    canonical: 'https://shikon-photography.vercel.app',
  },

  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-image-preview': 'large',
      'max-snippet': -1,
      'max-video-preview': -1,
    },
  },

  icons: {
    icon: '/logo.png',
    apple: '/logo.png',
  },

  openGraph: {
    title: 'Ahmed Shiko Photography | Photographer in Sharm El Sheikh',
    description:
      'Professional photography in Sharm El Sheikh, Egypt — weddings, couples, portraits, families, fashion and beach sessions.',
    url: 'https://shikon-photography.vercel.app',
    siteName: 'Ahmed Shiko Photography',
    images: [
      {
        url: '/logo.png',
        width: 1200,
        height: 630,
        alt: 'Ahmed Shiko Photography',
      },
    ],
    type: 'website',
    locale: 'en_US',
  },

  twitter: {
    card: 'summary_large_image',
    title: 'Ahmed Shiko Photography | Photographer in Sharm El Sheikh',
    description:
      'Professional photography in Sharm El Sheikh, Egypt.',
    images: ['/logo.png'],
  },
}

const structuredData = {
  '@context': 'https://schema.org',
  '@type': 'ProfessionalService',
  name: 'Ahmed Shiko Photography',
  alternateName: 'Ahmed Shiko',
  url: 'https://shikon-photography.vercel.app',
  image: 'https://shikon-photography.vercel.app/logo.png',
  telephone: '+201050052508',
  description:
    'Professional photographer in Sharm El Sheikh, Egypt specializing in wedding, couple, portrait, family, fashion and beach photography.',
  address: {
    '@type': 'PostalAddress',
    addressLocality: 'Sharm El Sheikh',
    addressCountry: 'EG',
  },
  areaServed: {
    '@type': 'City',
    name: 'Sharm El Sheikh',
  },
  priceRange: '$$',
  sameAs: [
    'https://www.instagram.com/shik0_photography_/',
  ],
  serviceType: [
    'Wedding Photography',
    'Couple Photography',
    'Portrait Photography',
    'Family Photography',
    'Beach Photography',
    'Fashion Photography',
  ],
}

export default function RootLayout({ children }: LayoutProps<'/'>) {
  return (
    <html
      lang="en"
      className={`${cormorant.variable} ${inter.variable} h-full`}
    >
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(structuredData),
          }}
        />
      </head>
      <body className="min-h-full flex flex-col bg-warm-50 text-foreground antialiased">
        {children}
      </body>
    </html>
  )
}
