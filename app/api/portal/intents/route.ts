import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'

export async function POST(req: NextRequest) {
  const { session_id, intents } = await req.json()
  if (!session_id) {
    return NextResponse.json({ error: 'session_id requerido' }, { status: 400 })
  }

  const db = createAdminClient()
  const { error } = await db
    .from('user_intents')
    .upsert(
      { session_id, intents: intents ?? [], updated_at: new Date().toISOString() },
      { onConflict: 'session_id' }
    )

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ ok: true })
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const session_id = searchParams.get('session_id')
  if (!session_id) {
    return NextResponse.json({ intents: [] })
  }

  const db = createAdminClient()
  const { data } = await db
    .from('user_intents')
    .select('intents')
    .eq('session_id', session_id)
    .single()

  return NextResponse.json({ intents: data?.intents ?? [] })
}
