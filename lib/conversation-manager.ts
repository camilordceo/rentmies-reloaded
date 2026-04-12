/**
 * conversation-manager.ts
 * Orchestrates the full WhatsApp AI message flow:
 *  1. Identify agent (agentes_ia by destination number)
 *  2. Find/create user_conversacion and conversacion
 *  3. Save incoming user message
 *  4. Anti-spam accumulation (4s window)
 *  5. Run agent loop (orchestrator.ts) — tool-augmented AI
 *  6. Route outbound reply via WhaRentmies provider abstraction
 *  7. Save assistant message + update conversacion
 */

import { createAdminClient } from './supabase/admin'
import { normalizePhone } from './phone-utils'
import { routeMessage, getProvider, recordCallbellFailure } from './wharentmies/router'
import { processMessage } from './agent/orchestrator'
import { logger } from './logger'
import type {
  AgenteIA,
  UserConversacion,
  Conversacion,
  CallbellWebhookPayload,
} from './types'

const ACCUMULATION_DELAY_MS = 4_000
const NO_TEXT_REPLY =
  'Por el momento solo puedo procesar mensajes de texto 📝. Por favor escríbeme tu consulta.'
const ERROR_REPLY =
  'Disculpa, en este momento no puedo procesar tu mensaje. Un agente te contactará pronto.'

// ─── DB helpers ──────────────────────────────────────────────────────────────

async function findWhatsappAI(toNumber: string): Promise<AgenteIA | null> {
  const db = createAdminClient()
  const { data } = await db
    .from('agentes_ia')
    .select('*')
    .eq('numero_whatsapp', normalizePhone(toNumber))
    .eq('activo', true)
    .single()
  return data ?? null
}

async function findOrCreateUser(
  telefono: string,
  contact: CallbellWebhookPayload['payload']['contact']
): Promise<UserConversacion> {
  const db = createAdminClient()
  const normalized = normalizePhone(telefono)

  const { data: existing } = await db
    .from('user_conversacion')
    .select('*')
    .eq('telefono', normalized)
    .single()
  if (existing) return existing as UserConversacion

  const { data: created, error } = await db
    .from('user_conversacion')
    .insert({
      telefono: normalized,
      nombre: contact.name ?? null,
      callbell_contact_uuid: contact.uuid ?? null,
      metadata: {},
    })
    .select()
    .single()
  if (error || !created) throw new Error(`create user_conversacion: ${error?.message}`)
  return created as UserConversacion
}

async function findOrCreateConversacion(
  whatsappAIId: string,
  userConversacionId: string
): Promise<Conversacion> {
  const db = createAdminClient()

  const { data: existing } = await db
    .from('conversacion')
    .select('*')
    .eq('whatsapp_ai_id', whatsappAIId)
    .eq('user_conversacion_id', userConversacionId)
    .eq('activa', true)
    .single()
  if (existing) return existing as Conversacion

  const { data: created, error } = await db
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
  if (error || !created) throw new Error(`create conversacion: ${error?.message}`)
  return created as Conversacion
}

// ─── Anti-spam accumulation ───────────────────────────────────────────────────
// Waits up to 4s for burst messages, then concatenates them into one request.

async function accumulateMessages(
  conversacion: Conversacion,
  savedMessageCreatedAt: string
): Promise<string[]> {
  const db = createAdminClient()
  const pendingSince = conversacion.metadata?.pending_since as string | undefined
  const now = Date.now()

  if (pendingSince) {
    const elapsed = now - new Date(pendingSince).getTime()
    if (elapsed < ACCUMULATION_DELAY_MS) {
      await new Promise((r) => setTimeout(r, ACCUMULATION_DELAY_MS - elapsed))
    }
  } else {
    await db
      .from('conversacion')
      .update({ metadata: { ...conversacion.metadata, pending_since: new Date().toISOString() } })
      .eq('id', conversacion.id)
    await new Promise((r) => setTimeout(r, ACCUMULATION_DELAY_MS))
  }

  const since = pendingSince ?? savedMessageCreatedAt
  const { data } = await db
    .from('mensaje')
    .select('texto')
    .eq('conversacion_id', conversacion.id)
    .eq('rol', 'user')
    .gte('created_at', since)
    .order('created_at', { ascending: true })

  await db
    .from('conversacion')
    .update({ metadata: { ...conversacion.metadata, pending_since: null } })
    .eq('id', conversacion.id)

  return (data ?? []).map((m: { texto: string }) => m.texto)
}

