/**
 * WhaRentmies Provider — Wassenger API (wzap.chat white-label)
 * Docs: https://wassenger.com/docs
 * Auth: Token header (NOT Bearer)
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
import {
  ProviderAuthError,
  ProviderQuotaError,
  ProviderValidationError,
  ProviderRateLimitError,
  ProviderServerError,
} from './errors'

const BASE_URL = 'https://api.wassenger.com/v1'
const TIMEOUT_MS = 10_000
const RETRY_DELAYS = [200, 400, 800]

function getEnv() {
  return {
    token: process.env.WHARENTMIES_API_TOKEN ?? '',
    deviceId: process.env.WHARENTMIES_DEVICE_ID ?? '',
  }
}

async function fetchWithRetry(url: string, init: RequestInit, attempt = 0): Promise<Response> {
  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS)

  let res: Response
  try {
    res = await fetch(url, { ...init, signal: controller.signal })
  } catch (err) {
    clearTimeout(timer)
    if (attempt < RETRY_DELAYS.length) {
      await new Promise((r) => setTimeout(r, RETRY_DELAYS[attempt]))
      return fetchWithRetry(url, init, attempt + 1)
    }
    throw err
  }
  clearTimeout(timer)

  // Retry on 5xx (except 402/429 which need special handling)
  if (res.status >= 500 && attempt < RETRY_DELAYS.length) {
    await new Promise((r) => setTimeout(r, RETRY_DELAYS[attempt]))
    return fetchWithRetry(url, init, attempt + 1)
  }

  return res
}

async function handleError(provider: string, res: Response): Promise<never> {
  const body = await res.text().catch(() => '')
  switch (res.status) {
    case 401: throw new ProviderAuthError(provider)
    case 402: throw new ProviderQuotaError(provider)
    case 422: {
      let fields: unknown = body
      try { fields = JSON.parse(body) } catch { /* use raw body */ }
      throw new ProviderValidationError(provider, fields)
    }
    case 429: {
      const retryAfter = parseInt(res.headers.get('retry-after') ?? '5', 10) * 1000
      throw new ProviderRateLimitError(provider, retryAfter)
    }
    default:
      throw new ProviderServerError(provider, res.status, body)
  }
}

function buildHeaders(): HeadersInit {
  return {
    'Content-Type': 'application/json',
    'Token': getEnv().token,
  }
}

export class WharentmiesProvider implements WhatsAppProvider {
  readonly id = 'wharentmies' as const

  async sendText(to: string, text: string, options?: SendOptions): Promise<MessageResult> {
    const res = await fetchWithRetry(`${BASE_URL}/messages`, {
      method: 'POST',
      headers: buildHeaders(),
      body: JSON.stringify({
        phone: to,
        message: text,
        priority: options?.priority ?? 'normal',
        ...(options?.quoteMessageId ? { quotedMessageId: options.quoteMessageId } : {}),
        data: { agentId: options?.agentId ?? 'rentmies-ema' },
      }),
    })

    if (!res.ok) await handleError('wharentmies', res)

    const json = (await res.json()) as { id?: string; status?: string }
    return {
      provider: 'wharentmies',
      externalId: json.id ?? '',
      status: 'queued',
      timestamp: new Date(),
      raw: json,
    }
  }

  async sendMedia(to: string, media: MediaPayload, options?: SendOptions): Promise<MessageResult> {
    const res = await fetchWithRetry(`${BASE_URL}/messages`, {
      method: 'POST',
      headers: buildHeaders(),
      body: JSON.stringify({
        phone: to,
        media: { url: media.url, caption: media.caption ?? '' },
        priority: options?.priority ?? 'normal',
        data: { agentId: options?.agentId ?? 'rentmies-ema' },
      }),
    })

    if (!res.ok) await handleError('wharentmies', res)

    const json = (await res.json()) as { id?: string }
    return {
      provider: 'wharentmies',
      externalId: json.id ?? '',
      status: 'queued',
      timestamp: new Date(),
      raw: json,
    }
  }

  async sendTemplate(to: string, template: TemplatePayload): Promise<MessageResult> {
    // ASSUMPTION: Wassenger template sending uses same /messages endpoint with template object
    const res = await fetchWithRetry(`${BASE_URL}/messages`, {
      method: 'POST',
      headers: buildHeaders(),
      body: JSON.stringify({
        phone: to,
        template: { name: template.name, language: template.language, components: template.components ?? [] },
      }),
    })

    if (!res.ok) await handleError('wharentmies', res)

    const json = (await res.json()) as { id?: string }
    return {
      provider: 'wharentmies',
      externalId: json.id ?? '',
      status: 'queued',
      timestamp: new Date(),
      raw: json,
    }
  }

  async getMessageStatus(messageId: string): Promise<MessageStatus> {
    const res = await fetchWithRetry(`${BASE_URL}/messages/${messageId}`, {
      method: 'GET',
      headers: buildHeaders(),
    })

    if (!res.ok) await handleError('wharentmies', res)

    const json = (await res.json()) as { status?: string }
    const STATUS_MAP: Record<string, MessageStatus> = {
      queued: 'queued',
      sent: 'sent',
      delivered: 'delivered',
      read: 'read',
      failed: 'failed',
    }
    return STATUS_MAP[json.status ?? ''] ?? 'queued'
  }

  async validateNumber(phone: string): Promise<NumberValidationResult> {
    const { deviceId } = getEnv()
    const res = await fetchWithRetry(`${BASE_URL}/devices/${deviceId}/numbers/validate`, {
      method: 'POST',
      headers: buildHeaders(),
      body: JSON.stringify({ phones: [phone] }),
    })

    if (!res.ok) await handleError('wharentmies', res)

    const json = (await res.json()) as Array<{ phone: string; exists: boolean }>
    const entry = json[0] ?? { phone, exists: false }

    return {
      phone: entry.phone,
      exists: entry.exists,
      provider: 'wharentmies',
      checkedAt: new Date(),
    }
  }
}

export const wharentmiesProvider = new WharentmiesProvider()
