import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

function getDB() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )
}

// GET /api/agents — list all WhatsApp AI agents
export async function GET(req: NextRequest) {
  const supabase = getDB()
  const { searchParams } = new URL(req.url)
  const empresaId = searchParams.get('empresa_id')

  let query = supabase
    .from('whatsapp_ai')
    .select('*, empresas(nombre, plan)')
    .order('created_at', { ascending: false })

  if (empresaId) {
    query = query.eq('empresa_id', empresaId)
  }

  const { data, error } = await query

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ data })
}

// POST /api/agents — create new WhatsApp AI agent
export async function POST(req: NextRequest) {
  const supabase = getDB()

  let body: Record<string, unknown>
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  const required = ['empresa_id', 'empresa_nombre', 'assistant_id', 'channel_uuid_callbell', 'numero_whatsapp']
  for (const field of required) {
    if (!body[field]) {
      return NextResponse.json({ error: `Missing field: ${field}` }, { status: 400 })
    }
  }

  const { data, error } = await supabase
    .from('whatsapp_ai')
    .insert({
      empresa_id: body.empresa_id,
      empresa_nombre: body.empresa_nombre,
      assistant_id: body.assistant_id,
      channel_uuid_callbell: body.channel_uuid_callbell,
      numero_whatsapp: (body.numero_whatsapp as string).replace(/[^\d]/g, ''),
      nombre_agente: body.nombre_agente || null,
      activo: body.activo ?? true,
      configuracion_extra: body.configuracion_extra || {},
    })
    .select()
    .single()

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ data }, { status: 201 })
}
