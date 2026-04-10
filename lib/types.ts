// ============================================================
// RENTMIES — Database Types
// Matches Supabase schema
// ============================================================

export type UserRole = 'admin' | 'agent' | 'user'

export interface Profile {
  id: string
  email: string
  nombre: string | null
  rol: UserRole
  empresa_id: string | null
  activo: boolean
  avatar_url: string | null
  created_at: string
  updated_at: string
}

export interface Empresa {
  id: string
  nombre: string
  plan: string
  activo: boolean
  ciudad: string | null
  created_at: string
  updated_at: string
}

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

export interface AdminLog {
  id: string
  level: 'info' | 'warn' | 'error' | 'debug'
  source: string
  message: string
  context: Record<string, unknown> | null
  created_at: string
}

// ─── Join types ──────────────────────────────────────────

export interface ConversationWithContact extends Conversation {
  contacts: Contact | null
}

// ============================================================
// WHATSAPP AI — New tables for WhatsApp bot backend
// ============================================================

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
  created_at?: string
}

// ─── Callbell types ──────────────────────────────────────

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

// ─── Responses API types ─────────────────────────────────

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
