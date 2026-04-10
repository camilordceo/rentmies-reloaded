// ─── WhaRentmies — WhatsApp Provider Abstraction ─────────────────────────────
// Canonical interface all WhatsApp providers must implement.
// Adding a new provider = implement this interface, register in router.ts.

export type ProviderId = 'callbell' | 'wharentmies' | 'meta'
export type MessageStatus = 'queued' | 'sent' | 'delivered' | 'read' | 'failed'
export type MessageDirection = 'inbound' | 'outbound'

export interface SendOptions {
  sessionId?: string       // wharentmies device/session ID
  priority?: 'low' | 'normal' | 'high' | 'urgent'
  scheduleAt?: Date
  quoteMessageId?: string
  agentId?: string
}

export interface MediaPayload {
  url: string
  caption?: string
  mimeType?: string
}

export interface TemplatePayload {
  name: string
  language: string
  components?: unknown[]
}

export interface MessageResult {
  provider: ProviderId
  externalId: string
  status: MessageStatus
  timestamp: Date
  raw?: unknown
}

export interface NumberValidationResult {
  phone: string
  exists: boolean
  provider: ProviderId
  checkedAt: Date
}

export interface NormalizedInboundMessage {
  externalId: string
  from: string          // E.164 customer phone
  to: string            // E.164 our number
  text: string | null
  contactName: string | null
  contactExternalId: string
  provider: ProviderId
  receivedAt: Date
  raw: unknown
}

export interface WhatsAppProvider {
  readonly id: ProviderId
  sendText(to: string, text: string, options?: SendOptions): Promise<MessageResult>
  sendMedia(to: string, media: MediaPayload, options?: SendOptions): Promise<MessageResult>
  sendTemplate(to: string, template: TemplatePayload): Promise<MessageResult>
  getMessageStatus(messageId: string): Promise<MessageStatus>
  validateNumber(phone: string): Promise<NumberValidationResult>
}
