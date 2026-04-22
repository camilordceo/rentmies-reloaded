import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { processMessage } from '@/lib/agent/orchestrator'

export const maxDuration = 30

// Extract a sentence from the AI reply that mentions the property identifier
function extractInsight(text: string, identifier: string): string | undefined {
  if (!identifier) return undefined
  const sentences = text.split(/(?<=[.!?])\s+/)
  const match = sentences.find((s) =>
    s.toLowerCase().includes(identifier.toLowerCase())
  )
  return match?.trim() ?? undefined
}

export async function POST(req: NextRequest) {
  const { empresa_id, message, session_id, previous_response_id, intents } = await req.json()
  if (!message) return NextResponse.json({ error: 'message requerido' }, { status: 400 })

  // Prepend intent context when provided by the Atlas portal
  const enrichedMessage =
    intents && Array.isArray(intents) && intents.length > 0
      ? `[Intenciones del usuario: ${intents.join(', ')}]\n\n${message}`
      : message

  const db = createAdminClient()

  // Resolve AI agent — per-empresa or global (PORTAL_ASSISTANT_ID env var)
  let agente: any = null
  if (empresa_id) {
    const { data } = await db
      .from('agentes_ia')
      .select('*')
      .eq('empresa_id', empresa_id)
      .eq('activo', true)
      .limit(1)
      .single()
    agente = data
  }

  // Global portal: use any active agent or build a minimal one from env
  if (!agente) {
    const portalAssistantId = process.env.PORTAL_ASSISTANT_ID
    if (portalAssistantId) {
      agente = {
        id: 'portal-global',
        empresa_id: null,
        assistant_id: portalAssistantId,
        activo: true,
        channel_uuid_callbell: null,
      }
    } else {
      // Fallback: first active agent in the system
      const { data } = await db
        .from('agentes_ia')
        .select('*')
        .eq('activo', true)
        .limit(1)
        .single()
      agente = data
    }
  }

  if (!agente) {
    return NextResponse.json({ error: 'No hay agente IA configurado' }, { status: 404 })
  }

  // Find or create portal session conversacion
  let conversacion: any = null
  if (session_id) {
    const { data: session } = await db
      .from('portal_sessions')
      .select('conversacion_id')
      .eq('session_id', session_id)
      .single()

    if (session?.conversacion_id) {
      const { data } = await db.from('conversacion').select('*').eq('id', session.conversacion_id).single()
      conversacion = data
    }
  }

  if (!conversacion) {
    const { data: newConv } = await db
      .from('conversacion')
      .insert({
        whatsapp_ai_id: agente.id === 'portal-global' ? null : agente.id,
        user_conversacion_id: null,
        activa: true,
        ultimo_mensaje_at: new Date().toISOString(),
        last_response_id: previous_response_id ?? null,
        metadata: { source: 'portal', session_id, global: !empresa_id },
      })
      .select()
      .single()
    conversacion = newConv

    if (session_id && conversacion) {
      await db.from('portal_sessions').upsert({
        session_id,
        empresa_id: empresa_id ?? null,
        conversacion_id: conversacion.id,
        last_response_id: null,
        metadata: {},
      }, { onConflict: 'session_id' })
    }
  }

  if (previous_response_id && conversacion && !conversacion.last_response_id) {
    conversacion = { ...conversacion, last_response_id: previous_response_id }
  }

  if (conversacion) {
    await db.from('mensaje').insert({ conversacion_id: conversacion.id, rol: 'user', texto: enrichedMessage, metadata: {} })
  }

  const result = await processMessage({
    conversacion: conversacion ?? { id: 'temp', whatsapp_ai_id: agente.id, user_conversacion_id: null, activa: true, ultimo_mensaje_at: null, last_response_id: previous_response_id ?? null, metadata: {} },
    whatsappAI: agente,
    userMessage: enrichedMessage,
  })

  if (conversacion) {
    await db.from('mensaje').insert({
      conversacion_id: conversacion.id,
      rol: 'assistant',
      texto: result.text,
      responses_api_correlation_id: result.responseId,
      metadata: {},
    })
    if (session_id) {
      await db.from('portal_sessions').update({ last_response_id: result.responseId }).eq('session_id', session_id)
    }
  }

  // Enrich properties with match_score and agent_insight
  const enrichedProperties = result.properties.map((p: any, idx: number) => ({
    ...p,
    // Rank-based score: first result = 1.0, each subsequent -0.07 (min 0.4)
    match_score: Math.max(0.4, 1.0 - idx * 0.07),
    // Pull first sentence of the AI reply that mentions this property as insight
    agent_insight: extractInsight(result.text, p.codigo ?? p.ubicacion ?? ''),
  }))

  return NextResponse.json({
    text: result.text,
    properties: enrichedProperties,
    response_id: result.responseId,
    conversation_id: conversacion?.id,
  })
}
