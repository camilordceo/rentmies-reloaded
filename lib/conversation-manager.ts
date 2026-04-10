/**
 * conversation-manager.ts
 * Orchestrates the full WhatsApp AI message flow:
 *   1. Find/create user_conversacion and conversacion
 *   2. Save incoming message
 *   3. Anti-spam timer (4s accumulation)
 *   4. Build history → call Responses API
 *   5. Send reply via Callbell
 *   6. Save assistant message + update conversacion
 */

import { createClient } from '@supabase/supabase-js'
import { normalizePhone } from './phone-utils'
import { sendWhatsAppMessage } from './callbell'
import { getAIResponse, buildHistoryContent } from './responses'
import { logger } from './logger'
import type {
  WhatsappAI,
  UserConversacion,
  Conversacion,
  Mensaje,
  CallbellWebhookPayload,
} from './types'

const ACCUMULATION_DELAY_MS = 4_000
const HISTORY_LIMIT = 20
const NO_TEXT_REPLY = 'Por el momento solo puedo procesar mensajes de texto. Por favor escríbeme tu consulta.'

function getDB() {
  const { createClient: sc } = require('@supabase/supabase-js')
  return sc(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )
}

// ─── Find WhatsApp AI agent by destination number ────────────────

async function findWhatsappAI(supabase: ReturnType<typeof getDB>, toNumber: string): Promise<WhatsappAI | null> {
  const { data, error } = await supabase
    .from('whatsapp_ai')
    .select('*')
    .eq('numero_whatsapp', normalizePhone(toNumber))
    .eq('activo', true)
    .single()

  if (error || !data) return null
  return data as WhatsappAI
}

// ─── Find or create user_conversacion ────────────────────────────

async function findOrCreateUser(
  supabase: ReturnType<typeof getDB>,
  telefono: string,
  contactInfo: CallbellWebhookPayload['payload']['contact']
): Promise<UserConversacion> {
  const normalized = normalizePhone(telefono)

  const { data: existing } = await supabase
    .from('user_conversacion')
    .select('*')
    .eq('telefono', normalized)
    .single()

  if (existing) return existing as UserConversacion

  const { data: created, error } = await supabase
    .from('user_conversacion')
    .insert({
      telefono: normalized,
      nombre: contactInfo.name || null,
      callbell_contact_uuid: contactInfo.uuid || null,
      metadata: {},
    })
    .select()
    .single()

  if (error || !created) throw new Error(`Failed to create user_conversacion: ${error?.message}`)
  return created as UserConversacion
}

// ─── Find or create conversacion ─────────────────────────────────

async function findOrCreateConversacion(
  supabase: ReturnType<typeof getDB>,
  whatsappAIId: string,
  userConversacionId: string
): Promise<Conversacion> {
  const { data: existing } = await supabase
    .from('conversacion')
    .select('*')
    .eq('whatsapp_ai_id', whatsappAIId)
    .eq('user_conversacion_id', userConversacionId)
    .eq('activa', true)
    .single()

  if (existing) return existing as Conversacion

  const { data: created, error } = await supabase
    .from('conversacion')
    .insert({
      whatsapp_ai_id: whatsappAIId,
      user_conversacion_id: userConversacionId,
      activa: true,
      ultimo_mensaje_at: new Date().toISOString(),
      metadata: {},
    })
    .select()
    .single()

  if (error || !created) throw new Error(`Failed to create conversacion: ${error?.message}`)
  return created as Conversacion
}

// ─── Save a user message ─────────────────────────────────────────

async function saveUserMessage(
  supabase: ReturnType<typeof getDB>,
  conversacionId: string,
  texto: string,
  callbellUuid?: string
): Promise<Mensaje> {
  const { data, error } = await supabase
    .from('mensaje')
    .insert({
      conversacion_id: conversacionId,
      rol: 'user',
      texto,
      callbell_message_uuid: callbellUuid || null,
      metadata: {},
    })
    .select()
    .single()

  if (error || !data) throw new Error(`Failed to save user message: ${error?.message}`)
  return data as Mensaje
}

// ─── Get recent history ──────────────────────────────────────────

async function getHistory(
  supabase: ReturnType<typeof getDB>,
  conversacionId: string
): Promise<Mensaje[]> {
  const { data } = await supabase
    .from('mensaje')
    .select('*')
    .eq('conversacion_id', conversacionId)
    .order('created_at', { ascending: false })
    .limit(HISTORY_LIMIT)

  return ((data || []) as Mensaje[]).reverse()
}

// ─── Anti-spam accumulation timer ───────────────────────────────
// Strategy: on each webhook call, check if conversacion.metadata.pending_since
// is set and < 4s ago. If so, sleep until the 4s window completes, then
// re-fetch all messages created after pending_since to concatenate them.

