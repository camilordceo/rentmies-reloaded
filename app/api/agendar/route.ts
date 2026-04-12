import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'

export async function POST(req: NextRequest) {
  const { empresa_id, propiedad_codigo, nombre_contacto, telefono, fecha_hora } = await req.json()
  if (!empresa_id || !telefono || !fecha_hora) {
    return NextResponse.json({ error: 'Faltan campos requeridos' }, { status: 400 })
  }

  const db = createAdminClient()

  let propiedad_id: string | null = null
  if (propiedad_codigo) {
    const { data } = await db
      .from('propiedades')
      .select('id')
      .eq('empresa_id', empresa_id)
      .or(`codigo.eq.${propiedad_codigo},codigo_portal.eq.${propiedad_codigo}`)
      .single()
    propiedad_id = data?.id ?? null
  }

  const { data, error } = await db
    .from('citas')
    .insert({ empresa_id, propiedad_id, nombre_contacto, telefono, fecha_hora, estado: 'programada' })
    .select('id')
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ ok: true, cita_id: data.id }, { status: 201 })
}
