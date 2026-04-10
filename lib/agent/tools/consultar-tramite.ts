import { createAdminClient } from '../../supabase/admin'
import { normalizePhone } from '../../phone-utils'

export async function consultarTramite(telefono: string, empresa_id: string) {
  const db = createAdminClient()
  const normalized = normalizePhone(telefono)

  // Find lead by phone
  const { data: leads } = await db
    .from('leads')
    .select('id, nombre, etapa_id, pipeline_id, created_at, pipeline_etapas(nombre)')
    .eq('empresa_id', empresa_id)
    .eq('activo', true)
    .ilike('telefono', `%${normalized.slice(-10)}%`)
    .order('created_at', { ascending: false })
    .limit(3)

  if (!leads || leads.length === 0) {
    return { encontrado: false, mensaje: 'No encontramos trámites asociados a este número.' }
  }

  return {
    encontrado: true,
    tramites: leads.map((l: any) => ({
      nombre: l.nombre,
      etapa: (l.pipeline_etapas as any)?.nombre ?? 'Sin etapa',
      desde: l.created_at?.split('T')[0],
    })),
  }
}
