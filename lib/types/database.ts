// ============================================================
// RENTMIES — Canonical Database Types (single source of truth)
// ============================================================

// ─── Roles ───────────────────────────────────────────────
// 'admin'        — super admin (Rentmies staff)
// 'empresa_admin'— company administrator
// 'agente'       — human sales agent
// 'comprador'    — buyer/renter registered via portal
export type UserRole = 'admin' | 'empresa_admin' | 'agente' | 'comprador'
export type Plan = 'free' | 'starter' | 'pro' | 'enterprise'

// ─── Core ────────────────────────────────────────────────

export interface Profile {
  id: string
  email: string
  nombre: string | null
  rol: UserRole
  empresa_id: string | null
  avatar_url: string | null
  activo: boolean
  metadata: Record<string, unknown>
  created_at: string
  updated_at: string
}

export interface Empresa {
  id: string
  nombre: string
  logo_url: string | null
  plan: Plan
  activo: boolean
  ciudad: string | null
  configuracion: Record<string, unknown>
  created_at?: string
}

// ─── WhatsApp AI (legacy table, kept for FK compat) ──────

export interface WhatsappAI {
  id: string
  empresa_id: string
  empresa_nombre: string
  assistant_id: string
  channel_uuid_callbell: string
  numero_whatsapp: string
  nombre_agente: string | null
  activo: boolean
  configuracion_extra: Record<string, unknown>
  created_at?: string
}

export interface WhatsappAIWithEmpresa extends WhatsappAI {
  empresas: { nombre: string; plan: string } | null
}

// ─── Conversations ────────────────────────────────────────

export interface UserConversacion {
  id: string
  telefono: string
  nombre: string | null
  callbell_contact_uuid: string | null
  metadata: Record<string, unknown>
  created_at?: string
}

export interface Conversacion {
  id: string
  whatsapp_ai_id: string
  user_conversacion_id: string
  activa: boolean
  ultimo_mensaje_at: string | null
  last_response_id: string | null
  metadata: Record<string, unknown>
  created_at?: string
}

export interface ConversacionWithDetails extends Conversacion {
  whatsapp_ai: WhatsappAI | null
  user_conversacion: UserConversacion | null
}

export interface Mensaje {
  id: string
  conversacion_id: string
  rol: 'user' | 'assistant'
  texto: string
  callbell_message_uuid: string | null
  responses_api_correlation_id: string | null
  metadata: Record<string, unknown>
  created_at: string
}

// ─── Legacy UI conversation types (v1 dashboard) ─────────

export interface Conversation {
  id: string
  empresa_id: string | null
  contact_id: string | null
  channel: 'whatsapp' | 'instagram' | 'sms'
  mode: 'ia' | 'manual'
  stage: string
  crm_stage: string
  agent_id: string | null
  ia_agent_id: string | null
  unread: number
  last_message: string | null
  last_message_at: string | null
  last_client_response_at: string | null
  appointment_date: string | null
  appointment_time: string | null
  property_interest: string | null
  budget: string | null
  business_type: string | null
  city_of_interest: string | null
  portal: string | null
  property_code: string | null
  consulted_properties: string[]
  tags: string[]
  created_at: string
  updated_at: string
}

export interface Contact {
  id: string
  empresa_id: string | null
  nombre: string
  phone: string
  email: string | null
  avatar_url: string | null
  location: string | null
  created_at: string
  updated_at: string
}

export interface Message {
  id: string
  conversation_id: string
  sender: 'customer' | 'ia' | 'agent'
  type: 'text' | 'audio' | 'image' | 'document'
  text: string | null
  duration: string | null
  file_name: string | null
  file_size: string | null
  image_url: string | null
  created_at: string
}

export interface ConversationWithContact extends Conversation {
  contacts: Contact | null
}

// ─── Propiedades ─────────────────────────────────────────

export type TipoNegocio = 'Venta' | 'Arriendo' | 'Venta/Arriendo'
export type EstadoPropiedad = 'activo' | 'inactivo' | 'vendido' | 'arrendado'
export type TipoInmueble = 'Apartamento' | 'Casa' | 'Oficinas' | 'Finca-recreacion' | 'Lote'

export interface Propiedad {
  id: string
  created_at: string
  updated_at: string
  empresa_id: string
  codigo: string
  ubicacion: string | null
  ciudad: string | null
  area_m2: number | null
  tipo_inmueble: TipoInmueble | string | null
  tipo_negocio: TipoNegocio | null
  precio: number | null
  precio_administracion: number | null
  descripcion: string | null
  habitaciones: number | null
  banos: number | null
  parqueaderos: number | null
  estrato: number | null
  antiguedad: string | null
  estado: EstadoPropiedad
  imagenes: string[]
  codigo_portal: string | null
  enlace_portal: string | null
  caracteristicas: Record<string, unknown>
  metadata: Record<string, unknown>
}

