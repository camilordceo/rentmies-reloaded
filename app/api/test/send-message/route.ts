import { NextRequest, NextResponse } from 'next/server'
import { sendWhatsAppMessage } from '@/lib/callbell'
import { processIncomingMessage } from '@/lib/conversation-manager'
import { logger } from '@/lib/logger'
import type { CallbellWebhookPayload } from '@/lib/types'

export const maxDuration = 30

// POST /api/test/send-message
// Body: { to, channelUuid, text } — sends a real message via Callbell
export async function POST(req: NextRequest) {
  let body: Record<string, string>
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  const { to, channelUuid, text, mode } = body as Record<string, string>

  if (mode === 'simulate') {
    // Simulate webhook processing without actually sending via Callbell
    const { agentNumber, contactPhone, contactName } = body as Record<string, string>
    if (!agentNumber || !contactPhone || !text) {
      return NextResponse.json({ error: 'agentNumber, contactPhone, and text required' }, { status: 400 })
    }

    const simulatedPayload: CallbellWebhookPayload['payload'] = {
      to: agentNumber,
      from: contactPhone,
      text,
      status: 'received',
      channel: 'whatsapp',
      contact: {
        name: contactName || 'Test User',
        uuid: 'test-uuid',
        source: 'whatsapp',
        phoneNumber: contactPhone,
        conversationHref: '',
      },
    }

    try {
      await processIncomingMessage(simulatedPayload)
      return NextResponse.json({ success: true, message: 'Simulation completed — check logs for details' })
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err)
      logger.error('test-panel', `Simulation error: ${msg}`)
      return NextResponse.json({ error: msg }, { status: 500 })
    }
  }

  // Real send
  if (!to || !channelUuid || !text) {
    return NextResponse.json({ error: 'to, channelUuid, and text required' }, { status: 400 })
  }

  try {
    const result = await sendWhatsAppMessage({ to, channelUuid, text })
    return NextResponse.json({ success: true, result })
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err)
    logger.error('test-panel', `Send error: ${msg}`)
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}
