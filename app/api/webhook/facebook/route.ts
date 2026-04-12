/**
 * /api/webhook/facebook
 *
 * Handles Facebook Messenger Platform webhook events for all connected
 * empresa pages in a single endpoint (multi-tenant via PAGE_ID routing).
 *
 * GET  — Meta webhook verification (hub.challenge handshake)
 * POST — Inbound Messenger events (messages, postbacks, etc.)
 *
 * CRITICAL: POST must ALWAYS return 200. Meta deactivates webhooks
 * that fail or time out. Process async, respond immediately.
 */

import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import {
  verifyWebhookSignature,
  parseWebhookEvent,
  compute24hWindowExpiry,
  getUserProfile,
  hashPsid,
} from '@/lib/facebook'
import { logger } from '@/lib/logger'
import type { FacebookWebhookEvent, NormalizedFacebookMessage } from '@/lib/types/facebook'

export const maxDuration = 30

// ─── GET: Webhook verification ────────────────────────────────────────────────

export async function GET(req: NextRequest): Promise<NextResponse> {
  const params = req.nextUrl.searchParams
  const mode = params.get('hub.mode')
  const token = params.get('hub.verify_token')
  const challenge = params.get('hub.challenge')

  if (mode === 'subscribe' && token === process.env.FACEBOOK_VERIFY_TOKEN) {
    logger.info('facebook-webhook', 'Webhook verification successful')
    return new NextResponse(challenge, { status: 200 })
  }

  logger.warn('facebook-webhook', 'Webhook verification failed', {
    context: { mode, token_match: token === process.env.FACEBOOK_VERIFY_TOKEN },
  })
  return new NextResponse('Forbidden', { status: 403 })
}

// ─── POST: Inbound events ─────────────────────────────────────────────────────

export async function POST(req: NextRequest): Promise<NextResponse> {
  const rawBody = await req.text()

  // Verify Meta HMAC signature before any processing
  const signature = req.headers.get('x-hub-signature-256') ?? ''
  const appSecret = process.env.FACEBOOK_APP_SECRET ?? ''

  if (appSecret && !verifyWebhookSignature(rawBody, signature, appSecret)) {
    logger.warn('facebook-webhook', 'Invalid signature — ignoring request')
    // Still return 200 so Meta doesn't disable the webhook, but don't process
    return NextResponse.json({ status: 'ok' })
  }

  let body: FacebookWebhookEvent
  try {
    body = JSON.parse(rawBody) as FacebookWebhookEvent
  } catch {
    return NextResponse.json({ status: 'ok' })
  }

  // Only handle page object events
  if (body.object !== 'page') {
    return NextResponse.json({ status: 'ok' })
  }

  const messages = parseWebhookEvent(body)
  if (messages.length === 0) {
    return NextResponse.json({ status: 'ok' })
  }

  // Process all messages async — errors are caught per-message so one failure
  // doesn't block others
  await Promise.allSettled(
    messages.map((msg) =>
      processMessage(msg).catch((err: unknown) => {
        logger.error('facebook-webhook', 'Unhandled error processing message', {
          context: {
            psid_hash: hashPsid(msg.userPsid),
            page_id: msg.pageId,
            error: err instanceof Error ? err.message : String(err),
          },
        })
      })
    )
  )

  return NextResponse.json({ status: 'ok' })
}

// ─── Message processor ────────────────────────────────────────────────────────

async function processMessage(msg: NormalizedFacebookMessage): Promise<void> {
  const db = createAdminClient()

  // 1. Resolve empresa from PAGE_ID
  const { data: page } = await db
    .from('facebook_pages')
    .select('id, empresa_id, page_access_token, page_name')
    .eq('page_id', msg.pageId)
    .eq('is_active', true)
    .single()

  if (!page) {
    logger.warn('facebook-webhook', 'No active page found for PAGE_ID', {
      context: { page_id: msg.pageId },
    })
    return
  }

  logger.info('facebook-webhook', 'Processing inbound message', {
    empresa_id: page.empresa_id,
    context: { psid_hash: hashPsid(msg.userPsid), has_text: !!msg.messageText },
  })

  // 2. Upsert conversation (one per PSID per empresa)
  const windowExpiry = compute24hWindowExpiry(msg.timestamp)

  const { data: conv, error: convError } = await db
    .from('facebook_conversations')
    .upsert(
      {
        empresa_id: page.empresa_id,
        facebook_page_id: page.id,
        user_psid: msg.userPsid,
        last_message_at: new Date(msg.timestamp).toISOString(),
        window_expires_at: windowExpiry,
        status: 'active',
        metadata: msg.referral
          ? { referral: msg.referral }
          : {},
      },
      {
        onConflict: 'user_psid,empresa_id',
        ignoreDuplicates: false,
      }
    )
    .select('id, user_name, lead_id')
    .single()

  if (convError || !conv) {
    logger.error('facebook-webhook', 'Failed to upsert conversation', {
      empresa_id: page.empresa_id,
      context: { error: convError?.message },
    })
    return
  }

  // 3. Fetch user profile if we don't have a name yet
  if (!conv.user_name && page.page_access_token) {
    const profile = await getUserProfile(page.page_access_token, msg.userPsid)
    if (profile) {
      const displayName = profile.name ?? [profile.first_name, profile.last_name].filter(Boolean).join(' ')
      await db
        .from('facebook_conversations')
        .update({ user_name: displayName })
        .eq('id', conv.id)
    }
  }

  // 4. Save inbound message
  if (msg.messageText || msg.hasAttachment) {
    await db.from('facebook_messages').insert({
      conversation_id: conv.id,
      empresa_id: page.empresa_id,
      direction: 'inbound',
      message_text: msg.messageText,
      message_mid: msg.messageMid,
      sender_type: 'lead',
      metadata: msg.hasAttachment ? { has_attachment: true } : {},
    })
  }

  // Phase 1: Manual handling only — no AI pipeline.
  // AI auto-response (Phase 2) will check for an active agente_ia with
  // canal='facebook_messenger' and dispatch to the orchestrator.
  logger.info('facebook-webhook', 'Message saved — awaiting manual response', {
    empresa_id: page.empresa_id,
    context: { conversation_id: conv.id },
  })
}
