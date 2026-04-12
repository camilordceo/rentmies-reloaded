/**
 * POST /api/facebook/send-message
 *
 * Sends a text message to a Facebook Messenger lead on behalf of a human agent.
 * Enforces:
 *  - Authenticated user (Supabase cookie session)
 *  - empresa_id scoping (agent can only message their own empresa's leads)
 *  - 24-hour Messenger window — returns 422 if window has expired
 *
 * Body: { conversation_id: string, message: string }
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/client'
import { createAdminClient } from '@/lib/supabase/admin'
import { sendMessage, isWithin24hWindow, hashPsid } from '@/lib/facebook'
import { logger } from '@/lib/logger'

export const maxDuration = 30

export async function POST(req: NextRequest): Promise<NextResponse> {
  // ── 1. Auth ──────────────────────────────────────────────────────────────
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const db = createAdminClient()

  // Resolve empresa_id from profile
  const { data: profile } = await db
    .from('profiles')
    .select('empresa_id, rol')
    .eq('id', user.id)
    .single()

  if (!profile?.empresa_id && profile?.rol !== 'admin') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  // ── 2. Parse body ─────────────────────────────────────────────────────────
  let body: { conversation_id?: string; message?: string }
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  const { conversation_id, message } = body
  if (!conversation_id || !message?.trim()) {
    return NextResponse.json(
      { error: 'conversation_id and message are required' },
      { status: 400 }
    )
  }

  // ── 3. Load conversation + verify ownership ───────────────────────────────
  const { data: conv } = await db
    .from('facebook_conversations')
    .select('id, empresa_id, user_psid, window_expires_at, facebook_page_id')
    .eq('id', conversation_id)
    .single()

  if (!conv) {
    return NextResponse.json({ error: 'Conversation not found' }, { status: 404 })
  }

  // Admin can message any; agents only their empresa
  if (profile.rol !== 'admin' && conv.empresa_id !== profile.empresa_id) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  // ── 4. Enforce 24-hour window ─────────────────────────────────────────────
  if (conv.window_expires_at && !isWithin24hWindow(conv.window_expires_at)) {
    return NextResponse.json(
      {
        error: 'messaging_window_expired',
        message: 'Han pasado más de 24 horas desde el último mensaje del usuario. No es posible responder por Messenger estándar.',
      },
      { status: 422 }
    )
  }

  // ── 5. Get page access token ──────────────────────────────────────────────
  const { data: page } = await db
    .from('facebook_pages')
    .select('page_access_token, page_id')
    .eq('id', conv.facebook_page_id)
    .single()

  if (!page) {
    return NextResponse.json({ error: 'Facebook page not configured' }, { status: 500 })
  }

  // ── 6. Send via Meta Send API ─────────────────────────────────────────────
  let metaResponse: Awaited<ReturnType<typeof sendMessage>>
  try {
    metaResponse = await sendMessage(page.page_access_token, conv.user_psid, message.trim())
  } catch (err) {
    logger.error('facebook-send-message', 'Meta Send API failed', {
      empresa_id: conv.empresa_id,
      context: {
        psid_hash: hashPsid(conv.user_psid),
        error: err instanceof Error ? err.message : String(err),
      },
    })
    return NextResponse.json(
      { error: 'Failed to send message via Facebook' },
      { status: 502 }
    )
  }

  // ── 7. Persist outbound message ───────────────────────────────────────────
  await db.from('facebook_messages').insert({
    conversation_id: conv.id,
    empresa_id: conv.empresa_id,
    direction: 'outbound',
    message_text: message.trim(),
    message_mid: metaResponse.message_id,
    sender_type: 'agent',
    metadata: { sent_by_user_id: user.id },
  })

  logger.info('facebook-send-message', 'Outbound message sent', {
    empresa_id: conv.empresa_id,
    context: { conversation_id: conv.id, message_id: metaResponse.message_id },
  })

  return NextResponse.json({
    success: true,
    message_id: metaResponse.message_id,
  })
}
