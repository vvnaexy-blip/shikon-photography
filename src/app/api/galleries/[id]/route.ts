import { NextRequest, NextResponse } from 'next/server'
import { isSupabaseConfigured, tryGetSupabaseClient } from '@/lib/supabase'

type Ctx = { params: Promise<{ id: string }> }

export async function GET(_req: NextRequest, { params }: Ctx) {
  const { id } = await params
  if (!isSupabaseConfigured) return NextResponse.json({ error: 'Supabase not configured' }, { status: 503 })

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data, error } = await (tryGetSupabaseClient()!.from('galleries') as any)
    .select('*, photos(*)')
    .eq('id', id)
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 404 })
  return NextResponse.json({ gallery: data })
}

export async function PATCH(req: NextRequest, { params }: Ctx) {
  const { id } = await params
  if (!isSupabaseConfigured) return NextResponse.json({ error: 'Supabase not configured' }, { status: 503 })

  let body: Record<string, unknown>
  try { body = await req.json() }
  catch { return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 }) }

  const update: Record<string, unknown> = {}
  if ('clientName'       in body) update.client_name       = body.clientName
  if ('title'            in body) update.title             = body.title
  if ('slug'             in body) update.slug              = body.slug
  if ('date'             in body) update.date              = body.date
  if ('location'         in body) update.location          = body.location
  if ('category'         in body) update.category          = body.category
  if ('description'      in body) update.description       = body.description
  if ('coverImage'       in body) update.cover_image       = body.coverImage
  if ('isPrivate'        in body) update.is_private        = body.isPrivate
  if ('password'         in body) update.password          = body.password
  if ('downloadsEnabled' in body) update.downloads_enabled = body.downloadsEnabled

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data, error } = await (tryGetSupabaseClient()!.from('galleries') as any)
    .update(update)
    .eq('id', id)
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ gallery: data })
}

export async function DELETE(_req: NextRequest, { params }: Ctx) {
  const { id } = await params
  if (!isSupabaseConfigured) return NextResponse.json({ error: 'Supabase not configured' }, { status: 503 })

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { error } = await (tryGetSupabaseClient()!.from('galleries') as any).delete().eq('id', id)
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return new NextResponse(null, { status: 204 })
}
