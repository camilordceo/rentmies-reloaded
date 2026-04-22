import { createAdminClient } from '@/lib/supabase/admin'
import type { AtlasProperty } from '@/store/atlas-store'
import { deriveMood, deriveTags } from '@/lib/atlas-helpers'
import { AtlasClient } from './atlas-client'

export const revalidate = 60

async function fetchInitialProperties(): Promise<AtlasProperty[]> {
  try {
    const db = createAdminClient()
    const { data, error } = await db
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
      .limit(24)

    if (error || !data) return []

    return data.map((row: any) => {
      const tags = deriveTags(row as AtlasProperty)
      const mood = deriveMood(row as AtlasProperty)
      return {
        ...row,
        imagenes: row.imagenes ?? [],
        caracteristicas: row.caracteristicas ?? {},
        tags,
        mood,
        match_score: 75,
        agent_insight: null,
      } as AtlasProperty
    })
  } catch {
    return []
  }
}

export default async function AtlasPage() {
  const initialProperties = await fetchInitialProperties()

  return <AtlasClient initialProperties={initialProperties} />
}
