import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { generateEmbedding } from '@/lib/embeddings'

export const maxDuration = 60

const BATCH_SIZE = 20

export async function POST(req: NextRequest) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { searchParams } = new URL(req.url)
  const empresaId = searchParams.get('empresa_id')
  if (!empresaId) return NextResponse.json({ error: 'empresa_id requerido' }, { status: 400 })

  const db = createAdminClient()
  const { data: propiedades, error } = await db
    .from('propiedades')
    .select('id, tipo_inmueble, tipo_negocio, ubicacion, ciudad, habitaciones, banos, area_m2, descripcion, caracteristicas')
    .eq('empresa_id', empresaId)
    .eq('estado', 'activo')
    .is('embedding', null)
    .limit(BATCH_SIZE)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  if (!propiedades || propiedades.length === 0) {
    return NextResponse.json({ processed: 0, message: 'Todas las propiedades ya tienen embedding' })
  }

  let processed = 0
  let errors = 0

  await Promise.all(
    propiedades.map(async (p: any) => {
      try {
        const text = [
          p.tipo_inmueble,
          p.tipo_negocio ? `en ${p.tipo_negocio}` : '',
          p.ubicacion,
          p.ciudad,
          p.habitaciones ? `${p.habitaciones} habitaciones` : '',
          p.banos ? `${p.banos} baños` : '',
          p.area_m2 ? `${p.area_m2} m2` : '',
          p.descripcion,
          p.caracteristicas ? JSON.stringify(p.caracteristicas) : '',
        ]
          .filter(Boolean)
          .join(' ')

        const embedding = await generateEmbedding(text)
        await db.from('propiedades').update({ embedding }).eq('id', p.id)
        processed++
      } catch {
        errors++
      }
    })
  )

  return NextResponse.json({ processed, errors, total: propiedades.length })
}
