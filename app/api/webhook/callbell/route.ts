import { NextRequest, NextResponse } from 'next/server'
import { processIncomingMessage } from '@/lib/conversation-manager'
import { logger } from '@/lib/logger'
import type { CallbellWebhookPayload } from '@/lib/types'

export const maxDuration = 30

export async function POST(req: NextRequest) {
  let body: Partial<CallbellWebhookPayload> = {}

  try {
    body = await req.json()
  } catch {
    // Malformed JSON — still return 200 for Callbell health checks
    return NextResponse.json({ status: 'ok' }, { status: 200 })
  }

  // Health checks / pings from Callbell (no event field)
  if (!body.event) {
    return NextResponse.json({ status: 'ok' }, { status: 200 })
  }

  // Only process incoming messages
  if (body.event !== 'message_created') {
    return NextResponse.json({ status: 'ok' }, { status: 200 })
  }

  const payload = body.payload
  if (!payload) {
    return NextResponse.json({ status: 'ok' }, { status: 200 })
  }

  // Only process received (inbound) messages
  if (payload.status !== 'received') {
    return NextResponse.json({ status: 'ok' }, { status: 200 })
  }

  // Process async — always return 200 immediately
  // We handle the await here (Vercel allows 30s with maxDuration above)
  try {
    await processIncomingMessage(payload as CallbellWebhookPayload['payload'])
  } catch (err) {
    logger.error('webhook', 'Unhandled error processing message', {
      error: err instanceof Error ? err.message : String(err),
      from: payload.from,
      to: payload.to,
    })
    // NEVER return 500 to Callbell — it will disable the webhook
  }

  return NextResponse.json({ status: 'ok' }, { status: 200 })
}

// Callbell sometimes sends GET to verify the endpoint
export async function GET() {
  return NextResponse.json({ status: 'ok' }, { status: 200 })
}
