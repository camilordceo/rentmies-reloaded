/**
 * Unit tests for Facebook Messenger webhook helpers
 * Run: npm test
 */

import { describe, it, expect } from 'vitest'
import { createHmac } from 'crypto'
import {
  verifyWebhookSignature,
  isWithin24hWindow,
  compute24hWindowExpiry,
  parseWebhookEvent,
  hashPsid,
} from '../lib/facebook'
import type { FacebookWebhookEvent } from '../lib/types/facebook'

// ─── verifyWebhookSignature ───────────────────────────────────────────────────

describe('verifyWebhookSignature', () => {
  const appSecret = 'test-app-secret-abc'
  const body = JSON.stringify({ object: 'page', entry: [] })

  function makeSignature(payload: string, secret: string): string {
    return 'sha256=' + createHmac('sha256', secret).update(payload).digest('hex')
  }

  it('returns true for a valid signature', () => {
    const sig = makeSignature(body, appSecret)
    expect(verifyWebhookSignature(body, sig, appSecret)).toBe(true)
  })

  it('returns false for a tampered body', () => {
    const sig = makeSignature(body, appSecret)
    expect(verifyWebhookSignature(body + 'x', sig, appSecret)).toBe(false)
  })

  it('returns false for a wrong secret', () => {
    const sig = makeSignature(body, 'wrong-secret')
    expect(verifyWebhookSignature(body, sig, appSecret)).toBe(false)
  })

  it('returns false when prefix is missing', () => {
    const bare = createHmac('sha256', appSecret).update(body).digest('hex')
    expect(verifyWebhookSignature(body, bare, appSecret)).toBe(false)
  })

  it('returns false for an empty signature', () => {
    expect(verifyWebhookSignature(body, '', appSecret)).toBe(false)
  })
})

// ─── isWithin24hWindow ────────────────────────────────────────────────────────

describe('isWithin24hWindow', () => {
  it('returns true for a timestamp 1 hour ago', () => {
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000).toISOString()
    expect(isWithin24hWindow(oneHourAgo)).toBe(true)
  })

  it('returns true for a timestamp 23h 59m ago', () => {
    const justUnder24h = new Date(Date.now() - (24 * 60 * 60 * 1000 - 60_000)).toISOString()
    expect(isWithin24hWindow(justUnder24h)).toBe(true)
  })

  it('returns false for a timestamp 25 hours ago', () => {
    const expired = new Date(Date.now() - 25 * 60 * 60 * 1000).toISOString()
    expect(isWithin24hWindow(expired)).toBe(false)
  })

  it('accepts a Date object', () => {
    const recent = new Date(Date.now() - 5000)
    expect(isWithin24hWindow(recent)).toBe(true)
  })
})

// ─── compute24hWindowExpiry ───────────────────────────────────────────────────

describe('compute24hWindowExpiry', () => {
  it('returns a timestamp exactly 24h after the input', () => {
    const now = Date.now()
    const expiry = compute24hWindowExpiry(now)
    const diff = new Date(expiry).getTime() - now
    expect(diff).toBe(24 * 60 * 60 * 1000)
  })

  it('returns an ISO string', () => {
    const expiry = compute24hWindowExpiry(Date.now())
    expect(expiry).toMatch(/^\d{4}-\d{2}-\d{2}T/)
  })
})

// ─── parseWebhookEvent ────────────────────────────────────────────────────────

