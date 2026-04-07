// ============================================================
// RENTMIES — Módulo de Conversaciones
// types/conversations.ts
//
// Todas las interfaces del módulo. Al conectar la API,
// estos tipos deben coincidir con la respuesta del backend.
// ============================================================

export type Channel = 'whatsapp' | 'instagram' | 'sms';
export type ConversationMode = 'ia' | 'manual';
export type WindowStatus = 'open' | 'warning' | 'closed';

export type ConversationStage =
  | 'contacto-inicial'
  | 'interesado'
  | 'cotizacion-enviada'
  | 'cita-agendada'
  | 'cerrado';

export type CRMStage =
  | 'lead-nuevo'
  | 'calificado'
  | 'propuesta'
  | 'negociacion'
  | 'ganado'
  | 'perdido';

export type MessageSender = 'customer' | 'ia' | 'agent';
export type MessageType = 'text' | 'audio' | 'image' | 'document';

// ─── Entidades principales ────────────────────────────────

export interface Agent {
  id: number;
  name: string;
  avatar: string; // initials e.g. "AM"
}

export interface IAAgent {
  id: number;
  name: string;
  type: 'sales' | 'post-sales' | 'info';
}

export interface Tag {
  id: number;
  name: string;
  color: string; // Tailwind class string
  count: number;
}

export interface Conversation {
  id: number;
  customerName: string;
  phone: string;
  email: string;
  avatar?: string;
  lastMessage: string;
  timestamp: Date;
  lastClientResponse: Date;
  mode: ConversationMode;
  channel: Channel;
  agentId: number | null;
  agentName?: string | null;
  iaAgentId: number | null;
  unread: number;
  tagId: number | null;
  tags: string[];
  messagesCount: number;

  // Contexto inmobiliario
  cityOfInterest: string;
  businessType: string;        // 'Venta' | 'Arriendo'
  propertyInterest: string;
  budget: string;
  location: string;
  stage: ConversationStage;
  propertyCode: string;
  portal: string;              // 'Fincaraiz' | 'Metrocuadrado' | etc
  crmStage: CRMStage;
  appointmentDate?: Date;
  appointmentTime: string;     // "HH:MM" 24h format
  consultedProperties: string[];
}

export interface Message {
  id: number;
  sender: MessageSender;
  type: MessageType;
  text?: string;
  duration?: string;           // For audio: "0:32"
  fileName?: string;           // For documents
  fileSize?: string;           // For documents
  imageUrl?: string;           // For images
  timestamp: Date;
}

// ─── Templates ────────────────────────────────────────────

export interface MessageTemplate {
  id: string;
  name: string;
  message: string;
  variables: string[];         // e.g. ['nombre', 'fecha', 'hora']
}

export type TemplateCategory =
  | 'retomar-conversacion'
  | 'preguntar-interes'
  | 'confirmar-visita'
  | 'modificar-visita'
  | 'inmueble-alternativo';

export type TemplatesByCategory = Record<TemplateCategory, MessageTemplate[]>;

// ─── Filtros ──────────────────────────────────────────────

export interface ConversationFilters {
  search: string;
  searchType: 'all' | 'name' | 'phone' | 'keyword';
  channel: Channel | 'all';
  agentId: number | 'unassigned' | 'all';
  iaAgentId: number | 'all';
  stage: ConversationStage | 'all';
  tagId: number | 'all';
  mode: ConversationMode | 'all';
  alert: 'ultima-hora' | 'requiere-plantilla' | 'all';
  dateFrom?: Date;
  dateTo?: Date;
}

// ─── Payloads para API ────────────────────────────────────

/** POST /conversations */
export interface CreateConversationPayload {
  phone: string;
  name: string;
  iaInstructions: string; // Instructions to generate the first IA message
}

/** PUT /conversations/:id/agent */
export interface AssignAgentPayload {
  agentId: number | null;
}

/** PUT /conversations/:id/crm-stage */
export interface UpdateCRMStagePayload {
  crmStage: CRMStage;
}

/** PUT /conversations/:id/appointment */
export interface UpdateAppointmentPayload {
  appointmentDate: string | null; // ISO string
  appointmentTime: string;
}

/** PUT /conversations/:id/mode */
export interface UpdateModePayload {
  mode: ConversationMode;
}

/** POST /conversations/:id/tags */
export interface AddTagPayload {
  tagName: string;
}

/** POST /conversations/:id/messages */
export interface SendMessagePayload {
  text: string;
}

/** POST /conversations/:id/templates */
export interface SendTemplatePayload {
  templateId: string;
  variables: Record<string, string>;
}
