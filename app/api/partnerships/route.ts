import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

function supabaseService() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )
}

async function logEvent(level: 'info' | 'warn' | 'error', message: string, context?: object) {
  try {
    const sb = supabaseService()
    await sb.from('admin_logs').insert({ level, source: 'partnerships-form', message, context: context ?? null })
  } catch {
    // log silently
  }
}

async function sendWhatsApp(data: Record<string, string>) {
  const token = process.env.CALLBELL_TOKEN
  const phone = process.env.PARTNERSHIPS_NOTIFY_PHONE || '+573103565492'
  const channelUuid = process.env.CALLBELL_CHANNEL_UUID || ''

  if (!token) {
    await logEvent('warn', 'CALLBELL_TOKEN no configurado — WhatsApp no enviado')
    return { ok: false, reason: 'token_missing' }
  }

  const msg = [
    '🏢 *Nueva aplicación de alianza - Rentmies*',
    '',
    `👤 ${data.full_name}`,
    `🏠 ${data.brokerage_name}`,
    `📍 ${data.city}`,
    `👥 Asesores: ${data.num_agents}`,
    `📱 ${data.phone}`,
    `📧 ${data.email}`,
    '',
    `📣 Canales: ${data.marketing_channels || 'N/A'}`,
    `🎯 Reto: ${data.growth_challenge || 'N/A'}`,
  ].join('\n')

  const payload: Record<string, unknown> = {
    to: phone,
    from: 'whatsapp',
    type: 'text',
    content: { text: msg },
  }
  if (channelUuid) payload.channel_uuid = channelUuid

  const res = await fetch('https://api.callbell.eu/v1/messages/send', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(payload),
  })

  const responseText = await res.text()

  if (!res.ok) {
    await logEvent('error', `Callbell HTTP ${res.status}`, { status: res.status, body: responseText, payload })
    return { ok: false, reason: `callbell_${res.status}`, detail: responseText }
  }

  await logEvent('info', 'WhatsApp enviado correctamente', { to: phone })
  return { ok: true }
}

export async function POST(req: NextRequest) {
  try {
    const data = await req.json()
    const { full_name, email, brokerage_name, city, num_agents, phone, marketing_channels, growth_challenge } = data

    // Validate required fields
    const required: Record<string, unknown> = { full_name, email, brokerage_name, city, num_agents, phone }
    const missing = Object.entries(required)
      .filter(([, v]) => !v || String(v).trim() === '')
      .map(([k]) => k)

    if (missing.length > 0) {
      return NextResponse.json({ error: 'Faltan campos obligatorios', missing }, { status: 400 })
    }

    const sb = supabaseService()

    // 1. Save to Supabase (source of truth — always first)
    const { data: saved, error: dbError } = await sb
      .from('partnership_applications')
      .insert({
        full_name: String(full_name).trim(),
        email: String(email).trim(),
        brokerage_name: String(brokerage_name).trim(),
        city: String(city).trim(),
        num_agents: String(num_agents),
        phone: String(phone).trim(),
        marketing_channels: marketing_channels ? String(marketing_channels).trim() : null,
        growth_challenge: growth_challenge ? String(growth_challenge).trim() : null,
      })
      .select('id')
      .single()

    if (dbError) {
      await logEvent('error', 'Error guardando en Supabase', { error: dbError.message, code: dbError.code })
      return NextResponse.json({ error: 'Error al guardar la aplicación' }, { status: 500 })
    }

    await logEvent('info', `Nueva aplicación recibida: ${full_name} — ${brokerage_name}`, {
      application_id: saved?.id,
      city,
      email,
      phone,
    })

    // 2. Send WhatsApp (non-blocking — never fails the request)
    const waResult = await sendWhatsApp({
      full_name: String(full_name),
      brokerage_name: String(brokerage_name),
      city: String(city),
      num_agents: String(num_agents),
      phone: String(phone),
      email: String(email),
      marketing_channels: marketing_channels ? String(marketing_channels) : '',
      growth_challenge: growth_challenge ? String(growth_challenge) : '',
    })

    return NextResponse.json({
      ok: true,
      id: saved?.id,
      whatsapp: waResult.ok ? 'sent' : `skipped:${waResult.reason}`,
    })
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err)
    await logEvent('error', 'Error inesperado en partnerships route', { error: msg })
    return NextResponse.json({ error: 'Error interno' }, { status: 500 })
  }
}
