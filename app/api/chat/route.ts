import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { processMessage } from '@/lib/agent/orchestrator'

export const maxDuration = 30

export async function POST(req: NextRequest) {
  const { empresa_id, message, session_id, previous_response_id } = await req.json()
  if (!empresa_id || !message) {
    return NextResponse.json({ error: 'empresa_id y message requeridos' }, { status: 400 })
  }

  const db = createAdminClient()

  // Get empresa's active AI agent
  const { data: agente } = await db
    .from('agentes_ia')
    .select('*')
    .eq('empresa_id', empresa_id)
    .eq('activo', true)
    .limit(1)
    .single()

  if (!agente) {
    return NextResponse.json({ error: 'No hay agente IA configurado para esta empresa' }, { status: 404 })
  }

  // Find or create portal session conversacion
  let conversacion: any
  if (session_id) {
    const { data: session } = await db
      .from('portal_sessions')
      .select('conversacion_id')
      .eq('session_id', session_id)
      .single()

    if (session?.conversacion_id) {
      const { data } = await db
        .from('conversacion')
        .select('*')
        .eq('id', session.conversacion_id)
        .single()
      conversacion = data
    }
  }

  if (!conversacion) {
    const { data: newConv } = await db
      .from('conversacion')
      .insert({
        whatsapp_ai_id: agente.id,
        user_conversacion_id: null,
        activa: true,
        ultimo_mensaje_at: new Date().toISOString(),
        last_response_id: previous_response_id ?? null,
        metadata: { source: 'portal', session_id },
      })
      .select()
      .single()
    conversacion = newConv

    // Upsert portal session
    if (session_id) {
      await db.from('portal_sessions').upsert({
        session_id,
        empresa_id,
        conversacion_id: conversacion.id,
        last_response_id: null,
        metadata: {},
      }, { onConflict: 'session_id' })
    }
  }

  // Override last_response_id if provided by client (for threading continuity)
  if (previous_response_id && !conversacion.last_response_id) {
    conversacion = { ...conversacion, last_response_id: previous_response_id }
  }

  // Save user message
  await db.from('mensaje').insert({
    conversacion_id: conversacion.id,
    rol: 'user',
    texto: message,
    metadata: {},
  })

  // Run agent loop
  const result = await processMessage({
    conversacion,
    whatsappAI: agente as any,
    userMessage: message,
  })

  // Save assistant message
  await db.from('mensaje').insert({
    conversacion_id: conversacion.id,
    rol: 'assistant',
    texto: result.text,
    responses_api_correlation_id: result.responseId,
    metadata: {},
  })

  // Update portal session response_id
  if (session_id) {
    await db
      .from('portal_sessions')
      .update({ last_response_id: result.responseId })
      .eq('session_id', session_id)
  }

  return NextResponse.json({
    text: result.text,
    properties: result.properties,
    response_id: result.responseId,
    conversation_id: conversacion.id,
  })
}
