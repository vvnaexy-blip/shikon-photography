import { NextRequest, NextResponse } from 'next/server'
import { isSupabaseConfigured, tryGetSupabaseClient } from '@/lib/supabase'

export async function GET() {
  if (!isSupabaseConfigured) {
    return NextResponse.json({ error: 'Supabase not configured', galleries: [] }, { status: 200 })
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data, error } = await (tryGetSupabaseClient()!.from('galleries') as any)
    .select('*, photos(*)')
    .order('created_at', { ascending: false })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ galleries: data })
}

export async function POST(req: NextRequest) {
  if (!isSupabaseConfigured) {
    return NextResponse.json({ error: 'Supabase not configured' }, { status: 503 })
  }

  let body: Record<string, unknown>
  try { body = await req.json() }
  catch { return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 }) }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data, error } = await (tryGetSupabaseClient()!.from('galleries') as any)
    .insert({
      id:                body.id,
      client_name:       body.clientName,
      title:             body.title,
      slug:              body.slug,
      date:              body.date,
      location:          body.location,
      category:          body.category,
      description:       body.description ?? null,
      cover_image:       body.coverImage  ?? null,
      is_private:        body.isPrivate   ?? false,
      password:          body.password    ?? null,
      downloads_enabled: body.downloadsEnabled ?? true,
    })
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ gallery: data }, { status: 201 })
}
