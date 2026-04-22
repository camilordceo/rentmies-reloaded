import type { ToolDefinition } from '../types'

export const TOOL_DEFINITIONS: ToolDefinition[] = [
  {
    type: 'function',
    name: 'buscar_propiedades',
    description:
      'Busca propiedades en el inventario. Úsala cuando el usuario pregunte por inmuebles, apartamentos, casas, precios, ubicaciones o características. ' +
      'También úsala cuando el usuario pegue un enlace de Finca Raíz, Metro Cuadrado o Domus — extrae el código automáticamente.',
    parameters: {
      type: 'object',
      properties: {
        tipo_inmueble: {
          type: 'string',
          enum: ['Apartamento', 'Casa', 'Oficinas', 'Finca-recreacion', 'Lote', 'Local', 'Bodega'],
          description: 'Tipo de inmueble',
        },
        tipo_negocio: {
          type: 'string',
          enum: ['Venta', 'Arriendo'],
          description: 'Venta o Arriendo',
        },
        ciudad: {
          type: 'string',
          description: 'Ciudad. Ej: Bogotá, Medellín, Barranquilla, Cali',
        },
        barrio: {
          type: 'string',
          description: 'Barrio o sector. Ej: Chicó, El Poblado, Laureles, Usaquén',
        },
        precio_min: { type: 'number', description: 'Precio mínimo en COP' },
        precio_max: { type: 'number', description: 'Precio máximo en COP' },
        habitaciones_min: { type: 'integer', description: 'Mínimo de habitaciones' },
        area_min: { type: 'number', description: 'Área mínima en m²' },
        caracteristicas: {
          type: 'string',
          description: 'Búsqueda libre de características o URL de portal (MC/FR/Domus). Ej: terraza, piscina, amoblado, https://www.metrocuadrado.com/...',
        },
        codigo: {
          type: 'string',
          description: 'Código de propiedad — interno, Finca Raíz, Metro Cuadrado, Domus, o Código Identificador',
        },
        limite: { type: 'integer', description: 'Máximo de resultados. Default 5, máx 10.' },
      },
      required: [],
    },
  },
  {
    type: 'function',
    name: 'obtener_detalle_propiedad',
    description:
      'Obtiene el detalle completo de una propiedad por código. Úsalo cuando el usuario pida más información sobre una propiedad ya mostrada.',
    parameters: {
      type: 'object',
      properties: {
        codigo: { type: 'string', description: 'Código de la propiedad' },
      },
      required: ['codigo'],
    },
  },
  {
    type: 'function',
    name: 'agendar_cita',
    description: 'Agenda una cita para visitar una propiedad.',
    parameters: {
      type: 'object',
      properties: {
        propiedad_codigo: { type: 'string', description: 'Código de la propiedad' },
        fecha_hora: { type: 'string', description: "Fecha y hora. Ej: 'mañana a las 3pm'" },
        nombre_contacto: { type: 'string', description: 'Nombre del contacto' },
        telefono: { type: 'string', description: 'Teléfono del contacto' },
      },
      required: ['fecha_hora'],
    },
  },
  {
    type: 'function',
    name: 'consultar_estado_tramite',
    description: 'Consulta el estado de un trámite, solicitud o PQRS del usuario.',
    parameters: {
      type: 'object',
      properties: {
        telefono: { type: 'string', description: 'Teléfono para buscar trámites' },
      },
      required: ['telefono'],
    },
  },
]
