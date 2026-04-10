import { formatForCallbell } from './phone-utils'

const CALLBELL_API_URL = 'https://api.callbell.eu/v1'
const CALLBELL_API_KEY = process.env.CALLBELL_API_KEY!

export interface SendMessageParams {
  to: string            // phone number (will be formatted with +)
  channelUuid: string   // channel_uuid_callbell from whatsapp_ai
  text: string
}

export interface CallbellMessageResponse {
  message: {
    uuid: string
    status: string
  }
}

export async function sendWhatsAppMessage(
  params: SendMessageParams
): Promise<CallbellMessageResponse> {
  const response = await fetch(`${CALLBELL_API_URL}/messages/send`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${CALLBELL_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      to: formatForCallbell(params.to),
      from: 'whatsapp',
      type: 'text',
      channel_uuid: params.channelUuid,
      content: { text: params.text },
    }),
  })

  if (!response.ok) {
    const body = await response.text()
    throw new Error(`Callbell API error ${response.status}: ${body}`)
  }

  return response.json()
}
