// ============================================================
// RENTMIES — Módulo de Conversaciones
// lib/mock-data.ts
//
// Datos de prueba. Para conectar la API, reemplazar las
// funciones de este archivo con llamadas reales a fetch/axios.
//
// Ejemplo de migración:
//   ANTES: import { mockConversations } from '@/lib/mock-data'
//   DESPUÉS: const data = await api.get('/conversations')
// ============================================================

import type {
  Conversation,
  Agent,
  IAAgent,
  Tag,
  Message,
  TemplatesByCategory,
} from '../types/conversations';

// ─── Agentes ──────────────────────────────────────────────

export const MOCK_AGENTS: Agent[] = [
  { id: 1, name: 'Ana Martínez', avatar: 'AM' },
  { id: 2, name: 'Pedro López', avatar: 'PL' },
  { id: 3, name: 'Carmen Ruiz', avatar: 'CR' },
  { id: 4, name: 'Luis Vargas', avatar: 'LV' },
];

export const MOCK_IA_AGENTS: IAAgent[] = [
  { id: 1, name: 'Agente IA - Ventas', type: 'sales' },
  { id: 2, name: 'Agente IA - Postventa', type: 'post-sales' },
  { id: 3, name: 'Agente IA - Información General', type: 'info' },
];

// ─── Etiquetas ────────────────────────────────────────────

export const MOCK_TAGS: Tag[] = [
  { id: 1, name: 'Venta', color: 'bg-green-100 text-green-700 border-green-200', count: 12 },
  { id: 2, name: 'Arriendo', color: 'bg-blue-100 text-blue-700 border-blue-200', count: 8 },
  { id: 3, name: 'Zona Norte', color: 'bg-purple-100 text-purple-700 border-purple-200', count: 5 },
  { id: 4, name: 'Zona Sur', color: 'bg-yellow-100 text-yellow-700 border-yellow-200', count: 3 },
  { id: 5, name: 'VIP', color: 'bg-red-100 text-red-700 border-red-200', count: 2 },
  { id: 6, name: 'Presupuesto Alto', color: 'bg-gray-100 text-gray-700 border-gray-200', count: 6 },
  { id: 7, name: 'Urgente', color: 'bg-orange-100 text-orange-700 border-orange-200', count: 4 },
  { id: 8, name: 'Inversionista', color: 'bg-teal-100 text-teal-700 border-teal-200', count: 3 },
];

// ─── Conversaciones ───────────────────────────────────────

const now = Date.now();
const mins = (n: number) => new Date(now - 1000 * 60 * n);
const hours = (n: number) => new Date(now - 1000 * 60 * 60 * n);
const days = (n: number) => new Date(now - 1000 * 60 * 60 * 24 * n);
const future = (n: number) => new Date(now + 1000 * 60 * 60 * 24 * n);

