/**
 * GET /api/facebook/conversations
 *
 * Lists Facebook Messenger conversations for the authenticated user's empresa.
 * Returns conversations with their latest message, ordered by last_message_at DESC.
 *
 * Query params:
 *   status  — filter by status (active|closed|ai_handling|human_handling), default: all
 *   page    — pagination page (1-based), default: 1
 *   limit   — items per page, default: 20, max: 100
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/client'
import { createAdminClient } from '@/lib/supabase/admin'

export const maxDuration = 10

const VALID_STATUSES = ['active', 'closed', 'ai_handling', 'human_handling'] as const
type ConversationStatus = typeof VALID_STATUSES[number]

export async function GET(req: NextRequest): Promise<NextResponse> {
  // ── Auth ─────────────────────────────────────────────────────────────────
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const db = createAdminClient()

  const { data: profile } = await db
    .from('profiles')
    .select('empresa_id, rol')
    .eq('id', user.id)
    .single()

  if (!profile) {
    return NextResponse.json({ error: 'Profile not found' }, { status: 403 })
  }

  // ── Query params ──────────────────────────────────────────────────────────
  const params = req.nextUrl.searchParams
  const statusParam = params.get('status')
  const pageParam = Math.max(1, parseInt(params.get('page') ?? '1', 10))
  const limitParam = Math.min(100, Math.max(1, parseInt(params.get('limit') ?? '20', 10)))
  const offset = (pageParam - 1) * limitParam

  const statusFilter: ConversationStatus | null =
    statusParam && VALID_STATUSES.includes(statusParam as ConversationStatus)
      ? (statusParam as ConversationStatus)
      : null

  // ── Query ─────────────────────────────────────────────────────────────────
  let query = db
    .from('facebook_conversations')
    .select(
      `
      id,
      empresa_id,
      user_psid,
      user_name,
      status,
      last_message_at,
      window_expires_at,
      metadata,
      created_at,
      facebook_pages ( page_name, page_id ),
      facebook_messages (
        id,
        direction,
        message_text,
        sender_type,
        created_at
      )
      `,
      { count: 'exact' }
    )
    .order('last_message_at', { ascending: false })
    .range(offset, offset + limitParam - 1)

  // Scope to empresa (admin sees all if no empresa_id)
  if (profile.rol !== 'admin' || profile.empresa_id) {
    const empresaId = profile.empresa_id
    if (!empresaId) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }
    query = query.eq('empresa_id', empresaId)
  }

  if (statusFilter) {
    query = query.eq('status', statusFilter)
  }

  // Latest message per conversation — we fetch all messages and slice in JS
  // (Supabase doesn't support nested ORDER + LIMIT easily in 1 query)
  const { data: conversations, error, count } = await query

  if (error) {
    return NextResponse.json({ error: 'Failed to fetch conversations' }, { status: 500 })
  }

  // Attach only the latest message per conversation
  const result = (conversations ?? []).map((conv) => {
    const messages = Array.isArray(conv.facebook_messages)
      ? [...conv.facebook_messages].sort(
          (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        )
      : []

    const { facebook_messages: _, ...rest } = conv as typeof conv & { facebook_messages: unknown }
    return {
      ...rest,
      latest_message: messages[0] ?? null,
      unread_count: messages.filter((m) => m.direction === 'inbound').length,
    }
  })

  return NextResponse.json({
    data: result,
    pagination: {
      page: pageParam,
      limit: limitParam,
      total: count ?? 0,
      total_pages: Math.ceil((count ?? 0) / limitParam),
    },
  })
}
