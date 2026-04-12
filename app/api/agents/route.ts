import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'

async function requireAdmin() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: NextResponse.json({ error: 'Unauthorized' }, { status: 401 }) }

  const db = createAdminClient()
  const { data: profile } = await db.from('profiles').select('rol').eq('id', user.id).single()
  if (profile?.rol !== 'admin') return { error: NextResponse.json({ error: 'Forbidden' }, { status: 403 }) }

  return { db }
}

// GET /api/agents — list all AI agents
export async function GET(req: NextRequest) {
  const auth = await requireAdmin()
  if (auth.error) return auth.error

  const { searchParams } = new URL(req.url)
  const empresaId = searchParams.get('empresa_id')

  let query = auth.db
    .from('agentes_ia')
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

// POST /api/agents — create new AI agent
export async function POST(req: NextRequest) {
  const auth = await requireAdmin()
  if (auth.error) return auth.error

  let body: Record<string, unknown>
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  const required = ['empresa_id', 'assistant_id', 'channel_uuid_callbell', 'numero_whatsapp']
  for (const field of required) {
    if (!body[field]) {
      return NextResponse.json({ error: `Missing field: ${field}` }, { status: 400 })
    }
  }

  // Accept nombre_agente (legacy form field) mapped to nombre
  const nombre = (body.nombre_agente as string) || (body.nombre as string) || null
  const metadata = body.configuracion_extra ?? body.metadata ?? {}

  const { data, error } = await auth.db
    .from('agentes_ia')
    .insert({
      empresa_id: body.empresa_id,
      empresa_nombre: body.empresa_nombre ?? null,
      nombre: nombre ?? 'Agente WhatsApp',
      canal: (body.canal as string) || 'whatsapp',
      assistant_id: body.assistant_id,
      channel_uuid_callbell: body.channel_uuid_callbell,
      numero_whatsapp: (body.numero_whatsapp as string).replace(/[^\d]/g, ''),
      activo: body.activo ?? true,
      metadata,
    })
    .select()
    .single()

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ data }, { status: 201 })
}
