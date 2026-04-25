import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'

export const dynamic = 'force-dynamic'

/**
 * GET /api/portal/conversations?session_id=xxx
 * Returns the last 30 messages for a portal session so the atlas client can
 * restore conversation history on page reload.
 */
export async function GET(req: NextRequest) {
  const session_id = req.nextUrl.searchParams.get('session_id')
  if (!session_id) {
    return NextResponse.json({ error: 'session_id requerido' }, { status: 400 })
  }

  const db = createAdminClient()

  const { data: session } = await db
    .from('portal_sessions')
    .select('conversacion_id, last_response_id')
    .eq('session_id', session_id)
    .single()

  if (!session?.conversacion_id) {
    return NextResponse.json({ messages: [], response_id: null, conversation_id: null })
  }

  const { data: msgs } = await db
    .from('mensaje')
    .select('rol, texto, created_at, metadata')
    .eq('conversacion_id', session.conversacion_id)
    .order('created_at', { ascending: true })
    .limit(30)

  const messages = (msgs ?? []).map((m) => ({
    role: m.rol === 'user' ? ('user' as const) : ('assistant' as const),
    text: m.texto,
    created_at: m.created_at,
  }))

  return NextResponse.json({
    messages,
    response_id: session.last_response_id ?? null,
    conversation_id: session.conversacion_id,
  })
}
