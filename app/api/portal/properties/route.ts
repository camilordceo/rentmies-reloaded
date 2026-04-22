import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { deriveMood, deriveTags, computeMatchScore } from '@/lib/atlas-helpers'
import type { AtlasProperty } from '@/store/atlas-store'

export const revalidate = 60

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const tipo_negocio = searchParams.get('tipo_negocio')
  const ciudad = searchParams.get('ciudad')
  const precio_min = searchParams.get('precio_min')
  const precio_max = searchParams.get('precio_max')
  const habitaciones = searchParams.get('habitaciones')
  const tipo_inmueble = searchParams.get('tipo_inmueble')
  const intents = searchParams.getAll('intents')

  const db = createAdminClient()

  let query = db
    .from('propiedades')
    .select(
      'id, codigo, ubicacion, ciudad, zona, tipo_inmueble, tipo_negocio, ' +
      'precio, area_m2, habitaciones, banos, parqueaderos, estrato, ' +
      'descripcion, imagenes, cashback_amount, cashback_rate, ' +
      'empresa_id, caracteristicas, codigo_finca_raiz, codigo_metro_cuadrado, ' +
      'codigo_domus, ficha_tecnica_url, video_url'
    )
    .eq('estado', 'activo')
    .not('precio', 'is', null)
    .gt('precio', 0)
    .order('precio', { ascending: false })
    .limit(60)

  if (tipo_negocio) query = query.ilike('tipo_negocio', `%${tipo_negocio}%`)
  if (ciudad) query = query.or(`ciudad.ilike.%${ciudad}%,ubicacion.ilike.%${ciudad}%`)
  if (precio_min) query = query.gte('precio', Number(precio_min))
  if (precio_max) query = query.lte('precio', Number(precio_max))
  if (habitaciones) query = query.gte('habitaciones', Number(habitaciones))
  if (tipo_inmueble) query = query.ilike('tipo_inmueble', tipo_inmueble)

  const { data, error } = await query

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  const rows = (data ?? []) as any[]

  const scored: AtlasProperty[] = rows.map((row) => {
    const tags = deriveTags(row)
    const mood = deriveMood(row)
    // Deterministic jitter so scores are stable between renders
    const jitter = row.id
      ? (row.id.charCodeAt(0) + row.id.charCodeAt(row.id.length - 1)) % 20
      : 10
    const match_score = intents.length > 0
      ? computeMatchScore({ ...row, tags, mood }, intents)
      : 70 + jitter

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
      agent_insight: null,
    } satisfies AtlasProperty
  })

  scored.sort((a, b) => b.match_score - a.match_score)

  return NextResponse.json({ properties: scored, total: scored.length })
}
