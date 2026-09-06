import { NextRequest, NextResponse } from 'next/server'
import { isSupabaseConfigured, tryGetSupabaseClient } from '@/lib/supabase'
import type { PhotoInsert } from '@/lib/db/database.types'

export async function POST(req: NextRequest) {
  if (!isSupabaseConfigured) return NextResponse.json({ error: 'Supabase not configured' }, { status: 503 })

  let body: { photos: PhotoInsert[] }
  try { body = await req.json() }
  catch { return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 }) }

  if (!Array.isArray(body.photos) || body.photos.length === 0) {
    return NextResponse.json({ error: 'photos array is required' }, { status: 400 })
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data, error } = await (tryGetSupabaseClient()!.from('photos') as any)
    .insert(body.photos)
    .select()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ photos: data }, { status: 201 })
}
