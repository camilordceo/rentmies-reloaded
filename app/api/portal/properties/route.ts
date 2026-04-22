import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import type { AtlasProperty } from '@/store/atlas-store'
import { deriveMood, deriveTags } from '@/store/atlas-store'

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
    .select(`
      id, codigo, ubicacion, ciudad, tipo_inmueble, tipo_negocio,
      precio, area_m2, habitaciones, banos, parqueaderos, estrato,
      descripcion, imagenes, cashback_amount, cashback_rate,
      empresa_id, caracteristicas
    `)
    .eq('estado', 'activo')
    .not('precio', 'is', null)
    .not('imagenes', 'eq', '{}')
    .order('precio', { ascending: false })
    .limit(40)

  if (tipo_negocio) query = query.eq('tipo_negocio', tipo_negocio)
  if (ciudad) query = query.ilike('ciudad', `%${ciudad}%`)
  if (precio_min) query = query.gte('precio', Number(precio_min))
  if (precio_max) query = query.lte('precio', Number(precio_max))
  if (habitaciones) query = query.gte('habitaciones', Number(habitaciones))
  if (tipo_inmueble) query = query.eq('tipo_inmueble', tipo_inmueble)

  const { data, error } = await query

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  const rows = (data ?? []) as any[]

  // Score each property by intent overlap
  const scored: AtlasProperty[] = rows.map((row) => {
    const tags = deriveTags(row as AtlasProperty)
    const mood = deriveMood(row as AtlasProperty)
    const text = [row.descripcion, row.ubicacion, row.ciudad, ...tags, mood]
      .join(' ')
      .toLowerCase()

    let match_score = 72
    if (intents.length > 0) {
      const hits = intents.filter((it) => text.includes(it.toLowerCase())).length
      match_score = Math.min(99, 60 + Math.round((hits / intents.length) * 35))
    }

    return {
      ...row,
      imagenes: row.imagenes ?? [],
      caracteristicas: row.caracteristicas ?? {},
      match_score,
      agent_insight: null,
      tags,
      mood,
    } as AtlasProperty
  })

  // Sort by match score descending
  scored.sort((a, b) => b.match_score - a.match_score)

  return NextResponse.json({ properties: scored, total: scored.length })
}
