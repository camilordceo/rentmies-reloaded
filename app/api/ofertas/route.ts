import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { notifyAdmin } from '@/lib/admin-notify'

export async function POST(req: NextRequest) {
  let body: Record<string, unknown>
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'JSON inválido' }, { status: 400 })
  }

  const required = ['empresa_id', 'propiedad_id', 'nombre_contacto', 'telefono', 'tipo_negocio', 'monto_oferta']
  for (const field of required) {
    if (!body[field]) {
      return NextResponse.json({ error: `Campo requerido: ${field}` }, { status: 400 })
    }
  }

  const monto_oferta = Number(body.monto_oferta)
  const tipo = String(body.tipo_negocio) as 'Venta' | 'Arriendo'
  const cashback_estimado = Math.round(monto_oferta * (tipo === 'Arriendo' ? 0.10 : 0.01))

  const db = createAdminClient()

  // 1. Create offer
  const { data: oferta, error: ofertaError } = await db
    .from('ofertas')
    .insert({
      empresa_id: body.empresa_id,
      propiedad_id: body.propiedad_id,
      nombre_contacto: body.nombre_contacto,
      telefono: body.telefono,
      email: body.email ?? null,
      tipo_negocio: tipo,
      monto_oferta,
      mensaje: body.mensaje ?? null,
      cashback_estimado,
      comprador_id: body.comprador_id ?? null,
      metadata: body.metadata ?? {},
    })
    .select('id')
    .single()

  if (ofertaError || !oferta) {
    return NextResponse.json({ error: ofertaError?.message ?? 'Error al crear oferta' }, { status: 500 })
  }

  // 2. Fetch property name for notification
  const { data: propiedad } = await db
    .from('propiedades')
    .select('ubicacion, ciudad, codigo')
    .eq('id', String(body.propiedad_id))
    .single()

  const propNombre = propiedad
    ? `${propiedad.ubicacion ?? propiedad.codigo}${propiedad.ciudad ? ' · ' + propiedad.ciudad : ''}`
    : String(body.propiedad_id)

  // 3. Notify admin via WhatsApp
  const msg = [
    '🏠 *Nueva oferta en Rentmies*',
    `Propiedad: ${propNombre}`,
    `Oferta: $${monto_oferta.toLocaleString('es-CO')} COP`,
    `Tipo: ${tipo}`,
    `Contacto: ${body.nombre_contacto} — ${body.telefono}`,
    body.email ? `Email: ${body.email}` : null,
    `Cashback estimado: $${cashback_estimado.toLocaleString('es-CO')} COP`,
    body.mensaje ? `Mensaje: "${body.mensaje}"` : null,
  ]
    .filter(Boolean)
    .join('\n')

  await notifyAdmin(msg)

  // 4. Upsert lead in CRM
  const { data: pipeline } = await db
    .from('pipelines')
    .select('id, pipeline_etapas(id)')
    .eq('empresa_id', String(body.empresa_id))
    .limit(1)
    .single()

  if (pipeline) {
    const etapas = (pipeline.pipeline_etapas as Array<{ id: string }>) ?? []
    const firstEtapa = etapas[0]?.id ?? null

    await db.from('leads').insert({
      empresa_id: body.empresa_id,
      pipeline_id: pipeline.id,
      etapa_id: firstEtapa,
      nombre: body.nombre_contacto,
      telefono: body.telefono,
      email: body.email ?? null,
      origen: 'Web',
      propiedad_interes_id: body.propiedad_id,
      notas: `Oferta vía Living Atlas: $${monto_oferta.toLocaleString('es-CO')} COP. Cashback estimado: $${cashback_estimado.toLocaleString('es-CO')}.`,
      activo: true,
    })
  }

  // 5. Mark offer as admin-notified
  await db.from('ofertas').update({ admin_notified: true }).eq('id', oferta.id)

  return NextResponse.json({ ok: true, oferta_id: oferta.id, cashback_estimado }, { status: 201 })
}

export async function GET(req: NextRequest) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })

  const db = createAdminClient()
  const { data: profile } = await db.from('profiles').select('rol, empresa_id').eq('id', user.id).single()

  if (!profile) return NextResponse.json({ error: 'Perfil no encontrado' }, { status: 404 })

  const { searchParams } = new URL(req.url)
  const estado = searchParams.get('estado')
  const limit = parseInt(searchParams.get('limit') || '50')
  const offset = parseInt(searchParams.get('offset') || '0')

  let query = db
    .from('ofertas')
    .select(`
      *,
      propiedades(codigo, ubicacion, ciudad, tipo_negocio, precio, imagenes)
    `)
    .order('created_at', { ascending: false })
    .range(offset, offset + limit - 1)

  if (profile.rol !== 'admin' && profile.empresa_id) {
    query = query.eq('empresa_id', profile.empresa_id)
  }

  if (estado) query = query.eq('estado', estado)

  const { data, error } = await query

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  return NextResponse.json({ data })
}
