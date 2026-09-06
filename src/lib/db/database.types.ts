/**
 * Hand-authored database type definitions that mirror the Supabase schema.
 * When you run `supabase gen types typescript` these will be replaced by the
 * auto-generated version — just make sure the table/column names stay in sync.
 */

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      galleries: {
        Row: GalleryRow
        Insert: GalleryInsert
        Update: GalleryUpdate
      }
      photos: {
        Row: PhotoRow
        Insert: PhotoInsert
        Update: PhotoUpdate
      }
      favorites: {
        Row: FavoriteRow
        Insert: FavoriteInsert
        Update: Partial<FavoriteInsert>
      }
    }
  }
}

// ─── galleries ────────────────────────────────────────────────────────────────

export interface GalleryRow {
  id:                string          // uuid
  client_name:       string
  title:             string
  slug:              string
  date:              string          // date "YYYY-MM-DD"
  location:          string
  category:          string
  description:       string | null
  cover_image:       string | null   // photo id (uuid)
  is_private:        boolean
  password:          string | null
  downloads_enabled: boolean
  created_at:        string          // timestamptz
  updated_at:        string          // timestamptz
}

export type GalleryInsert = Omit<GalleryRow, 'created_at' | 'updated_at'> & {
  created_at?: string
  updated_at?: string
}

export type GalleryUpdate = Partial<GalleryInsert>

// ─── photos ───────────────────────────────────────────────────────────────────

export interface PhotoRow {
  id:            string   // uuid
  gallery_id:    string   // → galleries.id
  image_url:     string
  thumbnail_url: string
  filename:      string
  width:         number
  height:        number
  caption:       string | null
  display_order: number
  created_at:    string
}

export type PhotoInsert = Omit<PhotoRow, 'created_at'> & { created_at?: string }
export type PhotoUpdate = Partial<PhotoInsert>

// ─── favorites ────────────────────────────────────────────────────────────────

export interface FavoriteRow {
  id:                string   // uuid
  gallery_id:        string   // → galleries.id
  photo_id:          string   // → photos.id
  client_identifier: string   // anonymous session token or device id
  created_at:        string
}

export type FavoriteInsert = Omit<FavoriteRow, 'id' | 'created_at'> & {
  id?:         string
  created_at?: string
}
