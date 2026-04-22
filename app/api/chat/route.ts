import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { processMessage } from '@/lib/agent/orchestrator'
import { deriveMood, deriveTags } from '@/lib/atlas-helpers'
import type { AtlasProperty } from '@/store/atlas-store'

export const maxDuration = 30

function extractInsight(text: string, identifier: string): string | undefined {
  if (!identifier) return undefined
  const sentences = text.split(/(?<=[.!?])\s+/)
  const match = sentences.find((s) => s.toLowerCase().includes(identifier.toLowerCase()))
  return match?.trim() ?? undefined
}

// Map raw tool-call results to full AtlasProperty objects for the portal
function hydrateAtlasProperties(toolProps: any[], aiText: string): AtlasProperty[] {
  return toolProps.map((p, idx) => {
    const tags = deriveTags({
      descripcion: p.descripcion,
      ubicacion: p.ubicacion,
      ciudad: p.ciudad,
      tipo_inmueble: p.tipo,
      tipo_negocio: p.negocio,
      parqueaderos: p.parqueaderos,
      estrato: p._estrato,
    })
    const mood = deriveMood({
      descripcion: p.descripcion,
      ubicacion: p.ubicacion,
      tipo_inmueble: p.tipo,
      tipo_negocio: p.negocio,
      habitaciones: p.habitaciones,
    })
    // First AI result gets highest score, decreasing by rank
    const match_score = Math.max(62, 97 - idx * 5)
    const insight = extractInsight(aiText, p.codigo ?? p.ubicacion ?? '')

    return {
      id: p._id ?? p.codigo,
      codigo: p.codigo,
      ubicacion: p.ubicacion ?? '',
      ciudad: p.ciudad ?? null,
      tipo_inmueble: p.tipo ?? null,
      tipo_negocio: p.negocio ?? null,
      precio: p._precio_num ?? null,
      area_m2: p.area_m2 ?? null,
      habitaciones: p.habitaciones ?? null,
      banos: p.banos ?? null,
      parqueaderos: p.parqueaderos ?? null,
      estrato: p._estrato ?? null,
      imagenes: p._imagenes ?? [],
      descripcion: p.descripcion ?? null,
      cashback_amount: p._cashback_amount ?? null,
      cashback_rate: p._cashback_rate ?? null,
      empresa_id: p._empresa_id ?? null,
      caracteristicas: p._caracteristicas ?? {},
      tags,
      mood,
      match_score,
      agent_insight: insight ?? null,
    } satisfies AtlasProperty
  })
}

export async function POST(req: NextRequest) {
  const { empresa_id, message, session_id, previous_response_id, intents } = await req.json()
  if (!message) return NextResponse.json({ error: 'message requerido' }, { status: 400 })

  const enrichedMessage =
    intents && Array.isArray(intents) && intents.length > 0
      ? `[Intenciones del usuario: ${intents.join(', ')}]\n\n${message}`
      : message

  const db = createAdminClient()

  // Resolve AI agent
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

  if (!agente) {
    const portalAssistantId = process.env.PORTAL_ASSISTANT_ID
    if (portalAssistantId) {
      agente = { id: 'portal-global', empresa_id: null, assistant_id: portalAssistantId, activo: true, channel_uuid_callbell: null }
    } else {
      const { data } = await db.from('agentes_ia').select('*').eq('activo', true).limit(1).single()
      agente = data
    }
  }

  if (!agente) return NextResponse.json({ error: 'No hay agente IA configurado' }, { status: 404 })

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
      await db.from('portal_sessions').upsert(
        { session_id, empresa_id: empresa_id ?? null, conversacion_id: conversacion.id, last_response_id: null, metadata: {} },
        { onConflict: 'session_id' }
      )
    }
  }

  if (previous_response_id && conversacion && !conversacion.last_response_id) {
    conversacion = { ...conversacion, last_response_id: previous_response_id }
  }

  if (conversacion) {
    await db.from('mensaje').insert({ conversacion_id: conversacion.id, rol: 'user', texto: enrichedMessage, metadata: {} })
  }

  const result = await processMessage({
    conversacion: conversacion ?? {
      id: 'temp', whatsapp_ai_id: agente.id, user_conversacion_id: null,
      activa: true, ultimo_mensaje_at: null, last_response_id: previous_response_id ?? null, metadata: {},
    },
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

  // Hydrate tool results to AtlasProperty for the portal store
  const atlasProperties = hydrateAtlasProperties(result.properties, result.text)

  return NextResponse.json({
    text: result.text,
    properties: atlasProperties,
    response_id: result.responseId,
    conversation_id: conversacion?.id,
  })
}
