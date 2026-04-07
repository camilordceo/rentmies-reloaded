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
