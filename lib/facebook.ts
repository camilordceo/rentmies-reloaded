/**
 * lib/facebook.ts
 * Central helper for all Facebook Messenger Platform interactions.
 * Covers: webhook signature verification, Send API, User Profile API,
 * 24-hour window enforcement, and webhook event parsing.
 *
 * Meta Graph API version: v21.0
 */

import { createHmac } from 'crypto'
import type {
  FacebookWebhookEvent,
  FacebookMessagingEvent,
  NormalizedFacebookMessage,
  FacebookSendRequest,
  FacebookSendResponse,
  FacebookUserProfile,
} from './types/facebook'

const GRAPH_API_VERSION = 'v21.0'
const GRAPH_BASE = `https://graph.facebook.com/${GRAPH_API_VERSION}`
const MESSAGING_WINDOW_HOURS = 24

// ─── HMAC signature verification ─────────────────────────────────────────────
// Meta sends X-Hub-Signature-256: sha256=<hex> using the App Secret as key.

export function verifyWebhookSignature(
  rawBody: string,
  signatureHeader: string,
  appSecret: string
): boolean {
  if (!signatureHeader.startsWith('sha256=')) return false
  const received = signatureHeader.slice('sha256='.length)
  const expected = createHmac('sha256', appSecret).update(rawBody).digest('hex')
  // Constant-time comparison
  if (received.length !== expected.length) return false
  let diff = 0
  for (let i = 0; i < received.length; i++) {
    diff |= received.charCodeAt(i) ^ expected.charCodeAt(i)
  }
  return diff === 0
}

// ─── 24-hour window check ─────────────────────────────────────────────────────
// Meta Messenger Standard Messaging only allows replies within 24h of
// the last user message. After that, Message Tags are required.

export function isWithin24hWindow(lastUserMessageAt: string | Date): boolean {
  const last = typeof lastUserMessageAt === 'string'
    ? new Date(lastUserMessageAt)
    : lastUserMessageAt
  const diffMs = Date.now() - last.getTime()
  return diffMs < MESSAGING_WINDOW_HOURS * 60 * 60 * 1000
}

export function compute24hWindowExpiry(fromTimestampMs: number): string {
  return new Date(fromTimestampMs + MESSAGING_WINDOW_HOURS * 60 * 60 * 1000).toISOString()
}

// ─── Parse and normalize webhook events ──────────────────────────────────────
// Filters out echoes, delivery receipts, and read events.
// Returns only actionable inbound messages.

export function parseWebhookEvent(body: FacebookWebhookEvent): NormalizedFacebookMessage[] {
  const normalized: NormalizedFacebookMessage[] = []

  for (const entry of body.entry ?? []) {
    for (const event of entry.messaging ?? []) {
      // Skip echoes (messages sent by the page itself)
      if (event.message?.is_echo) continue
      // Skip delivery + read receipts
      if (event.delivery || event.read) continue
      // Skip postbacks for now (could be added later)
      if (!event.message) continue

      const msg = event.message
      normalized.push({
        pageId: entry.id,
        userPsid: event.sender.id,
        messageText: msg.text ?? null,
        messageMid: msg.mid,
        timestamp: event.timestamp,
        hasAttachment: (msg.attachments?.length ?? 0) > 0,
        referral: event.referral ?? null,
      })
    }
  }

  return normalized
}

// ─── Send API ────────────────────────────────────────────────────────────────

export async function sendMessage(
  pageAccessToken: string,
  recipientPsid: string,
  messageText: string
): Promise<FacebookSendResponse> {
  const body: FacebookSendRequest = {
    recipient: { id: recipientPsid },
    message: { text: messageText },
    messaging_type: 'RESPONSE',
  }

  const res = await fetch(
    `${GRAPH_BASE}/me/messages?access_token=${pageAccessToken}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    }
  )

  if (!res.ok) {
    const err = await res.text()
    throw new Error(`Meta Send API error ${res.status}: ${err}`)
  }

  return res.json() as Promise<FacebookSendResponse>
}

// ─── User Profile API ────────────────────────────────────────────────────────
// Returns the user's name and profile picture. Requires pages_messaging + pages_read_engagement.
// Returns null on any error (profile may not be accessible in all cases).

export async function getUserProfile(
  pageAccessToken: string,
  userPsid: string
): Promise<FacebookUserProfile | null> {
  try {
    const fields = 'first_name,last_name,profile_pic,name'
    const res = await fetch(
      `${GRAPH_BASE}/${userPsid}?fields=${fields}&access_token=${pageAccessToken}`
    )
    if (!res.ok) return null
    return res.json() as Promise<FacebookUserProfile>
  } catch {
    return null
  }
}

// ─── PSID hashing for logs (GDPR/PII) ────────────────────────────────────────

export function hashPsid(psid: string): string {
  return createHmac('sha256', 'rentmies-fb-log-salt').update(psid).digest('hex').slice(0, 12)
}
