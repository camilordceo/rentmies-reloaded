/**
 * Callbell Provider — wraps existing lib/callbell.ts with the WhatsAppProvider interface.
 * Does NOT change existing behavior — just adds the abstraction layer.
 */

import type {
  WhatsAppProvider,
  SendOptions,
  MediaPayload,
  TemplatePayload,
  MessageResult,
  MessageStatus,
  NumberValidationResult,
} from './types'
import { ProviderAuthError, ProviderServerError } from './errors'

const BASE_URL = 'https://api.callbell.eu/v1'
const TIMEOUT_MS = 10_000

function getToken(): string {
  return process.env.CALLBELL_API_KEY ?? ''
}

async function post(path: string, body: unknown): Promise<unknown> {
  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS)

  let res: Response
  try {
    res = await fetch(`${BASE_URL}${path}`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${getToken()}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
      signal: controller.signal,
    })
  } finally {
    clearTimeout(timer)
  }

  if (res.status === 401) throw new ProviderAuthError('callbell')
  if (!res.ok) {
    const text = await res.text().catch(() => '')
    throw new ProviderServerError('callbell', res.status, text)
  }

  return res.json()
}

export class CallbellProvider implements WhatsAppProvider {
  readonly id = 'callbell' as const

  // ASSUMPTION: channelUuid is passed via options.sessionId for callbell
  async sendText(to: string, text: string, options?: SendOptions): Promise<MessageResult> {
    const json = (await post('/messages/send', {
      to: to.startsWith('+') ? to : `+${to}`,
      from: 'whatsapp',
      type: 'text',
      channel_uuid: options?.sessionId ?? '',
      content: { text },
    })) as { message?: { uuid?: string; status?: string } }

    return {
      provider: 'callbell',
      externalId: json.message?.uuid ?? '',
      status: 'queued',
      timestamp: new Date(),
      raw: json,
    }
  }

  async sendMedia(to: string, media: MediaPayload, options?: SendOptions): Promise<MessageResult> {
    // ASSUMPTION: Callbell media uses attachment type
    const json = (await post('/messages/send', {
      to: to.startsWith('+') ? to : `+${to}`,
      from: 'whatsapp',
      type: 'attachment',
      channel_uuid: options?.sessionId ?? '',
      content: { url: media.url, caption: media.caption },
    })) as { message?: { uuid?: string } }

    return {
      provider: 'callbell',
      externalId: json.message?.uuid ?? '',
      status: 'queued',
      timestamp: new Date(),
      raw: json,
    }
  }

  async sendTemplate(_to: string, _template: TemplatePayload): Promise<MessageResult> {
    // ASSUMPTION: Callbell does not support templates natively; escalate to meta provider if needed
    throw new Error('Callbell does not support template messages')
  }

  async getMessageStatus(_messageId: string): Promise<MessageStatus> {
    // ASSUMPTION: Callbell status is tracked via webhook acks, not polled
    return 'sent'
  }

  async validateNumber(phone: string): Promise<NumberValidationResult> {
    // ASSUMPTION: Callbell has no number validation API; return optimistic result
    return {
      phone,
      exists: true,
      provider: 'callbell',
      checkedAt: new Date(),
    }
  }
}

export const callbellProvider = new CallbellProvider()
