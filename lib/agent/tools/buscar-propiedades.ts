import { createAdminClient } from '../../supabase/admin'
import { generateEmbedding } from '../../embeddings'
import type { PropertySearchParams } from '../../types'

function formatCOP(n: number | null): string {
  if (!n) return '—'
  return new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    maximumFractionDigits: 0,
  }).format(n)
}

export async function buscarPropiedades(params: PropertySearchParams) {
  let embedding: number[] | null = null

  if (params.caracteristicas) {
    const searchText = [
      params.tipo_inmueble,
      params.tipo_negocio,
      params.ciudad,
      params.caracteristicas,
    ]
      .filter(Boolean)
      .join(' ')
    try {
      embedding = await generateEmbedding(searchText)
    } catch {
      // graceful: continue with SQL-only if embeddings fail
    }
  }

  const db = createAdminClient()
  const { data, error } = await db.rpc('buscar_propiedades_hibrido', {
    p_empresa_id: params.empresa_id,
    p_embedding: embedding,
    p_tipo_inmueble: params.tipo_inmueble ?? null,
    p_tipo_negocio: params.tipo_negocio ?? null,
    p_ciudad: params.ciudad ?? null,
    p_precio_min: params.precio_min ?? null,
    p_precio_max: params.precio_max ?? null,
    p_habitaciones_min: params.habitaciones_min ?? null,
    p_area_min: params.area_min ?? null,
    p_codigo: params.codigo ?? null,
    p_limite: params.limite ?? 5,
  })

  if (error) throw new Error(`buscar_propiedades: ${error.message}`)

  return (data || []).map((p: any) => ({
    codigo: p.codigo,
    tipo: p.tipo_inmueble,
    negocio: p.tipo_negocio,
    ubicacion: p.ubicacion,
    ciudad: p.ciudad,
    precio: formatCOP(p.precio),
    administracion: p.precio_administracion ? formatCOP(p.precio_administracion) : null,
    area_m2: p.area_m2,
    habitaciones: p.habitaciones,
    banos: p.banos,
    parqueaderos: p.parqueaderos,
    descripcion: p.descripcion?.substring(0, 200) ?? null,
    enlace: p.enlace_portal,
    imagen: p.imagenes?.[0] ?? null,
  }))
}
