import { createAdminClient } from '../../supabase/admin'
import { generateEmbedding } from '../../embeddings'
import type { PropertySearchParams } from '../../types'

function formatCOP(n: number | null): string {
  if (!n) return '—'
  return new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 }).format(n)
}

// Extract portal codes from MC/FR/Domus URLs
// MC: metrocuadrado.com/.../2671-M6188915 → "2671-M6188915"
// FR: fincaraiz.com.co/.../192797879-... → "192797879"
export function extractPortalCode(text: string): string | null {
  // Metro Cuadrado: last path segment like NNNN-MXXXXXXX
  const mc = text.match(/(?:metrocuadrado\.com\/[^\s]*\/)(\d{4}-M\d+)/i)
  if (mc) return mc[1]
  // Finca Raíz: numeric code at start of last path segment
  const fr = text.match(/(?:fincaraiz\.com\.co\/[^\s]*\/)(\d{6,12})/i)
  if (fr) return fr[1]
  // Domus ficha: /NTAy or encoded — less reliable, skip
  return null
}

// All columns for AtlasProperty hydration
const ATLAS_SELECT = [
  'id', 'codigo', 'codigo_portal', 'codigo_finca_raiz', 'codigo_metro_cuadrado',
  'codigo_domus', 'codigo_identificador',
  'ubicacion', 'ciudad', 'zona', 'area_m2', 'tipo_inmueble', 'tipo_negocio',
  'precio', 'precio_administracion', 'descripcion', 'habitaciones',
  'banos', 'parqueaderos', 'estrato', 'imagenes', 'enlace_portal',
  'ficha_tecnica_url', 'video_url', 'caracteristicas', 'empresa_id',
  'cashback_amount', 'cashback_rate', 'broker_name', 'broker_email',
].join(', ')

function mapToAtlasPayload(p: any) {
  return {
    // ── Text for AI context ──────────────────────────────────────────────
    codigo: p.codigo,
    codigo_fr: p.codigo_finca_raiz ?? null,
    codigo_mc: p.codigo_metro_cuadrado ?? null,
    codigo_domus: p.codigo_domus ?? null,
    tipo: p.tipo_inmueble,
    negocio: p.tipo_negocio,
    ubicacion: p.ubicacion,
    ciudad: p.ciudad,
    zona: p.zona ?? null,
    precio: formatCOP(p.precio),
    administracion: p.precio_administracion ? formatCOP(p.precio_administracion) : null,
    area_m2: p.area_m2,
    habitaciones: p.habitaciones,
    banos: p.banos,
    parqueaderos: p.parqueaderos,
    descripcion: p.descripcion?.substring(0, 300) ?? null,
    enlace: p.enlace_portal ?? p.ficha_tecnica_url,
    broker: p.broker_name ?? null,
    // ── Full numeric data for AtlasProperty hydration ────────────────────
    _id: p.id,
    _precio_num: p.precio,
    _imagenes: p.imagenes ?? [],
    _cashback_amount: p.cashback_amount ?? null,
    _cashback_rate: p.cashback_rate ?? null,
    _empresa_id: p.empresa_id,
    _caracteristicas: p.caracteristicas ?? {},
    _estrato: p.estrato ?? null,
    _video_url: p.video_url ?? null,
    _ficha_url: p.ficha_tecnica_url ?? null,
  }
}

export interface ExtendedSearchParams extends PropertySearchParams {
  barrio?: string
}

export async function buscarPropiedades(params: ExtendedSearchParams) {
  // Extract portal code if user pasted a URL
  if (!params.codigo && params.caracteristicas) {
    const extracted = extractPortalCode(params.caracteristicas)
    if (extracted) params.codigo = extracted
  }

  let embedding: number[] | null = null
  if (params.caracteristicas) {
    const searchText = [params.tipo_inmueble, params.tipo_negocio, params.ciudad, params.barrio, params.caracteristicas]
      .filter(Boolean).join(' ')
    try { embedding = await generateEmbedding(searchText) } catch { /* graceful */ }
  }

  const db = createAdminClient()

  // Use the hybrid RPC for both per-empresa and global searches
  const res = await db.rpc('buscar_propiedades_hibrido', {
    p_empresa_id: params.empresa_id ?? null,
    p_embedding: embedding,
    p_tipo_inmueble: params.tipo_inmueble ?? null,
    p_tipo_negocio: params.tipo_negocio ?? null,
    p_ciudad: params.ciudad ?? null,
    p_precio_min: params.precio_min ?? null,
    p_precio_max: params.precio_max ?? null,
    p_habitaciones_min: params.habitaciones_min ?? null,
    p_area_min: params.area_min ?? null,
    p_codigo: params.codigo ?? null,
    p_barrio: params.barrio ?? null,
    p_limite: params.limite ?? 5,
  })

  if (res.error) throw new Error(`buscar_propiedades: ${res.error.message}`)

  return (res.data ?? []).map(mapToAtlasPayload)
}
