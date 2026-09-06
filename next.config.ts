import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      // Supabase Storage — covers all projects under supabase.co
      {
        protocol: 'https',
        hostname: '*.supabase.co',
        pathname: '/storage/v1/object/public/**',
      },
      // Supabase Storage (old/direct project hostname format)
      {
        protocol: 'https',
        hostname: 'edvsfnxwhuucgvjcbqbe.supabase.co',
      },
    ],
  },
}

export default nextConfig
