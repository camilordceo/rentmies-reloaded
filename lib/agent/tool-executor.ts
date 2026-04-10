import { buscarPropiedades } from './tools/buscar-propiedades'
import { obtenerDetallePropiedad } from './tools/detalle-propiedad'
import { agendarCita } from './tools/agendar-cita'
import { consultarTramite } from './tools/consultar-tramite'

export async function executeToolCall(
  name: string,
  args: Record<string, unknown>,
  empresa_id: string
): Promise<unknown> {
  switch (name) {
    case 'buscar_propiedades':
      return buscarPropiedades({ ...(args as any), empresa_id })

    case 'obtener_detalle_propiedad':
      return obtenerDetallePropiedad(args.codigo as string, empresa_id)

    case 'agendar_cita':
      return agendarCita({ ...(args as any), empresa_id })

    case 'consultar_estado_tramite':
      return consultarTramite(args.telefono as string, empresa_id)

    default:
      return { error: `Tool "${name}" no implementada` }
  }
}
