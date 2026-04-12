// ============================================================
// Facebook Messenger Platform — TypeScript Types
// API reference: https://developers.facebook.com/docs/messenger-platform
// ============================================================

// ─── Webhook payload ─────────────────────────────────────

export interface FacebookWebhookEvent {
  object: 'page'
  entry: FacebookEntry[]
}

export interface FacebookEntry {
  id: string           // PAGE_ID
  time: number
  messaging: FacebookMessagingEvent[]
}

export interface FacebookMessagingEvent {
  sender: { id: string }     // USER_PSID
  recipient: { id: string }  // PAGE_ID
  timestamp: number
  message?: FacebookInboundMessage
  postback?: FacebookPostback
  referral?: FacebookReferral
  read?: { watermark: number }
  delivery?: { watermarks: number[]; seq: number }
}

export interface FacebookInboundMessage {
  mid: string
  text?: string
  attachments?: FacebookAttachment[]
  is_echo?: boolean
  quick_reply?: { payload: string }
}

export interface FacebookAttachment {
  type: 'image' | 'video' | 'audio' | 'file' | 'template' | 'fallback'
  payload: {
    url?: string
    title?: string
    sticker_id?: number
  }
}

export interface FacebookPostback {
  title: string
  payload: string
  referral?: FacebookReferral
}

// Marketplace referral — present when lead messages from a Marketplace listing
export interface FacebookReferral {
  ref?: string
  source?: 'MESSENGER_CODE' | 'DISCOVER_TAB' | 'ADS' | 'SHORTLINK' | 'CUSTOMER_CHAT_PLUGIN' | 'AD' | 'MARKETPLACE'
  type?: 'OPEN_THREAD' | 'REF'
  ad_id?: string
  ads_context_data?: {
    ad_title?: string
    photo_url?: string
    video_url?: string
    post_id?: string
    product_id?: string
  }
}

// ─── Send API ────────────────────────────────────────────

export interface FacebookSendRequest {
  recipient: { id: string }
  message: {
    text?: string
    attachment?: {
      type: 'image' | 'video' | 'audio' | 'file' | 'template'
      payload: Record<string, unknown>
    }
  }
  messaging_type?: 'RESPONSE' | 'UPDATE' | 'MESSAGE_TAG'
  tag?: string
}

export interface FacebookSendResponse {
  recipient_id: string
  message_id: string
}

// ─── User Profile API ────────────────────────────────────

export interface FacebookUserProfile {
  id: string
  first_name: string
  last_name?: string
  profile_pic?: string
  name?: string
}

// ─── Normalized internal event ───────────────────────────

export interface NormalizedFacebookMessage {
  pageId: string
  userPsid: string
  messageText: string | null
  messageMid: string
  timestamp: number
  hasAttachment: boolean
  referral: FacebookReferral | null
}
