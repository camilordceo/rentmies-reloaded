import { routeMessage, getProvider } from './wharentmies/router'

const ADMIN_PHONE = '573103565492'

export async function notifyAdmin(message: string): Promise<void> {
  try {
    const providerId = await routeMessage(ADMIN_PHONE, { agentType: 'ai' })
    const provider = getProvider(providerId)
    await provider.sendText(ADMIN_PHONE, message, { sessionId: '' })
  } catch (err) {
    // Notification failure is non-fatal — log but don't throw
    console.error('[admin-notify] Failed to send WhatsApp notification:', err)
  }
}
