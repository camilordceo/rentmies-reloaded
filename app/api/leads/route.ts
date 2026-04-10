import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'

export async function GET(req: NextRequest) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { searchParams } = new URL(req.url)
  const empresaId = searchParams.get('empresa_id')
  const pipelineId = searchParams.get('pipeline_id')
  const etapaId = searchParams.get('etapa_id')

  const db = createAdminClient()
  let query = db.from('leads').select('*, agentes(id,nombre)').eq('activo', true).order('updated_at', { ascending: false })
  if (empresaId) query = query.eq('empresa_id', empresaId)
  if (pipelineId) query = query.eq('pipeline_id', pipelineId)
  if (etapaId) query = query.eq('etapa_id', etapaId)

  const { data, error } = await query
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ data })
}

export async function POST(req: NextRequest) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await req.json()
  const { nombre, telefono, agente_asignado_id, empresa_id, pipeline_id, etapa_id, origen } = body
  if (!nombre || !empresa_id || !pipeline_id || !etapa_id) {
    return NextResponse.json({ error: 'Faltan campos requeridos' }, { status: 400 })
  }

  const db = createAdminClient()
  const { data, error } = await db.from('leads').insert({
    nombre, telefono, agente_asignado_id: agente_asignado_id || null,
    empresa_id, pipeline_id, etapa_id,
    origen: origen || null, activo: true,
  }).select('*, agentes(id,nombre)').single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ data }, { status: 201 })
}
