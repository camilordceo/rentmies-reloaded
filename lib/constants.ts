// ============================================================
// RENTMIES — Constants
// ============================================================

export const PLANES = {
  starter: {
    nombre: 'Starter',
    precio: 490000,
    conversaciones: 1000,
    agentes_ia: 1,
    agentes_humanos: 3,
    features: [
      '1,000 conversaciones/mes',
      '1 agente WhatsApp IA',
      'Hasta 3 agentes humanos',
      'CRM básico',
      'Analytics básico',
      'Soporte por email',
    ],
  },
  pro: {
    nombre: 'Pro',
    precio: 990000,
    conversaciones: 5000,
    agentes_ia: 3,
    agentes_humanos: 10,
    features: [
      '5,000 conversaciones/mes',
      '3 agentes WhatsApp IA',
      '1 agente de voz IA',
      'Hasta 10 agentes humanos',
      'CRM completo + Pipelines',
      'Analytics avanzado',
      'Automatizaciones',
      'Soporte prioritario',
    ],
  },
  enterprise: {
    nombre: 'Enterprise',
    precio: 2490000,
    conversaciones: -1, // ilimitado
    agentes_ia: -1,
    agentes_humanos: -1,
    features: [
      'Conversaciones ilimitadas',
      'Agentes IA ilimitados',
      'Agentes humanos ilimitados',
      'CRM + Pipelines personalizados',
      'Analytics en tiempo real',
      'Automatizaciones avanzadas',
      'API personalizada',
      'Manager de cuenta dedicado',
      'SLA garantizado',
    ],
  },
} as const

export const ORIGENES_LEAD = [
  'Metrocuadrado',
  'Ciencuadras',
  'Mercado Libre',
  'Finca Raiz',
  'Domus',
  'Century21',
  'WhatsApp',
  'Llamada',
  'Referido',
  'Web',
  'Otro',
] as const

export const TIPOS_INMUEBLE = [
  'Apartamento',
  'Casa',
  'Oficinas',
  'Finca-recreacion',
  'Lote',
] as const

export const TIPOS_NEGOCIO = ['Venta', 'Arriendo', 'Venta/Arriendo'] as const

export const DIAS_SEMANA = [
  { key: 'lunes', label: 'Lunes' },
  { key: 'martes', label: 'Martes' },
  { key: 'miercoles', label: 'Miércoles' },
  { key: 'jueves', label: 'Jueves' },
  { key: 'viernes', label: 'Viernes' },
  { key: 'sabado', label: 'Sábado' },
  { key: 'domingo', label: 'Domingo' },
] as const

export const TRIGGER_LABELS: Record<string, string> = {
  cambio_etapa: 'Cambio de etapa',
  tiempo: 'Tiempo transcurrido',
  evento: 'Evento',
  cita: 'Evento de cita',
  manual: 'Manual',
}

export const ACCION_LABELS: Record<string, string> = {
  enviar_whatsapp: 'Enviar WhatsApp',
  enviar_email: 'Enviar email',
  mover_etapa: 'Mover de etapa',
  asignar_agente: 'Asignar agente',
  crear_cita: 'Crear cita',
  notificar: 'Notificar',
  cobrar: 'Cobrar via Wompi',
}

export const ETAPAS_DEFAULT = [
  { nombre: 'Asignado', orden: 0 },
  { nombre: 'Seguimiento', orden: 1 },
  { nombre: 'Inmueble Captado', orden: 2 },
  { nombre: 'Negocio Cerrado', orden: 3, es_cierre: true },
  { nombre: 'Desistido', orden: 4, es_perdido: true },
] as const

export const COLORES_ETAPA = [
  '#40d99d', '#4fffb4', '#6b7280',
  '#3b82f6', '#f59e0b', '#dc2626',
  '#8b5cf6', '#ec4899', '#14b8a6',
] as const
