// ============================================================
// RENTMIES — Módulo de Conversaciones
// lib/utils.ts
// ============================================================

import type { Conversation, ConversationFilters, WindowStatus } from '../types/conversations';

// ─── Ventana de 24h de WhatsApp ───────────────────────────

export function getWindowStatus(lastClientResponse: Date): {
  status: WindowStatus;
  label: string;
  dotColor: string;
  bannerDesc?: string;
} {
  const diffHours = (Date.now() - lastClientResponse.getTime()) / (1000 * 60 * 60);

  if (diffHours < 23) {
    return { status: 'open', label: '', dotColor: '' };
  }
  if (diffHours < 24) {
    return {
      status: 'warning',
      label: 'Última hora para responder',
      dotColor: 'bg-amber-500',
    };
  }
  return {
    status: 'closed',
    label: 'Requiere plantilla',
    dotColor: 'bg-blue-500',
    bannerDesc: 'Han pasado más de 24 horas desde el último mensaje del cliente. Debes usar una plantilla aprobada para reactivar esta conversación.',
  };
}

// ─── Formato de tiempo relativo ───────────────────────────

export function formatRelativeTime(date: Date): string {
  const diff = Date.now() - date.getTime();
  const minutes = Math.floor(diff / 60_000);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  if (minutes < 1) return 'Ahora';
  if (minutes < 60) return `${minutes}min`;
  if (hours < 24) return `${hours}h`;
  if (days === 1) return 'Ayer';
  return date.toLocaleDateString('es-ES', { day: 'numeric', month: 'short' });
}

// ─── Formato de hora 12h ──────────────────────────────────

export function formatTime12h(time24: string): string {
  if (!time24) return '';
  const [h, m] = time24.split(':');
  let hour = parseInt(h);
  const period = hour >= 12 ? 'PM' : 'AM';
  if (hour === 0) hour = 12;
  else if (hour > 12) hour -= 12;
  return `${hour}:${m} ${period}`;
}

export function parseTime12h(time24: string) {
  if (!time24) return { hour: '09', minute: '00', period: 'AM' };
  const [hourStr, minuteStr] = time24.split(':');
  let hour = parseInt(hourStr);
  const period = hour >= 12 ? 'PM' : 'AM';
  if (hour === 0) hour = 12;
  else if (hour > 12) hour -= 12;
  return { hour: hour.toString().padStart(2, '0'), minute: minuteStr || '00', period };
}

export function formatTime24h(hour: string, minute: string, period: string): string {
  let h = parseInt(hour);
  if (period === 'PM' && h !== 12) h += 12;
  if (period === 'AM' && h === 12) h = 0;
  return `${h.toString().padStart(2, '0')}:${minute}`;
}

// ─── Filtrado de conversaciones ───────────────────────────

export function applyFilters(
  conversations: Conversation[],
  filters: ConversationFilters
): Conversation[] {
  return conversations.filter((conv) => {
    // Search
    const q = filters.search.toLowerCase();
    const matchesSearch =
      !q ||
      (filters.searchType === 'name' && conv.customerName.toLowerCase().includes(q)) ||
      (filters.searchType === 'phone' && conv.phone.includes(filters.search)) ||
      (filters.searchType === 'keyword' && conv.lastMessage.toLowerCase().includes(q)) ||
      (filters.searchType === 'all' &&
        (conv.customerName.toLowerCase().includes(q) ||
          conv.phone.includes(filters.search) ||
          conv.lastMessage.toLowerCase().includes(q)));

    const matchesChannel = filters.channel === 'all' || conv.channel === filters.channel;

    const matchesAgent =
      filters.agentId === 'all' ||
      (filters.agentId === 'unassigned' ? conv.agentId === null : conv.agentId === filters.agentId);

    const matchesIaAgent =
      filters.iaAgentId === 'all' ||
      (conv.iaAgentId !== null && conv.iaAgentId === filters.iaAgentId);

    const matchesStage = filters.stage === 'all' || conv.stage === filters.stage;

    const matchesTag = filters.tagId === 'all' || conv.tagId === filters.tagId;

    const matchesMode = filters.mode === 'all' || conv.mode === filters.mode;

    const matchesAlert = (() => {
      if (filters.alert === 'all') return true;
      const ws = getWindowStatus(conv.lastClientResponse);
      if (filters.alert === 'ultima-hora') return ws.status === 'warning';
      if (filters.alert === 'requiere-plantilla') return ws.status === 'closed';
      return true;
    })();

    const matchesDate = (() => {
      if (!filters.dateFrom && !filters.dateTo) return true;
      const d = new Date(conv.timestamp);
      d.setHours(0, 0, 0, 0);
      if (filters.dateFrom && filters.dateTo) {
        const from = new Date(filters.dateFrom);
        const to = new Date(filters.dateTo);
        from.setHours(0, 0, 0, 0);
        to.setHours(23, 59, 59, 999);
        return d >= from && d <= to;
      }
      if (filters.dateFrom) {
        const from = new Date(filters.dateFrom);
        from.setHours(0, 0, 0, 0);
        return d >= from;
      }
      if (filters.dateTo) {
        const to = new Date(filters.dateTo);
        to.setHours(23, 59, 59, 999);
        return d <= to;
      }
      return true;
    })();

    return (
      matchesSearch &&
      matchesChannel &&
      matchesAgent &&
      matchesIaAgent &&
      matchesStage &&
      matchesTag &&
      matchesMode &&
      matchesAlert &&
      matchesDate
    );
  });
}

// ─── Interpolación de variables en templates ─────────────

export function interpolateTemplate(
  template: string,
  variables: Record<string, string>
): string {
  let result = template;
  for (const [key, value] of Object.entries(variables)) {
    result = result.replaceAll(`{${key}}`, value || `{${key}}`);
  }
  return result;
}

// ─── Colores aleatorios para etiquetas nuevas ─────────────

const TAG_COLORS = [
  'bg-green-100 text-green-700 border-green-200',
  'bg-blue-100 text-blue-700 border-blue-200',
  'bg-purple-100 text-purple-700 border-purple-200',
  'bg-yellow-100 text-yellow-700 border-yellow-200',
  'bg-pink-100 text-pink-700 border-pink-200',
  'bg-indigo-100 text-indigo-700 border-indigo-200',
];

export function randomTagColor(): string {
  return TAG_COLORS[Math.floor(Math.random() * TAG_COLORS.length)];
}
