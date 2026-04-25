import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { processMessage } from '@/lib/agent/orchestrator'
import { extractPortalCode } from '@/lib/agent/tools/buscar-propiedades'
import { deriveMood, deriveTags } from '@/lib/atlas-helpers'
import { parseReferencesFromText } from '@/lib/atlas-message-parser'
import type { AtlasProperty } from '@/store/atlas-store'

export const maxDuration = 30

const PORTAL_ASSISTANT_ID =
  process.env.PORTAL_ASSISTANT_ID || 'asst_IbHsOSuSAByiX59OujkQmUbw'

const PORTAL_EMPRESA_ID = '00000000-0000-0000-0000-000000000002'

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
  const portalCode = extractPortalCode(message)
  const codeLine = portalCode ? `\nCódigo portal detectado: ${portalCode}` : ''
  return `[${ts} COT] ${message}${intentLine}${codeLine}`
}

// ── Code extraction from AI text ───────────────────────────────────────────
// Finds MC/FR/Domus codes mentioned in the assistant's reply so we can
// fetch the actual property records and push them to the catalog.

function extractCodesFromText(text: string): string[] {
  const codes = new Set<string>()

  function scan(re: RegExp) {
    let m: RegExpExecArray | null
    re.lastIndex = 0
    while ((m = re.exec(text)) !== null) codes.add(m[1])
  }

  scan(/\b(\d{4,6}-M\d+)\b/gi)                                          // MC inline code
  scan(/metrocuadrado\.com\/[^\s"')>]*\/(\d{5,10})/gi)                  // MC URL
  scan(/fincaraiz\.com\.co\/[^\s"')>]*\/(\d{6,12})/gi)                  // FR URL
  scan(/https?:\/\/\S+[ \t]+(\d{4,12})(?=[\s?#]|$)/gi)                  // Bubble pattern
  scan(/(?:c[oó]digo|cod\.|ref\.?|#)\s*:?\s*(\d{4,12})/gi)              // explicit mention

  return Array.from(codes)
}

// ── Property hydration (tool results) ─────────────────────────────────────

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

// ── Property hydration (direct DB row fallback) ────────────────────────────

function mapRowToAtlas(row: any, aiText: string, idx: number): AtlasProperty {
  const tags = deriveTags(row)
  const mood = deriveMood(row)
  const jitter = row.id
    ? (row.id.charCodeAt(0) + row.id.charCodeAt(row.id.length - 1)) % 15
    : 5
  const match_score = Math.min(99, Math.max(82, 97 - idx * 4 + jitter))

  const sentences = aiText.split(/(?<=[.!?])\s+/)
  const identifier = row.codigo ?? ''
  const agent_insight = identifier
    ? sentences.find(s => s.toLowerCase().includes(identifier.toLowerCase()))?.trim() ?? null
    : null

  return {
    id: row.id,
    codigo: row.codigo,
    ubicacion: row.ubicacion ?? '',
    ciudad: row.ciudad ?? null,
    tipo_inmueble: row.tipo_inmueble ?? null,
    tipo_negocio: row.tipo_negocio ?? null,
    precio: row.precio,
    area_m2: row.area_m2 ?? null,
    habitaciones: row.habitaciones ?? null,
    banos: row.banos ?? null,
    parqueaderos: row.parqueaderos ?? null,
    estrato: row.estrato ?? null,
    imagenes: row.imagenes ?? [],
    descripcion: row.descripcion ?? null,
    cashback_amount: row.cashback_amount ?? null,
    cashback_rate: row.cashback_rate ?? null,
    empresa_id: row.empresa_id ?? null,
    caracteristicas: row.caracteristicas ?? {},
    tags,
    mood,
    match_score,
    agent_insight,
  } satisfies AtlasProperty
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

    // portal_sessions.empresa_id is NOT NULL — fall back to portal empresa
    if (session_id && conversacion) {
      await db.from('portal_sessions').upsert(
        {
          session_id,
          empresa_id: empresa_id ?? PORTAL_EMPRESA_ID,
          conversacion_id: conversacion.id,
          last_response_id: null,
          metadata: {},
        },
        { onConflict: 'session_id' }
      )
    }
  }

  if (previous_response_id && conversacion && !conversacion.last_response_id) {
    conversacion = { ...conversacion, last_response_id: previous_response_id }
  }

  // ── Build enriched message ────────────────────────────────────────────────
  const intentList = Array.isArray(intents) ? intents : []
  const timestampedMessage = buildTimestampedContent(message, intentList)

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

  if (conversacion) {
    await db.from('mensaje').insert({
      conversacion_id: conversacion.id,
      rol: 'user',
      texto: message,
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
  let atlasProperties = hydrateAtlasProperties(result.properties, result.text)

  // ── Fallback: extract codes from AI text and fetch directly from DB ────────
  // Handles the case where the AI mentions properties in text without the tool
  // returning results (e.g. DB not yet seeded, or AI describes a specific unit).
  if (atlasProperties.length === 0 && result.text) {
    const codes = extractCodesFromText(result.text)

    if (codes.length > 0) {
      const orClauses = codes.flatMap(c => [
        `codigo.eq.${c}`,
        `codigo_finca_raiz.eq.${c}`,
        `codigo_metro_cuadrado.eq.${c}`,
        `codigo_domus.eq.${c}`,
        `codigo_identificador.eq.${c}`,
      ]).join(',')

      const { data: fallback } = await db
        .from('propiedades')
        .select(
          'id, codigo, ubicacion, ciudad, tipo_inmueble, tipo_negocio, precio, ' +
          'area_m2, habitaciones, banos, parqueaderos, estrato, imagenes, descripcion, ' +
          'cashback_amount, cashback_rate, empresa_id, caracteristicas'
        )
        .or(orClauses)
        .eq('estado', 'activo')
        .limit(5)

      if (fallback?.length) {
        atlasProperties = fallback.map((row, idx) => mapRowToAtlas(row, result.text, idx))
      }
    }
  }

  // Parse references for the frontend so it can render clickable chips
  const references = parseReferencesFromText(result.text)

  return NextResponse.json({
    text: result.text,
    properties: atlasProperties,
    references,
    response_id: result.responseId,
    conversation_id: conversacion?.id,
  })
}