describe('parseWebhookEvent', () => {
  const baseEvent: FacebookWebhookEvent = {
    object: 'page',
    entry: [
      {
        id: '111222333444',
        time: 1714000000000,
        messaging: [
          {
            sender: { id: 'psid_abc' },
            recipient: { id: '111222333444' },
            timestamp: 1714000000000,
            message: {
              mid: 'mid.$test123',
              text: 'Hola, quiero ver el apartamento',
            },
          },
        ],
      },
    ],
  }

  it('parses a normal inbound message', () => {
    const result = parseWebhookEvent(baseEvent)
    expect(result).toHaveLength(1)
    expect(result[0].userPsid).toBe('psid_abc')
    expect(result[0].pageId).toBe('111222333444')
    expect(result[0].messageText).toBe('Hola, quiero ver el apartamento')
    expect(result[0].messageMid).toBe('mid.$test123')
    expect(result[0].hasAttachment).toBe(false)
    expect(result[0].referral).toBeNull()
  })

  it('filters out echo messages', () => {
    const echoEvent: FacebookWebhookEvent = {
      ...baseEvent,
      entry: [
        {
          ...baseEvent.entry[0],
          messaging: [
            {
              ...baseEvent.entry[0].messaging[0],
              message: { mid: 'mid.$echo', is_echo: true },
            },
          ],
        },
      ],
    }
    expect(parseWebhookEvent(echoEvent)).toHaveLength(0)
  })

  it('filters out delivery receipts', () => {
    const deliveryEvent: FacebookWebhookEvent = {
      ...baseEvent,
      entry: [
        {
          ...baseEvent.entry[0],
          messaging: [
            {
              sender: { id: 'psid_abc' },
              recipient: { id: '111222333444' },
              timestamp: 1714000000000,
              delivery: { watermarks: [1714000000000], seq: 1 },
            },
          ],
        },
      ],
    }
    expect(parseWebhookEvent(deliveryEvent)).toHaveLength(0)
  })

  it('filters out read receipts', () => {
    const readEvent: FacebookWebhookEvent = {
      ...baseEvent,
      entry: [
        {
          ...baseEvent.entry[0],
          messaging: [
            {
              sender: { id: 'psid_abc' },
              recipient: { id: '111222333444' },
              timestamp: 1714000000000,
              read: { watermark: 1714000000000 },
            },
          ],
        },
      ],
    }
    expect(parseWebhookEvent(readEvent)).toHaveLength(0)
  })

  it('captures referral data from Marketplace messages', () => {
    const marketplaceEvent: FacebookWebhookEvent = {
      ...baseEvent,
      entry: [
        {
          ...baseEvent.entry[0],
          messaging: [
            {
              ...baseEvent.entry[0].messaging[0],
              referral: {
                source: 'MARKETPLACE',
                type: 'OPEN_THREAD',
                ref: 'listing_12345',
              },
            },
          ],
        },
      ],
    }
    const result = parseWebhookEvent(marketplaceEvent)
    expect(result[0].referral?.source).toBe('MARKETPLACE')
    expect(result[0].referral?.ref).toBe('listing_12345')
  })

  it('marks hasAttachment when attachments are present', () => {
    const attachmentEvent: FacebookWebhookEvent = {
      ...baseEvent,
      entry: [
        {
          ...baseEvent.entry[0],
          messaging: [
            {
              ...baseEvent.entry[0].messaging[0],
              message: {
                mid: 'mid.$attach',
                attachments: [
                  { type: 'image', payload: { url: 'https://example.com/photo.jpg' } },
                ],
              },
            },
          ],
        },
      ],
    }
    const result = parseWebhookEvent(attachmentEvent)
    expect(result[0].hasAttachment).toBe(true)
    expect(result[0].messageText).toBeNull()
  })

  it('handles multiple entries and messages', () => {
    const multiEvent: FacebookWebhookEvent = {
      object: 'page',
      entry: [
        {
          id: 'page1',
          time: 1714000000000,
          messaging: [
            {
              sender: { id: 'user1' },
              recipient: { id: 'page1' },
              timestamp: 1714000000000,
              message: { mid: 'mid1', text: 'Mensaje 1' },
            },
            {
              sender: { id: 'user2' },
              recipient: { id: 'page1' },
              timestamp: 1714000001000,
              message: { mid: 'mid2', text: 'Mensaje 2' },
            },
          ],
        },
      ],
    }
    const result = parseWebhookEvent(multiEvent)
    expect(result).toHaveLength(2)
  })
})

// ─── hashPsid ─────────────────────────────────────────────────────────────────

describe('hashPsid', () => {
  it('returns a 12-character hex string', () => {
    const hash = hashPsid('1234567890')
    expect(hash).toHaveLength(12)
    expect(hash).toMatch(/^[0-9a-f]+$/)
  })

  it('is deterministic', () => {
    expect(hashPsid('psid_abc')).toBe(hashPsid('psid_abc'))
  })

  it('produces different hashes for different PSIDs', () => {
    expect(hashPsid('psid_abc')).not.toBe(hashPsid('psid_xyz'))
  })
})
