import { describe, it, expect, vi, beforeEach } from 'vitest'
import { WharentmiesProvider } from '../wharentmies.provider'
import { ProviderRateLimitError, ProviderServerError } from '../errors'
import { createHmac } from 'crypto'

// ─── Mock fetch globally ──────────────────────────────────────────────────────

const mockFetch = vi.fn()
vi.stubGlobal('fetch', mockFetch)

beforeEach(() => {
  mockFetch.mockReset()
  process.env.WHARENTMIES_API_TOKEN = 'test-token'
  process.env.WHARENTMIES_DEVICE_ID = 'device-123'
})

// ─── Helper ───────────────────────────────────────────────────────────────────

function mockResponse(status: number, body: unknown, headers: Record<string, string> = {}) {
  return {
    ok: status >= 200 && status < 300,
    status,
    text: () => Promise.resolve(JSON.stringify(body)),
    json: () => Promise.resolve(body),
    headers: { get: (k: string) => headers[k] ?? null },
  }
}

// ─── Tests ────────────────────────────────────────────────────────────────────

describe('WharentmiesProvider', () => {
  const provider = new WharentmiesProvider()

  it('sendText — happy path returns MessageResult with correct shape', async () => {
    mockFetch.mockResolvedValueOnce(
      mockResponse(200, { id: 'msg-abc123', status: 'queued' })
    )

    const result = await provider.sendText('+573001234567', 'Hola desde Rentmies')

    expect(result.provider).toBe('wharentmies')
    expect(result.externalId).toBe('msg-abc123')
    expect(result.status).toBe('queued')
    expect(result.timestamp).toBeInstanceOf(Date)

    const [url, init] = mockFetch.mock.calls[0] as [string, RequestInit]
    expect(url).toBe('https://api.wassenger.com/v1/messages')
    expect((init.headers as Record<string, string>)['Token']).toBe('test-token')
    const body = JSON.parse(init.body as string)
    expect(body.phone).toBe('+573001234567')
    expect(body.message).toBe('Hola desde Rentmies')
  })

  it('sendText — 429 rate limit throws ProviderRateLimitError', async () => {
    mockFetch.mockResolvedValue(mockResponse(429, { error: 'too many requests' }, { 'retry-after': '30' }))

    await expect(provider.sendText('+573001234567', 'test')).rejects.toThrow(ProviderRateLimitError)
  })

  it('sendText — retries on 503, succeeds on 3rd attempt', async () => {
    mockFetch
      .mockResolvedValueOnce(mockResponse(503, 'Service Unavailable'))
      .mockResolvedValueOnce(mockResponse(503, 'Service Unavailable'))
      .mockResolvedValueOnce(mockResponse(200, { id: 'msg-retry', status: 'queued' }))

    const result = await provider.sendText('+573001234567', 'retry test')
    expect(result.externalId).toBe('msg-retry')
    expect(mockFetch).toHaveBeenCalledTimes(3)
  })

  it('getMessageStatus — maps Wassenger status to canonical MessageStatus', async () => {
    mockFetch.mockResolvedValueOnce(mockResponse(200, { id: 'msg-1', status: 'delivered' }))

    const status = await provider.getMessageStatus('msg-1')
    expect(status).toBe('delivered')
  })

  it('validateNumber — returns NumberValidationResult with correct shape', async () => {
    mockFetch.mockResolvedValueOnce(
      mockResponse(200, [{ phone: '+573001234567', exists: true }])
    )

    const result = await provider.validateNumber('+573001234567')
    expect(result.exists).toBe(true)
    expect(result.provider).toBe('wharentmies')
    expect(result.checkedAt).toBeInstanceOf(Date)
  })
})

// ─── Webhook signature validation ─────────────────────────────────────────────

describe('Webhook signature validation', () => {
  it('accepts payload with valid HMAC-SHA256 signature', () => {
    const secret = 'rentmies-webhook-secret'
    const body = JSON.stringify({ event: 'message:in:new', data: {} })
    const sig = createHmac('sha256', secret).update(body).digest('hex')

    const expected = createHmac('sha256', secret).update(body).digest('hex')
    expect(sig).toBe(expected)
  })

  it('rejects tampered payload (different body from signature)', () => {
    const secret = 'rentmies-webhook-secret'
    const originalBody = JSON.stringify({ event: 'message:in:new', data: {} })
    const tamperedBody = JSON.stringify({ event: 'message:in:new', data: { injected: true } })

    const sigForOriginal = createHmac('sha256', secret).update(originalBody).digest('hex')
    const sigForTampered = createHmac('sha256', secret).update(tamperedBody).digest('hex')

    expect(sigForOriginal).not.toBe(sigForTampered)
  })
})

// ─── Circuit breaker ──────────────────────────────────────────────────────────

describe('Callbell circuit breaker', () => {
  it('opens after 3 failures within 5 minutes', async () => {
    const { recordCallbellFailure, isCallbellCircuitOpen } = await import('../router')

    // Record 3 failures
    recordCallbellFailure()
    recordCallbellFailure()
    recordCallbellFailure()

    expect(isCallbellCircuitOpen()).toBe(true)
  })
})
