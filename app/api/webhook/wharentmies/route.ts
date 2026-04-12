import { NextRequest, NextResponse } from 'next/server'
import { createHmac } from 'crypto'
import { createAdminClient } from '@/lib/supabase/admin'
import { processIncomingMessage } from '@/lib/conversation-manager'
import { logger } from '@/lib/logger'
import type { CallbellWebhookPayload } from '@/lib/types'

export const maxDuration = 30

// ─── Signature validation ────────────────────────────────────────────────────

function validateSignature(rawBody: string, signature: string): boolean {
  const secret = process.env.WHARENTMIES_WEBHOOK_SECRET
  if (!secret) return true // skip validation if secret not configured
  const expected = createHmac('sha256', secret).update(rawBody).digest('hex')
  return signature === expected
}

// ─── Phone hashing for logs (GDPR/PII) ───────────────────────────────────────

function hashPhone(phone: string): string {
  return createHmac('sha256', 'rentmies-log-salt').update(phone).digest('hex').slice(0, 12)
}

// ─── Normalize Wassenger inbound event to Callbell-compatible payload ─────────

function normalizeInbound(data: WassengerMessageData): CallbellWebhookPayload['payload'] {
  return {
    to: data.toNumber ?? '',
    from: data.fromNumber ?? '',
    text: data.text ?? null,
    status: 'received',
    channel: 'whatsapp',
    contact: {
      name: data.chat?.name ?? null,
      uuid: data.id ?? '',
      source: 'wharentmies',
      phoneNumber: data.fromNumber ?? '',
      conversationHref: '',
    },
  }
}

// ─── Wassenger event types ────────────────────────────────────────────────────

interface WassengerMessageData {
  id?: string
  fromNumber?: string
  toNumber?: string
  text?: string
  type?: string
  status?: string
  chat?: { id?: string; name?: string }
  device?: { id?: string }
}

interface WassengerEvent {
  event: string
  timestamp?: number
  data?: WassengerMessageData
}

// ─── Main handler ─────────────────────────────────────────────────────────────

export async function POST(req: NextRequest): Promise<NextResponse> {
  const rawBody = await req.text()
  const signature = req.headers.get('x-wharentmies-signature') ?? ''

  // Validate signature — return 401 before any processing
  if (!validateSignature(rawBody, signature)) {
    return NextResponse.json({ error: 'Invalid signature' }, { status: 401 })
  }

  // Return 200 immediately to avoid Wassenger timeout
  // Process asynchronously (Vercel allows 30s with maxDuration)

  let event: WassengerEvent
  try {
    event = JSON.parse(rawBody) as WassengerEvent
  } catch {
    return NextResponse.json({ status: 'ok' })
  }

  // Process event async (fire and forget on health pings)
  if (event.event) {
    await processEvent(event).catch((err: unknown) => {
      logger.error('wharentmies-webhook', 'Unhandled error processing event', {
        context: {
          event: event.event,
          error: err instanceof Error ? err.message : String(err),
        },
      })
    })
  }

  return NextResponse.json({ status: 'ok' })
}

export async function GET(): Promise<NextResponse> {
  return NextResponse.json({ status: 'ok', provider: 'wharentmies' })
}

// ─── Event processor ──────────────────────────────────────────────────────────

async function processEvent(event: WassengerEvent): Promise<void> {
  const db = createAdminClient()
  const data = event.data ?? {}
  const phone = data.fromNumber ?? data.toNumber ?? ''
  const direction = event.event === 'message:in:new' ? 'inbound' : 'outbound'

  // 1. Persist raw event to whatsapp_events
  await db.from('whatsapp_events').insert({
    provider: 'wharentmies',
    event_type: event.event,
    external_message_id: data.id ?? null,
    phone: phone,
    direction,
    content: {
      text: data.text ?? null,
      type: data.type ?? null,
      status: data.status ?? null,
    },
    status: data.status ?? null,
    raw_payload: event as unknown as Record<string, unknown>,
    processed_at: new Date().toISOString(),
  })

  logger.info('wharentmies-webhook', `Event: ${event.event}`, {
    context: { event_type: event.event, phone_hash: hashPhone(phone) },
  })

  // 2. For inbound messages only — trigger AI pipeline
  if (event.event !== 'message:in:new') return
  if (!data.text && data.type === 'text') return // empty text

  const normalized = normalizeInbound(data)
  await processIncomingMessage(normalized)
}