// ─── Send outbound reply via provider router ─────────────────────────────────

async function sendReply(
  fromPhone: string,
  agent: AgenteIA,
  text: string
): Promise<string> {
  const db = createAdminClient()
  const providerId = await routeMessage(fromPhone, { agentType: 'ai' }, db)
  const provider = getProvider(providerId)

  try {
    const result = await provider.sendText(fromPhone, text, {
      sessionId: agent.channel_uuid_callbell ?? '',
    })
    return result.externalId
  } catch (err) {
    // Record Callbell failure for circuit breaker
    if (providerId === 'callbell') {
      recordCallbellFailure()
    }
    throw err
  }
}

// ─── Main entry point ────────────────────────────────────────────────────────

export async function processIncomingMessage(
  payload: CallbellWebhookPayload['payload']
): Promise<void> {
  const db = createAdminClient()
  const fromPhone = normalizePhone(payload.from)
  const toPhone = normalizePhone(payload.to)

  // 1. Identify agent
  const agent = await findWhatsappAI(toPhone)
  if (!agent) {
    logger.warn('conversation-manager', `No active agent for ${toPhone}`)
    return
  }

  logger.info('conversation-manager', `Processing message`, {
    empresa_id: agent.empresa_id,
    whatsapp_ai_id: agent.id,
    telefono: fromPhone,
  })

  // 2. Find/create user & conversation
  const user = await findOrCreateUser(fromPhone, payload.contact)
  const conversacion = await findOrCreateConversacion(agent.id, user.id)

  // 3. Handle non-text (media) messages
  if (!payload.text) {
    await sendReply(fromPhone, agent, NO_TEXT_REPLY).catch(() => {
      logger.warn('conversation-manager', 'Failed to send media reply', {
        empresa_id: agent.empresa_id,
        conversacion_id: conversacion.id,
      })
    })
    return
  }

  // 4. Save incoming user message
  const { data: savedMsg } = await db
    .from('mensaje')
    .insert({
      conversacion_id: conversacion.id,
      rol: 'user',
      texto: payload.text,
      callbell_message_uuid: null,
      metadata: {},
    })
    .select('created_at')
    .single()

  // 5. Accumulate burst messages (anti-spam)
  const texts = await accumulateMessages(conversacion, savedMsg?.created_at ?? new Date().toISOString())
  const combinedText = texts.length > 0 ? texts.join('\n') : payload.text

  // 6. Run agent loop
  let replyText: string
  try {
    const result = await processMessage({
      conversacion,
      whatsappAI: agent,
      userMessage: combinedText,
    })
    replyText = result.text
  } catch (err) {
    logger.error('conversation-manager', 'Agent loop failed', {
      empresa_id: agent.empresa_id,
      conversacion_id: conversacion.id,
      context: { error: err instanceof Error ? err.message : String(err) },
    })
    replyText = ERROR_REPLY
  }

  // 7. Send reply via provider router
  let externalMessageId: string | null = null
  try {
    externalMessageId = await sendReply(fromPhone, agent, replyText)
  } catch (err) {
    logger.error('conversation-manager', 'Failed to send reply', {
      empresa_id: agent.empresa_id,
      conversacion_id: conversacion.id,
      context: { error: err instanceof Error ? err.message : String(err) },
    })
  }

  // 8. Save assistant message
  await db.from('mensaje').insert({
    conversacion_id: conversacion.id,
    rol: 'assistant',
    texto: replyText,
    callbell_message_uuid: externalMessageId,
    metadata: {},
  })

  logger.info('conversation-manager', 'Reply sent', {
    empresa_id: agent.empresa_id,
    conversacion_id: conversacion.id,
    telefono: fromPhone,
  })
}