// ─── Agentes humanos ─────────────────────────────────────

export interface Agente {
  id: string
  created_at: string
  empresa_id: string
  profile_id: string | null
  nombre: string
  email: string | null
  telefono: string | null
  activo: boolean
  metadata: Record<string, unknown>
}

// ─── Asignación automática ───────────────────────────────

export type MetodoAsignacion = 'por_dia' | 'crm' | 'carga_manual'

export interface AsignacionAutomatica {
  id: string
  created_at: string
  empresa_id: string
  metodo: MetodoAsignacion
  activo: boolean
  configuracion: Record<string, unknown>
  metadata: Record<string, unknown>
}

// ─── CRM: Pipelines ──────────────────────────────────────

export interface Pipeline {
  id: string
  created_at: string
  empresa_id: string
  nombre: string
  descripcion: string | null
  activo: boolean
  orden: number
  metadata: Record<string, unknown>
}

export interface PipelineEtapa {
  id: string
  created_at: string
  pipeline_id: string
  nombre: string
  color: string
  orden: number
  es_cierre: boolean
  es_perdido: boolean
  metadata: Record<string, unknown>
}

export interface PipelineWithEtapas extends Pipeline {
  pipeline_etapas: PipelineEtapa[]
}

// ─── CRM: Leads ──────────────────────────────────────────

export type OrigenLead = 'Metrocuadrado' | 'Ciencuadras' | 'Mercado Libre' | 'Finca Raiz' | 'Domus' | 'Century21' | 'WhatsApp' | 'Llamada' | string

export interface Lead {
  id: string
  created_at: string
  updated_at: string
  empresa_id: string
  pipeline_id: string
  etapa_id: string
  user_conversacion_id: string | null
  conversacion_id: string | null
  agente_asignado_id: string | null
  nombre: string
  telefono: string | null
  email: string | null
  origen: OrigenLead | null
  etiquetas: string[]
  propiedad_interes_id: string | null
  numero_citas: number
  proxima_cita: string | null
  valor_estimado: number | null
  notas: string | null
  activo: boolean
  metadata: Record<string, unknown>
}

export interface LeadWithDetails extends Lead {
  agente?: Agente | null
  etapa?: PipelineEtapa | null
}

// ─── CRM: Actividades ────────────────────────────────────

export type TipoActividad = 'nota' | 'cita' | 'llamada' | 'whatsapp' | 'email' | 'cambio_etapa' | 'asignacion' | 'documento' | 'pqrs' | 'automatizacion'

export interface LeadActividad {
  id: string
  created_at: string
  lead_id: string
  tipo: TipoActividad
  descripcion: string
  agente_id: string | null
  metadata: Record<string, unknown>
}

// ─── CRM: Citas ──────────────────────────────────────────

export type EstadoCita = 'programada' | 'confirmada' | 'realizada' | 'cancelada' | 'no_asistio'

export interface Cita {
  id: string
  created_at: string
  empresa_id: string
  lead_id: string | null
  agente_id: string | null
  propiedad_id: string | null
  fecha_hora: string
  duracion_minutos: number
  estado: EstadoCita
  notas: string | null
  confirmada_por_ia: boolean
  nombre_contacto: string | null
  telefono: string | null
  metadata: Record<string, unknown>
}

// ─── Automatizaciones ────────────────────────────────────

export type TriggerTipo = 'cambio_etapa' | 'tiempo' | 'evento' | 'cita' | 'manual'
export type AccionTipo = 'enviar_whatsapp' | 'enviar_email' | 'mover_etapa' | 'asignar_agente' | 'crear_cita' | 'notificar' | 'cobrar'

export interface Automatizacion {
  id: string
  created_at: string
  empresa_id: string
  nombre: string
  descripcion: string | null
  trigger_tipo: TriggerTipo
  trigger_config: Record<string, unknown>
  accion_tipo: AccionTipo
  accion_config: Record<string, unknown>
  activo: boolean
  pipeline_id: string | null
  metadata: Record<string, unknown>
}

// ─── Etiquetas ───────────────────────────────────────────

export interface Etiqueta {
  id: string
  created_at: string
  empresa_id: string
  nombre: string
  color: string
}

// ─── Agentes IA ──────────────────────────────────────────

export type CanalAgente = 'whatsapp' | 'voz' | 'web_chat'

