import { createAdminClient } from '../../supabase/admin'

export async function obtenerDetallePropiedad(codigo: string, empresa_id: string) {
  const db = createAdminClient()
  const { data, error } = await db
    .from('propiedades')
    .select('*')
    .eq('empresa_id', empresa_id)
    .or(`codigo.eq.${codigo},codigo_portal.eq.${codigo}`)
    .eq('estado', 'activo')
    .single()

  if (error || !data) return { error: `Propiedad ${codigo} no encontrada` }

  return {
    codigo: data.codigo,
    tipo: data.tipo_inmueble,
    negocio: data.tipo_negocio,
    ubicacion: data.ubicacion,
    ciudad: data.ciudad,
    precio: data.precio,
    precio_administracion: data.precio_administracion,
    area_m2: data.area_m2,
    habitaciones: data.habitaciones,
    banos: data.banos,
    parqueaderos: data.parqueaderos,
    descripcion: data.descripcion,
    caracteristicas: data.caracteristicas,
    imagenes: data.imagenes ?? [],
    enlace: data.enlace_portal,
  }
}