export const MOCK_CONVERSATIONS: Conversation[] = [
  {
    id: 1,
    customerName: 'María González',
    phone: '+57 301 234 5678',
    email: 'maria.gonzalez@email.com',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&h=150&fit=crop',
    lastMessage: '¿Cuál es el precio del apartamento en el norte?',
    timestamp: mins(5),
    lastClientResponse: hours(2),
    mode: 'ia',
    channel: 'whatsapp',
    agentId: null,
    iaAgentId: 1,
    unread: 3,
    tagId: 1,
    tags: ['Venta', 'Zona Norte'],
    messagesCount: 8,
    cityOfInterest: 'Bogotá',
    businessType: 'Venta',
    propertyInterest: 'Apartamento 3 hab - Zona Norte',
    budget: '450M - 550M',
    location: 'Bogotá, Colombia',
    stage: 'interesado',
    propertyCode: 'FC-2024-001',
    portal: 'Fincaraiz',
    crmStage: 'calificado',
    appointmentDate: undefined,
    appointmentTime: '',
    consultedProperties: ['144261', '144027'],
  },
  {
    id: 2,
    customerName: 'Carlos Ramírez',
    phone: '+57 312 456 7890',
    email: 'carlos.ramirez@email.com',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop',
    lastMessage: 'Perfecto, agende la cita para el sábado',
    timestamp: mins(15),
    lastClientResponse: hours(23.25), // ventana por cerrar
    mode: 'manual',
    channel: 'whatsapp',
    agentId: 1,
    agentName: 'Ana Martínez',
    iaAgentId: null,
    unread: 0,
    tagId: 4,
    tags: ['Zona Sur', 'Venta'],
    messagesCount: 15,
    cityOfInterest: 'Medellín',
    businessType: 'Venta',
    propertyInterest: 'Casa 4 hab - Conjunto Cerrado',
    budget: '600M - 700M',
    location: 'Medellín, Colombia',
    stage: 'cita-agendada',
    propertyCode: 'MC-2024-045',
    portal: 'Metrocuadrado',
    crmStage: 'negociacion',
    appointmentDate: future(3),
    appointmentTime: '10:00',
    consultedProperties: ['MC-045', 'MC-067'],
  },
  {
    id: 3,
    customerName: 'Laura Pérez',
    phone: '+57 320 987 6543',
    email: 'laura.perez@email.com',
    avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop',
    lastMessage: 'Muchas gracias por la información',
    timestamp: hours(1),
    lastClientResponse: hours(25), // ventana cerrada
    mode: 'ia',
    channel: 'whatsapp',
    agentId: null,
    iaAgentId: 3,
    unread: 0,
    tagId: 6,
    tags: ['Presupuesto Alto'],
    messagesCount: 5,
    cityOfInterest: 'Cali',
    businessType: 'Arriendo',
    propertyInterest: 'Apartamento 2 hab - Centro',
    budget: '300M - 400M',
    location: 'Cali, Colombia',
    stage: 'contacto-inicial',
    propertyCode: 'CC-2024-123',
    portal: 'Ciencuadras',
    crmStage: 'lead-nuevo',
    appointmentDate: undefined,
    appointmentTime: '',
    consultedProperties: ['CC-123'],
  },
  {
    id: 4,
    customerName: 'Jorge Silva',
    phone: '+57 315 234 8765',
    email: 'jorge.silva@email.com',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&h=150&fit=crop',
    lastMessage: 'Ya realicé la visita, me encantó el lugar',
    timestamp: hours(2),
    lastClientResponse: hours(23), // ventana por cerrar
    mode: 'manual',
    channel: 'whatsapp',
    agentId: 2,
    agentName: 'Pedro López',
    iaAgentId: null,
    unread: 0,
    tagId: 8,
    tags: ['Inversionista', 'VIP'],
    messagesCount: 24,
    cityOfInterest: 'Bogotá',
    businessType: 'Venta',
    propertyInterest: 'Penthouse - Zona Premium',
    budget: '900M - 1.2B',
    location: 'Bogotá, Colombia',
    stage: 'cerrado',
    propertyCode: 'FC-2024-089',
    portal: 'Fincaraiz',
    crmStage: 'ganado',
    appointmentDate: days(2),
    appointmentTime: '14:00',
    consultedProperties: ['FC-089'],
  },
  {
    id: 5,
    customerName: 'Andrea Torres',
    phone: '+57 318 765 4321',
    email: 'andrea.torres@email.com',
    avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&h=150&fit=crop',
    lastMessage: '¿Tienen opciones con parqueadero doble?',
    timestamp: mins(30),
    lastClientResponse: hours(1.5),
    mode: 'ia',
    channel: 'instagram',
    agentId: null,
    iaAgentId: 2,
    unread: 2,
    tagId: 7,
    tags: ['Urgente'],
    messagesCount: 6,
    cityOfInterest: 'Barranquilla',
    businessType: 'Arriendo',
    propertyInterest: 'Apartamento 3 hab',
    budget: '500M - 600M',
    location: 'Barranquilla, Colombia',
    stage: 'cotizacion-enviada',
    propertyCode: 'MC-2024-067',
    portal: 'Metrocuadrado',
    crmStage: 'propuesta',
    appointmentDate: undefined,
    appointmentTime: '',
    consultedProperties: ['MC-067', 'MC-089'],
  },
];

// ─── Mensajes por conversación ────────────────────────────

export const MOCK_MESSAGES: Record<number, Message[]> = {
  1: [
    { id: 1, sender: 'customer', type: 'text', text: 'Hola, estoy buscando un apartamento en el norte de la ciudad', timestamp: mins(20) },
    { id: 2, sender: 'ia', type: 'text', text: 'Hola María! 👋 Encantado de ayudarte. Tenemos excelentes opciones en el norte. ¿Cuántas habitaciones necesitas?', timestamp: mins(19) },
    { id: 3, sender: 'customer', type: 'text', text: 'Busco 3 habitaciones', timestamp: mins(18) },
    { id: 4, sender: 'ia', type: 'text', text: 'Perfecto! Tenemos varias opciones de 3 habitaciones en el norte. ¿Cuál es tu presupuesto aproximado?', timestamp: mins(17) },
    { id: 5, sender: 'customer', type: 'audio', duration: '0:32', timestamp: mins(16) },
    { id: 6, sender: 'ia', type: 'text', text: 'Excelente! Tengo 3 opciones perfectas para ti en ese rango de precio. Te comparto los detalles:', timestamp: mins(9) },
    { id: 7, sender: 'ia', type: 'text', text: '🏢 Apartamento Premium Norte\n📍 3 habitaciones, 2 baños\n💰 $480.000.000\n📏 95m²', timestamp: mins(8) },
    { id: 8, sender: 'customer', type: 'text', text: '¿Cuál es el precio del apartamento en el norte?', timestamp: mins(5) },
  ],
  2: [
    { id: 1, sender: 'customer', type: 'text', text: 'Buenos días, me interesa la casa en conjunto cerrado', timestamp: hours(2) },
    { id: 2, sender: 'agent', type: 'text', text: 'Buenos días Carlos! Soy Ana Martínez, agente inmobiliaria. Con gusto te ayudo con esa propiedad.', timestamp: hours(1.98) },
    { id: 3, sender: 'customer', type: 'document', fileName: 'Certificado_Ingresos.pdf', fileSize: '2.3 MB', timestamp: hours(1.67) },
    { id: 4, sender: 'agent', type: 'text', text: 'Perfecto, recibí el certificado. Todo está en orden. ¿Qué día te viene mejor para la visita?', timestamp: hours(1.63) },
    { id: 5, sender: 'customer', type: 'audio', duration: '0:18', timestamp: mins(20) },
    { id: 6, sender: 'agent', type: 'text', text: 'Perfecto Carlos! Te confirmo la cita para el sábado a las 10:00 AM. Te enviaré la ubicación exacta.', timestamp: mins(15) },
  ],
};

