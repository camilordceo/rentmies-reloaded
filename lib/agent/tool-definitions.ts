import type { ToolDefinition } from '../types'

export const TOOL_DEFINITIONS: ToolDefinition[] = [
  {
    type: 'function',
    name: 'buscar_propiedades',
    description:
      'Busca propiedades en el inventario de la inmobiliaria. Usa esta herramienta cuando el usuario pregunte por inmuebles, apartamentos, casas, oficinas, lotes, fincas, o cualquier propiedad. También úsala cuando pregunte por precio, ubicación, o características como terraza, parqueadero, piscina, etc.',
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
          description: 'Ciudad o zona. Ej: Medellín, El Poblado, Bogotá, Chicó',
        },
        precio_min: { type: 'number', description: 'Precio mínimo en COP' },
        precio_max: { type: 'number', description: 'Precio máximo en COP' },
        habitaciones_min: { type: 'integer', description: 'Habitaciones mínimas' },
        area_min: { type: 'number', description: 'Área mínima en m2' },
        caracteristicas: {
          type: 'string',
          description: 'Búsqueda libre: terraza, piscina, parqueadero, vista, amoblado, etc.',
        },
        codigo: { type: 'string', description: 'Código específico de propiedad' },
        limite: { type: 'integer', description: 'Máx resultados. Default 5.' },
      },
      required: [],
    },
  },
  {
    type: 'function',
    name: 'obtener_detalle_propiedad',
    description:
      'Obtiene el detalle completo de una propiedad por código. Úsalo cuando el usuario pida más info sobre una propiedad ya mostrada.',
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
        fecha_preferida: {
          type: 'string',
          description: "Fecha y hora en texto libre. Ej: 'mañana a las 3pm'",
        },
        nombre_contacto: { type: 'string', description: 'Nombre del contacto' },
        telefono: { type: 'string', description: 'Teléfono del contacto' },
      },
      required: ['fecha_preferida'],
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
