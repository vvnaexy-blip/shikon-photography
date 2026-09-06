import { NextRequest, NextResponse } from 'next/server'
import { isSupabaseConfigured, tryGetSupabaseClient } from '@/lib/supabase'

type Ctx = { params: Promise<{ id: string }> }

export async function DELETE(_req: NextRequest, { params }: Ctx) {
  const { id } = await params
  if (!isSupabaseConfigured) return NextResponse.json({ error: 'Supabase not configured' }, { status: 503 })

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { error } = await (tryGetSupabaseClient()!.from('photos') as any).delete().eq('id', id)
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return new NextResponse(null, { status: 204 })
}

export async function PATCH(req: NextRequest, { params }: Ctx) {
  const { id } = await params
  if (!isSupabaseConfigured) return NextResponse.json({ error: 'Supabase not configured' }, { status: 503 })

  let body: Record<string, unknown>
  try { body = await req.json() }
  catch { return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 }) }

  const update: Record<string, unknown> = {}
  if ('displayOrder' in body) update.display_order = body.displayOrder
  if ('caption'      in body) update.caption       = body.caption

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data, error } = await (tryGetSupabaseClient()!.from('photos') as any)
    .update(update).eq('id', id).select().single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ photo: data })
}