export interface AgenteIA {
  id: string
  created_at: string
  updated_at: string
  empresa_id: string
  empresa_nombre: string | null
  nombre: string
  canal: CanalAgente
  assistant_id: string | null
  channel_uuid_callbell: string | null
  numero_whatsapp: string | null
  elevenlabs_agent_id: string | null
  elevenlabs_voice_id: string | null
  voice_sample_url: string | null
  instrucciones: string | null
  archivos_inventario: string[]
  activo: boolean
  ultimo_test: string | null
  estadisticas: { mensajes_enviados: number; llamadas_realizadas: number }
  metadata: Record<string, unknown>
}

export interface AgenteIAWithEmpresa extends AgenteIA {
  empresas: { nombre: string; plan: string } | null
}

// ─── Pagos ───────────────────────────────────────────────

export type EstadoSuscripcion = 'activa' | 'cancelada' | 'vencida' | 'trial'
export type EstadoPago = 'pendiente' | 'aprobado' | 'rechazado' | 'reembolsado'

export interface Suscripcion {
  id: string
  created_at: string
  empresa_id: string
  plan: Plan
  estado: EstadoSuscripcion
  fecha_inicio: string
  fecha_fin: string | null
  wompi_subscription_id: string | null
  wompi_payment_source_id: string | null
  monto_mensual: number
  moneda: string
  metadata: Record<string, unknown>
}

export interface Pago {
  id: string
  created_at: string
  empresa_id: string
  suscripcion_id: string | null
  monto: number
  moneda: string
  estado: EstadoPago
  wompi_transaction_id: string | null
  wompi_reference: string | null
  metodo_pago: string | null
  descripcion: string | null
  metadata: Record<string, unknown>
}

// ─── Analytics ───────────────────────────────────────────

export interface AnalyticsDiario {
  id: string
  fecha: string
  empresa_id: string
  canal: string
  leads_nuevos: number
  conversaciones: number
  interacciones: number
  solicitudes: number
  cierres: number
  citas_programadas: number
  citas_realizadas: number
  mensajes_enviados: number
  llamadas_realizadas: number
  metadata: Record<string, unknown>
}

// ─── Admin logs ──────────────────────────────────────────

export interface AdminLog {
  id: string
  level: 'debug' | 'info' | 'warn' | 'error'
  source: string
  message: string
  user_id: string | null
  empresa_id: string | null
  context: Record<string, unknown> | null
  ip_address: string | null
  user_agent: string | null
  created_at: string
}

// ─── PQRS + Documentos ───────────────────────────────────

export type TipoPQRS = 'peticion' | 'queja' | 'reclamo' | 'sugerencia'
export type EstadoPQRS = 'abierto' | 'en_proceso' | 'resuelto' | 'cerrado'

export interface PQRS {
  id: string
  created_at: string
  empresa_id: string
  lead_id: string | null
  tipo: TipoPQRS
  asunto: string
  descripcion: string | null
  estado: EstadoPQRS
  agente_id: string | null
  metadata: Record<string, unknown>
}

export interface Documento {
  id: string
  created_at: string
  empresa_id: string
  lead_id: string | null
  nombre: string
  url: string
  tipo: string | null
  metadata: Record<string, unknown>
}

// ─── Callbell / WhatsApp webhook ─────────────────────────

export interface CallbellWebhookPayload {
  event: string
  payload: {
    to: string
    from: string
    text: string | null
    status: string
    channel: string
    contact: {
      name: string | null
      uuid: string
      source: string
      phoneNumber: string
      conversationHref: string
    }
  }
}

// ─── Responses API (Azure OpenAI proxy) ──────────────────

export interface ToolDefinition {
  type: 'function'
  name: string
  description: string
  parameters: Record<string, unknown>
}

export interface FunctionCall {
  type: 'function_call'
  id: string
  name: string
  arguments: string
}

export interface ToolResult {
  tool_call_id: string
  output: string
}

export interface ResponsesAPIRequest {
  assistant_id: string
  content: string
  previous_response_id?: string | null
  tools?: ToolDefinition[]
  tool_results?: ToolResult[]
}

export interface ResponsesAPIResponse {
  status: 'completed' | 'requires_action' | 'failed'
  output_text?: string
  output?: FunctionCall[]
  next_previous_response_id: string
}

// ─── Property search ─────────────────────────────────────

export interface PropertySearchParams {
  empresa_id?: string
  tipo_inmueble?: string
  tipo_negocio?: string
  ciudad?: string
  precio_min?: number
  precio_max?: number
  habitaciones_min?: number
  area_min?: number
  caracteristicas?: string
  codigo?: string
  limite?: number
}