async function waitForAccumulation(
  supabase: ReturnType<typeof getDB>,
  conversacion: Conversacion,
  lastUserMessageCreatedAt: string
): Promise<string[]> {
  const pendingSince = conversacion.metadata?.pending_since as string | undefined
  const now = Date.now()

  if (pendingSince) {
    const elapsed = now - new Date(pendingSince).getTime()
    if (elapsed < ACCUMULATION_DELAY_MS) {
      const waitMs = ACCUMULATION_DELAY_MS - elapsed
      await new Promise((r) => setTimeout(r, waitMs))
    }
  } else {
    // First message in the burst — mark pending_since and wait
    await supabase
      .from('conversacion')
      .update({ metadata: { ...conversacion.metadata, pending_since: new Date().toISOString() } })
      .eq('id', conversacion.id)
    await new Promise((r) => setTimeout(r, ACCUMULATION_DELAY_MS))
  }

  // Fetch all user messages created after pending_since
  const since = pendingSince || lastUserMessageCreatedAt
  const { data: accumulated } = await supabase
    .from('mensaje')
    .select('texto')
    .eq('conversacion_id', conversacion.id)
    .eq('rol', 'user')
    .gte('created_at', since)
    .order('created_at', { ascending: true })

  // Clear pending_since
  await supabase
    .from('conversacion')
    .update({ metadata: { ...conversacion.metadata, pending_since: null } })
    .eq('id', conversacion.id)

  return (accumulated || []).map((m: { texto: string }) => m.texto)
}

// ─── Main orchestrator ───────────────────────────────────────────

export async function processIncomingMessage(payload: CallbellWebhookPayload['payload']): Promise<void> {
  const supabase = getDB()

  const fromPhone = normalizePhone(payload.from)
  const toPhone = normalizePhone(payload.to)

  // 1. Find WhatsApp AI agent
  const agent = await findWhatsappAI(supabase, toPhone)
  if (!agent) {
    logger.warn('conversation-manager', `No active agent found for number ${toPhone}`)
    return
  }

  logger.info('conversation-manager', `Processing message for agent ${agent.nombre_agente}`, {
    telefono: fromPhone,
    empresa_id: agent.empresa_id,
    whatsapp_ai_id: agent.id,
  })

  // 2. Find or create user and conversation
  const user = await findOrCreateUser(supabase, fromPhone, payload.contact)
  const conversacion = await findOrCreateConversacion(supabase, agent.id, user.id)

  // 3. Handle no-text (media) messages
  if (!payload.text) {
    await sendWhatsAppMessage({
      to: fromPhone,
      channelUuid: agent.channel_uuid_callbell,
      text: NO_TEXT_REPLY,
    })
    logger.info('conversation-manager', 'Media message received — sent no-text reply', {
      telefono: fromPhone,
      empresa_id: agent.empresa_id,
    })
    return
  }

  // 4. Save incoming user message
  const savedMsg = await saveUserMessage(supabase, conversacion.id, payload.text)

  // 5. Accumulation timer — collect burst messages
  const accumulatedTexts = await waitForAccumulation(supabase, conversacion, savedMsg.created_at!)
  const combinedText = accumulatedTexts.length > 0
    ? accumulatedTexts.join('\n')
    : payload.text

  // 6. Load recent history (excluding the just-saved messages)
  const history = await getHistory(supabase, conversacion.id)
  // Remove messages that are part of the current burst from history (they'll be in combinedText)
  const historyWithoutBurst = history.filter(
    (m) => m.rol === 'assistant' || new Date(m.created_at!).getTime() < Date.now() - ACCUMULATION_DELAY_MS - 1000
  )

  // 7. Build content and call AI
  const content = buildHistoryContent(
    historyWithoutBurst.map((m) => ({ rol: m.rol, texto: m.texto })),
    combinedText
  )

  const aiResponse = await getAIResponse(
    agent.assistant_id,
    content,
    conversacion.last_response_id
  )

  const replyText = aiResponse.output_text

  // 8. Send reply via Callbell
  const callbellResp = await sendWhatsAppMessage({
    to: fromPhone,
    channelUuid: agent.channel_uuid_callbell,
    text: replyText,
  })

  // 9. Save assistant message
  await supabase.from('mensaje').insert({
    conversacion_id: conversacion.id,
    rol: 'assistant',
    texto: replyText,
    callbell_message_uuid: callbellResp.message?.uuid || null,
    responses_api_correlation_id: aiResponse.next_previous_response_id || null,
    metadata: {},
  })

  // 10. Update conversacion metadata
  await supabase
    .from('conversacion')
    .update({
      ultimo_mensaje_at: new Date().toISOString(),
      last_response_id: aiResponse.next_previous_response_id || null,
    })
    .eq('id', conversacion.id)

  logger.info('conversation-manager', 'Message processed and replied', {
    telefono: fromPhone,
    empresa_id: agent.empresa_id,
    conversacion_id: conversacion.id,
    whatsapp_ai_id: agent.id,
  })
}
