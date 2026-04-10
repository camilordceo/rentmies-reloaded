import { createAdminClient } from '../../supabase/admin'

interface AgendarCitaParams {
  empresa_id: string
  propiedad_codigo?: string
  fecha_preferida: string
  nombre_contacto?: string
  telefono?: string
}

export async function agendarCita(params: AgendarCitaParams) {
  const db = createAdminClient()

  // Resolve propiedad id if codigo given
  let propiedad_id: string | null = null
  if (params.propiedad_codigo) {
    const { data } = await db
      .from('propiedades')
      .select('id')
      .eq('empresa_id', params.empresa_id)
      .or(`codigo.eq.${params.propiedad_codigo},codigo_portal.eq.${params.propiedad_codigo}`)
      .single()
    propiedad_id = data?.id ?? null
  }

  const { data, error } = await db
    .from('citas')
    .insert({
      empresa_id: params.empresa_id,
      propiedad_id,
      fecha_preferida: params.fecha_preferida,
      nombre_contacto: params.nombre_contacto ?? null,
      telefono: params.telefono ?? null,
      estado: 'pendiente',
    })
    .select('id')
    .single()

  if (error) throw new Error(`agendar_cita: ${error.message}`)

  return {
    confirmado: true,
    cita_id: data.id,
    mensaje: `Cita agendada para ${params.fecha_preferida}. Un agente confirmará el horario exacto.`,
  }
}