// ─── Templates de mensajes ────────────────────────────────

export const MOCK_TEMPLATES: TemplatesByCategory = {
  'retomar-conversacion': [
    {
      id: 'seguimiento-general',
      name: 'Seguimiento general',
      message: 'Hola {nombre}, quería hacer seguimiento a tu solicitud. ¿Podemos ayudarte con algo más?',
      variables: ['nombre'],
    },
    {
      id: 'retomar-simple',
      name: 'Retomar conversación',
      message: 'Hola, ¿te gustaría retomar nuestra conversación sobre propiedades?',
      variables: [],
    },
  ],
  'preguntar-interes': [
    {
      id: 'interes-inmueble',
      name: 'Interés sobre inmueble enviado',
      message: 'Hola {nombre}, te envié información del inmueble {codigo}. ¿Te gustaría agendar una visita?',
      variables: ['nombre', 'codigo'],
    },
    {
      id: 'informacion-adicional',
      name: 'Información adicional disponible',
      message: 'Hola, tenemos la información que solicitaste. ¿Te gustaría conocer más detalles?',
      variables: [],
    },
  ],
  'confirmar-visita': [
    {
      id: 'confirmar-cita',
      name: 'Confirmar cita programada',
      message: 'Hola {nombre}, te recordamos tu cita para el {fecha} a las {hora}. ¿Confirmas tu asistencia?',
      variables: ['nombre', 'fecha', 'hora'],
    },
    {
      id: 'recordatorio-simple',
      name: 'Recordatorio de cita',
      message: 'Hola, te recordamos tu cita programada. ¿Confirmas tu asistencia?',
      variables: [],
    },
  ],
  'modificar-visita': [
    {
      id: 'reprogramar-visita',
      name: 'Reprogramar visita',
      message: 'Hola {nombre}, ¿necesitas reprogramar tu visita? Tengo disponibilidad para {fecha} a las {hora}.',
      variables: ['nombre', 'fecha', 'hora'],
    },
  ],
  'inmueble-alternativo': [
    {
      id: 'enviar-inmueble-completo',
      name: 'Inmueble con detalles completos',
      message: 'Hola {nombre}, te comparto un inmueble:\n\n🏠 Código: {codigo}\n💰 Precio: ${precio}\n📍 Ubicación: {ubicacion}\n📐 Área: {area} m²\n🔗 Ver más: {link}',
      variables: ['nombre', 'codigo', 'precio', 'ubicacion', 'area', 'link'],
    },
    {
      id: 'opciones-similares',
      name: 'Opciones similares',
      message: 'Hola, tenemos opciones similares a las que consultaste. ¿Te gustaría conocerlas?',
      variables: [],
    },
  ],
};

// ─── Etapas CRM (para selects) ────────────────────────────

export const CRM_STAGES = [
  { id: 'lead-nuevo', name: 'Lead Nuevo' },
  { id: 'calificado', name: 'Calificado' },
  { id: 'propuesta', name: 'Propuesta' },
  { id: 'negociacion', name: 'Negociación' },
  { id: 'ganado', name: 'Ganado' },
  { id: 'perdido', name: 'Perdido' },
] as const;

// ─── Variable labels ──────────────────────────────────────

export const TEMPLATE_VARIABLE_LABELS: Record<string, string> = {
  nombre: 'Nombre del cliente',
  codigo: 'Código del inmueble',
  precio: 'Precio',
  link: 'Link del inmueble',
  fecha: 'Fecha',
  hora: 'Hora',
  ubicacion: 'Ubicación',
  area: 'Área (m²)',
};
