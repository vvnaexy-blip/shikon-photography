/**
 * Demo galleries — shown ONLY when Supabase returns zero real galleries.
 *
 * These are never saved to Supabase and never visible in Admin.
 * Images are served from /public/demo/<folder>/.
 *
 * ── How to add your demo photos ──────────────────────────────────────────────
 *
 *  public/
 *  └── demo/
 *      ├── wedding-1/
 *      │   ├── cover.jpg   ← album cover (required)
 *      │   ├── 01.jpg
 *      │   ├── 02.jpg
 *      │   └── ...
 *      ├── portrait-1/
 *      │   ├── cover.jpg
 *      │   └── 01.jpg
 *      └── ... (one folder per album)
 *
 *  Rules:
 *  - Every folder must have a cover.jpg
 *  - Photo filenames: 01.jpg, 02.jpg, 03.jpg … (or any name — update DEMO_PHOTOS below)
 *  - Supported formats: .jpg .jpeg .png .webp
 *  - Minimum recommended width: 1200px
 *
 * ── To add more albums ────────────────────────────────────────────────────────
 *  1. Create a new folder under public/demo/
 *  2. Add a cover.jpg + numbered photos
 *  3. Add an entry to DEMO_ALBUMS below
 * ─────────────────────────────────────────────────────────────────────────────
 */

import type { Gallery, Photo, GalleryCategory } from '@/types'

// ─── Photo file lists per album ───────────────────────────────────────────────
// Add filenames here as you place them in the folders.
// The cover is always cover.jpg — listed separately.

const DEMO_PHOTOS: Record<string, string[]> = {
  'wedding-1':   ['01.jpg', '02.jpg', '03.jpg', '04.jpg', '05.jpg', '06.jpg'],
  'portrait-1':  ['01.jpg', '02.jpg', '03.jpg', '04.jpg'],
  'family-1':    ['01.jpg', '02.jpg', '03.jpg'],
  'couple-1':    ['01.jpg', '02.jpg', '03.jpg', '04.jpg'],
  'beach-1':     ['01.jpg', '02.jpg', '03.jpg'],
  'lifestyle-1': ['01.jpg', '02.jpg', '03.jpg'],
}

// ─── Album metadata ───────────────────────────────────────────────────────────

interface DemoAlbumMeta {
  folder:     string
  slug:       string
  title:      string
  clientName: string
  category:   GalleryCategory
  date:       string
  location:   string
  description?: string
}

const DEMO_ALBUM_META: DemoAlbumMeta[] = [
  {
    folder:     'wedding-1',
    slug:       'demo-ahmed-sara-wedding',
    title:      'Ahmed & Sara',
    clientName: 'Wedding Session',
    category:   'wedding',
    date:       '2026-05-12',
    location:   'Naama Bay, Sharm El Sheikh',
    description: 'A romantic beachside wedding ceremony.',
  },
  {
    folder:     'portrait-1',
    slug:       'demo-summer-portraits',
    title:      'Summer Portraits',
    clientName: 'Layla Hassan',
    category:   'portrait',
    date:       '2026-07-08',
    location:   'Old Market, Sharm El Sheikh',
  },
  {
    folder:     'family-1',
    slug:       'demo-alrashid-family',
    title:      'The Al-Rashid Family',
    clientName: 'Family Session',
    category:   'family',
    date:       '2026-04-20',
    location:   'Ras Mohammed, Sharm El Sheikh',
  },
  {
    folder:     'couple-1',
    slug:       'demo-a-love-story',
    title:      'A Love Story',
    clientName: 'Omar & Nour',
    category:   'portrait',
    date:       '2026-06-15',
    location:   'Mountain Road, Sharm El Sheikh',
  },
  {
    folder:     'beach-1',
    slug:       'demo-golden-hour',
    title:      'Golden Hour',
    clientName: 'Lifestyle Session',
    category:   'landscape',
    date:       '2026-08-03',
    location:   'South Beach, Sharm El Sheikh',
  },
  {
    folder:     'lifestyle-1',
    slug:       'demo-morning-light',
    title:      'Morning Light',
    clientName: 'Rania Khalil',
    category:   'portrait',
    date:       '2026-09-01',
    location:   'Hadaba, Sharm El Sheikh',
  },
]

// ─── Build Photo objects from file list ───────────────────────────────────────

function buildPhotos(folder: string, albumId: string): Photo[] {
  const filenames = DEMO_PHOTOS[folder] ?? []
  return filenames.map((filename, i) => ({
    id:           `${albumId}-photo-${i + 1}`,
    galleryId:    albumId,
    imageUrl:     `/demo/${folder}/${filename}`,
    thumbnailUrl: `/demo/${folder}/${filename}`,
    filename,
    width:        0,
    height:       0,
    order:        i,
    createdAt:    new Date().toISOString(),
    url:          `/demo/${folder}/${filename}`,
  }))
}

function buildCoverPhoto(folder: string, albumId: string): Photo {
  return {
    id:           `${albumId}-cover`,
    galleryId:    albumId,
    imageUrl:     `/demo/${folder}/cover.jpg`,
    thumbnailUrl: `/demo/${folder}/cover.jpg`,
    filename:     'cover.jpg',
    width:        0,
    height:       0,
    order:        -1,
    createdAt:    new Date().toISOString(),
    url:          `/demo/${folder}/cover.jpg`,
  }
}

// ─── Assemble full Gallery objects ────────────────────────────────────────────

function buildDemoGallery(meta: DemoAlbumMeta): Gallery {
  const id          = `demo-${meta.folder}`
  const coverPhoto  = buildCoverPhoto(meta.folder, id)
  const otherPhotos = buildPhotos(meta.folder, id)
  const allPhotos   = [coverPhoto, ...otherPhotos]
  const now         = new Date().toISOString()

  return {
    id,
    slug:             meta.slug,
    title:            meta.title,
    clientName:       meta.clientName,
    category:         meta.category,
    date:             meta.date,
    location:         meta.location,
    description:      meta.description,
    coverImage:       coverPhoto.id,
    coverPhotoId:     coverPhoto.id,
    photos:           allPhotos,
    isPrivate:        false,
    downloadsEnabled: false,   // downloads off for demo
    createdAt:        now,
    updatedAt:        now,
  }
}

export const DEMO_GALLERIES: Gallery[] = DEMO_ALBUM_META.map(buildDemoGallery)

/**
 * Returns true if a gallery ID belongs to the demo set.
 * Used to prevent demo galleries from appearing in Admin or being saved.
 */
export function isDemoGallery(id: string): boolean {
  return id.startsWith('demo-')
}
