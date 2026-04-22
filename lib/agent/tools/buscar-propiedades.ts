import { createAdminClient } from '../../supabase/admin'
import { generateEmbedding } from '../../embeddings'
import type { PropertySearchParams } from '../../types'

function formatCOP(n: number | null): string {
  if (!n) return '—'
  return new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 }).format(n)
}

// All columns needed for both AI context text and frontend AtlasProperty hydration
const ATLAS_SELECT = [
  'id', 'codigo', 'codigo_portal', 'codigo_finca_raiz', 'codigo_metro_cuadrado',
  'ubicacion', 'ciudad', 'area_m2', 'tipo_inmueble', 'tipo_negocio',
  'precio', 'precio_administracion', 'descripcion', 'habitaciones',
  'banos', 'parqueaderos', 'estrato', 'imagenes', 'enlace_portal',
  'caracteristicas', 'empresa_id', 'cashback_amount', 'cashback_rate',
].join(', ')

export async function buscarPropiedades(params: PropertySearchParams) {
  let embedding: number[] | null = null

  if (params.caracteristicas) {
    const searchText = [params.tipo_inmueble, params.tipo_negocio, params.ciudad, params.caracteristicas]
      .filter(Boolean).join(' ')
    try { embedding = await generateEmbedding(searchText) } catch { /* graceful degradation */ }
  }

  const db = createAdminClient()
  let data: any[], error: any

  if (params.empresa_id) {
    // Per-empresa: hybrid SQL+vector RPC
    const res = await db.rpc('buscar_propiedades_hibrido', {
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
    data = res.data || []
    error = res.error
  } else {
    // Global: SQL across all active properties
    let q = db
      .from('propiedades')
      .select(ATLAS_SELECT)
      .eq('estado', 'activo')

    if (params.tipo_inmueble) q = q.ilike('tipo_inmueble', params.tipo_inmueble)
    if (params.tipo_negocio) q = q.ilike('tipo_negocio', `%${params.tipo_negocio}%`)
    if (params.ciudad) q = q.or(`ubicacion.ilike.%${params.ciudad}%,ciudad.ilike.%${params.ciudad}%`)
    if (params.precio_min) q = q.gte('precio', params.precio_min)
    if (params.precio_max) q = q.lte('precio', params.precio_max)
    if (params.habitaciones_min) q = q.gte('habitaciones', params.habitaciones_min)
    if (params.area_min) q = q.gte('area_m2', params.area_min)
    if (params.codigo) {
      // Match against all known code columns
      q = q.or(
        `codigo.eq.${params.codigo},` +
        `codigo_portal.eq.${params.codigo},` +
        `codigo_finca_raiz.eq.${params.codigo},` +
        `codigo_metro_cuadrado.eq.${params.codigo}`
      )
    }

    const res = await q.order('created_at', { ascending: false }).limit(params.limite ?? 5)
    data = res.data || []
    error = res.error
  }

  if (error) throw new Error(`buscar_propiedades: ${error.message}`)

  return data.map((p: any) => ({
    // — Compact text for AI context —
    codigo: p.codigo,
    codigo_fr: p.codigo_finca_raiz ?? null,
    codigo_mc: p.codigo_metro_cuadrado ?? null,
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
    // — Full numeric fields for AtlasProperty hydration in /api/chat —
    _id: p.id,
    _precio_num: p.precio,
    _imagenes: p.imagenes ?? [],
    _cashback_amount: p.cashback_amount ?? null,
    _cashback_rate: p.cashback_rate ?? null,
    _empresa_id: p.empresa_id,
    _caracteristicas: p.caracteristicas ?? {},
    _estrato: p.estrato ?? null,
  }))
}
