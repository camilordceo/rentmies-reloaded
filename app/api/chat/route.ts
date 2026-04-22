import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { processMessage } from '@/lib/agent/orchestrator'
import { extractPortalCode } from '@/lib/agent/tools/buscar-propiedades'
import { deriveMood, deriveTags } from '@/lib/atlas-helpers'
import type { AtlasProperty } from '@/store/atlas-store'

export const maxDuration = 30

// Portal defaults — override via env
const PORTAL_ASSISTANT_ID =
  process.env.PORTAL_ASSISTANT_ID || 'asst_IbHsOSuSAByiX59OujkQmUbw'

// ── Timestamp helpers ──────────────────────────────────────────────────────

function nowCOT(): string {
  return new Date().toLocaleString('es-CO', {
    timeZone: 'America/Bogota',
    day: '2-digit', month: 'short', year: 'numeric',
    hour: '2-digit', minute: '2-digit', hour12: false,
  })
}

function buildTimestampedContent(message: string, intents: string[]): string {
  const ts = nowCOT()
  const intentLine = intents.length > 0
    ? `\nIntenciones activas: ${intents.join(', ')}`
    : ''

  // Detect and annotate portal URLs in the message
  const portalCode = extractPortalCode(message)
  const codeLine = portalCode
    ? `\nCódigo portal detectado: ${portalCode}`
    : ''

  return `[${ts} COT] ${message}${intentLine}${codeLine}`
}

// ── Property hydration ─────────────────────────────────────────────────────

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
    const match_score = Math.max(62, 97 - idx * 5)

    // Pull first sentence mentioning the property as an insight
    const sentences = aiText.split(/(?<=[.!?])\s+/)
    const identifier = p.codigo ?? p.ubicacion ?? ''
    const agent_insight = identifier
      ? sentences.find(s => s.toLowerCase().includes(identifier.toLowerCase()))?.trim() ?? null
      : null

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
      agent_insight,
    } satisfies AtlasProperty
  })
}

// ── Route handler ──────────────────────────────────────────────────────────

export async function POST(req: NextRequest) {
  const { empresa_id, message, session_id, previous_response_id, intents } =
    await req.json()

  if (!message) return NextResponse.json({ error: 'message requerido' }, { status: 400 })

  const db = createAdminClient()

  // ── Resolve AI agent ─────────────────────────────────────────────────────
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
    agente = {
      id: 'portal-global',
      empresa_id: null,
      assistant_id: PORTAL_ASSISTANT_ID,
      activo: true,
      channel_uuid_callbell: null,
    }
  }

  // ── Session: find or create conversacion ──────────────────────────────────
  let conversacion: any = null
  let priorMessages: Array<{ rol: string; texto: string; created_at: string }> = []

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

      // Load last 10 messages for history if starting fresh thread
      if (!previous_response_id) {
        const { data: msgs } = await db
          .from('mensaje')
          .select('rol, texto, created_at')
          .eq('conversacion_id', session.conversacion_id)
          .order('created_at', { ascending: false })
          .limit(10)
        priorMessages = (msgs ?? []).reverse()
      }
    }
  }

  if (!conversacion) {
    const { data: newConv } = await db
      .from('conversacion')
      .insert({
        whatsapp_ai_id: null,
        user_conversacion_id: null,
        activa: true,
        ultimo_mensaje_at: new Date().toISOString(),
        last_response_id: previous_response_id ?? null,
        metadata: { source: 'portal', session_id, assistant_id: PORTAL_ASSISTANT_ID },
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

  // ── Build enriched message with timestamp + intent context ────────────────
  const intentList = Array.isArray(intents) ? intents : []
  const timestampedMessage = buildTimestampedContent(message, intentList)

  // If no prior response chain, prepend history as context
  const fullContent = priorMessages.length > 0 && !previous_response_id
    ? priorMessages
        .map(m => {
          const ts = new Date(m.created_at).toLocaleString('es-CO', {
            timeZone: 'America/Bogota', day: '2-digit', month: 'short',
            hour: '2-digit', minute: '2-digit', hour12: false,
          })
          const role = m.rol === 'user' ? 'Usuario' : 'EMA'
          return `[${ts}] ${role}: ${m.texto}`
        })
        .join('\n') + '\n\n' + timestampedMessage
    : timestampedMessage

  // Save user message to DB
  if (conversacion) {
    await db.from('mensaje').insert({
      conversacion_id: conversacion.id,
      rol: 'user',
      texto: message, // store clean message, not enriched version
      metadata: { intents: intentList },
    })
  }

  // ── Call agent ─────────────────────────────────────────────────────────────
  const result = await processMessage({
    conversacion: conversacion ?? {
      id: 'temp', whatsapp_ai_id: null, user_conversacion_id: null,
      activa: true, ultimo_mensaje_at: null,
      last_response_id: previous_response_id ?? null,
      metadata: {},
    },
    whatsappAI: agente,
    userMessage: fullContent,
  })

  // Save assistant response
  if (conversacion) {
    await db.from('mensaje').insert({
      conversacion_id: conversacion.id,
      rol: 'assistant',
      texto: result.text,
      responses_api_correlation_id: result.responseId,
      metadata: {},
    })
    if (session_id) {
      await db.from('portal_sessions')
        .update({ last_response_id: result.responseId })
        .eq('session_id', session_id)
    }
  }

  // ── Hydrate tool results → AtlasProperty ──────────────────────────────────
  const atlasProperties = hydrateAtlasProperties(result.properties, result.text)

  return NextResponse.json({
    text: result.text,
    properties: atlasProperties,
    response_id: result.responseId,
    conversation_id: conversacion?.id,
  })
}
