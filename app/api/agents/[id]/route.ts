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

// GET /api/agents/[id]
export async function GET(_req: NextRequest, { params }: { params: { id: string } }) {
  const auth = await requireAdmin()
  if (auth.error) return auth.error

  const { data, error } = await auth.db
    .from('agentes_ia')
    .select('*, empresas(nombre, plan)')
    .eq('id', params.id)
    .single()

  if (error || !data) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 })
  }

  return NextResponse.json({ data })
}

// PATCH /api/agents/[id]
export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const auth = await requireAdmin()
  if (auth.error) return auth.error

  let body: Record<string, unknown>
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  // Map legacy field names to agentes_ia schema
  if (body.nombre_agente !== undefined) {
    body.nombre = body.nombre_agente
    delete body.nombre_agente
  }
  if (body.configuracion_extra !== undefined) {
    body.metadata = body.configuracion_extra
    delete body.configuracion_extra
  }
  if (body.numero_whatsapp) {
    body.numero_whatsapp = (body.numero_whatsapp as string).replace(/[^\d]/g, '')
  }

  const { data, error } = await auth.db
    .from('agentes_ia')
    .update(body)
    .eq('id', params.id)
    .select()
    .single()

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ data })
}

// DELETE /api/agents/[id]
export async function DELETE(_req: NextRequest, { params }: { params: { id: string } }) {
  const auth = await requireAdmin()
  if (auth.error) return auth.error

  const { error } = await auth.db.from('agentes_ia').delete().eq('id', params.id)

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ success: true })
}
