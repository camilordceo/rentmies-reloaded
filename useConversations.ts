// ============================================================
// RENTMIES — Módulo de Conversaciones
// hooks/useConversations.ts
//
// Centraliza todo el estado y las acciones del módulo.
// Cuando conectes la API, reemplaza las actualizaciones
// locales con llamadas reales (ej: mutate con React Query).
// ============================================================

import { useState, useCallback, useEffect } from 'react';
import type {
  Conversation,
  Message,
  Tag,
  ConversationFilters,
  CRMStage,
  ConversationMode,
} from '../types/conversations';
import {
  MOCK_CONVERSATIONS,
  MOCK_MESSAGES,
  MOCK_TAGS,
  MOCK_AGENTS,
  MOCK_IA_AGENTS,
} from '../lib/mock-data';
import { applyFilters, randomTagColor } from '../lib/utils';

const DEFAULT_FILTERS: ConversationFilters = {
  search: '',
  searchType: 'all',
  channel: 'all',
  agentId: 'all',
  iaAgentId: 'all',
  stage: 'all',
  tagId: 'all',
  mode: 'all',
  alert: 'all',
  dateFrom: undefined,
  dateTo: undefined,
};

export function useConversations() {
  // ─── Data ────────────────────────────────────────────────
  const [conversations, setConversations] = useState<Conversation[]>(MOCK_CONVERSATIONS);
  const [messages, setMessages] = useState<Record<number, Message[]>>(MOCK_MESSAGES);
  const [tags, setTags] = useState<Tag[]>(MOCK_TAGS);
  const agents = MOCK_AGENTS;
  const iaAgents = MOCK_IA_AGENTS;

  // ─── UI State ─────────────────────────────────────────────
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [filters, setFilters] = useState<ConversationFilters>(DEFAULT_FILTERS);
  const [showFilters, setShowFilters] = useState(false);
  const [showMobileChat, setShowMobileChat] = useState(false);

  // Derived
  const selected = conversations.find((c) => c.id === selectedId) ?? null;
  const currentMessages = selectedId ? (messages[selectedId] ?? []) : [];
  const filtered = applyFilters(conversations, filters);

  // Reset template state on conversation change
  useEffect(() => {
    // In a real app, you'd fetch messages for the new conversation here:
    // fetchMessages(selectedId).then(setMessages)
  }, [selectedId]);

  // ─── Actions ──────────────────────────────────────────────

  const selectConversation = useCallback((id: number) => {
    setSelectedId(id);
    setShowMobileChat(true);
  }, []);

  const sendMessage = useCallback(
    (text: string) => {
      if (!selectedId || !text.trim()) return;
      // TODO: POST /conversations/:id/messages { text }
      const newMsg: Message = {
        id: Date.now(),
        sender: 'agent',
        type: 'text',
        text,
        timestamp: new Date(),
      };
      setMessages((prev) => ({
        ...prev,
        [selectedId]: [...(prev[selectedId] ?? []), newMsg],
      }));
    },
    [selectedId]
  );

  const sendTemplate = useCallback(
    (text: string) => {
      if (!selectedId || !text.trim()) return;
      // TODO: POST /conversations/:id/templates { templateId, variables }
      const newMsg: Message = {
        id: Date.now(),
        sender: 'agent',
        type: 'text',
        text,
        timestamp: new Date(),
      };
      setMessages((prev) => ({
        ...prev,
        [selectedId]: [...(prev[selectedId] ?? []), newMsg],
      }));
    },
    [selectedId]
  );

  const toggleMode = useCallback(
    (convId: number) => {
      // TODO: PUT /conversations/:id/mode { mode }
      setConversations((prev) =>
        prev.map((c) =>
          c.id === convId ? { ...c, mode: c.mode === 'ia' ? 'manual' : 'ia' } : c
        )
      );
    },
    []
  );

  const setAllManual = useCallback(
    (manual: boolean) => {
      // TODO: PUT /conversations/mode { mode: manual ? 'manual' : 'ia' }
      setConversations((prev) =>
        prev.map((c) => ({ ...c, mode: manual ? 'manual' : 'ia' }))
      );
    },
    []
  );

  const assignAgent = useCallback(
    (convId: number, agentId: number | null) => {
      // TODO: PUT /conversations/:id/agent { agentId }
      setConversations((prev) =>
        prev.map((c) =>
          c.id === convId
            ? {
                ...c,
                agentId,
                agentName: agentId
                  ? agents.find((a) => a.id === agentId)?.name ?? null
                  : null,
                mode: agentId ? 'manual' : 'ia',
              }
            : c
        )
      );
    },
    [agents]
  );

  const updateCRMStage = useCallback(
    (convId: number, crmStage: CRMStage) => {
      // TODO: PUT /conversations/:id/crm-stage { crmStage }
      setConversations((prev) =>
        prev.map((c) => (c.id === convId ? { ...c, crmStage } : c))
      );
    },
    []
  );

  const updateAppointment = useCallback(
    (convId: number, appointmentDate: Date | undefined, appointmentTime: string) => {
      // TODO: PUT /conversations/:id/appointment { appointmentDate, appointmentTime }
      setConversations((prev) =>
        prev.map((c) =>
          c.id === convId ? { ...c, appointmentDate, appointmentTime } : c
        )
      );
    },
    []
  );

  const addTag = useCallback(
    (convId: number, tagName: string) => {
      // TODO: POST /conversations/:id/tags { tagName }
      setConversations((prev) =>
        prev.map((c) => {
          if (c.id !== convId) return c;
          if (c.tags.includes(tagName)) return c; // already has it
          return { ...c, tags: [...c.tags, tagName] };
        })
      );
    },
    []
  );

  const removeTag = useCallback(
    (convId: number, tagName: string) => {
      // TODO: DELETE /conversations/:id/tags/:tagName
      setConversations((prev) =>
        prev.map((c) =>
          c.id === convId ? { ...c, tags: c.tags.filter((t) => t !== tagName) } : c
        )
      );
    },
    []
  );

  const createTag = useCallback(
    (name: string) => {
      // TODO: POST /tags { name }
      if (!name.trim()) return false;
      const newTag: Tag = {
        id: tags.length + 1,
        name: name.trim(),
        color: randomTagColor(),
        count: 0,
      };
      setTags((prev) => [...prev, newTag]);
      return true;
    },
    [tags]
  );

  const deleteTag = useCallback(
    (tagId: number) => {
      // TODO: DELETE /tags/:id
      setTags((prev) => prev.filter((t) => t.id !== tagId));
    },
    []
  );

  const startNewConversation = useCallback(
    (phone: string, name: string, iaInstructions: string) => {
      if (!phone.trim() || !name.trim() || !iaInstructions.trim()) return false;
      // TODO: POST /conversations { phone, name, iaInstructions }
      const newConv: Conversation = {
        id: Date.now(),
        customerName: name,
        phone: phone.startsWith('+') ? phone : `+${phone}`,
        email: '',
        avatar: '',
        lastMessage: iaInstructions,
        timestamp: new Date(),
        lastClientResponse: new Date(),
        mode: 'ia',
        channel: 'whatsapp',
        agentId: null,
        iaAgentId: 1,
        unread: 0,
        tagId: null,
        tags: [],
        messagesCount: 1,
        cityOfInterest: '',
        businessType: '',
        propertyInterest: '',
        budget: '',
        location: '',
        stage: 'contacto-inicial',
        propertyCode: '',
        portal: '',
        crmStage: 'lead-nuevo',
        appointmentDate: undefined,
        appointmentTime: '',
        consultedProperties: [],
      };
      setConversations((prev) => [newConv, ...prev]);
      setSelectedId(newConv.id);
      setShowMobileChat(true);
      return true;
    },
    []
  );

  const updateFilter = useCallback(
    <K extends keyof ConversationFilters>(key: K, value: ConversationFilters[K]) => {
      setFilters((prev) => ({ ...prev, [key]: value }));
    },
    []
  );

  const resetFilters = useCallback(() => {
    setFilters(DEFAULT_FILTERS);
  }, []);

  return {
    // Data
    conversations: filtered,
    allConversations: conversations,
    messages: currentMessages,
    tags,
    agents,
    iaAgents,
    selected,

    // UI
    selectedId,
    showFilters,
    showMobileChat,
    filters,

    // Actions
    selectConversation,
    setShowMobileChat,
    setShowFilters,
    sendMessage,
    sendTemplate,
    toggleMode,
    setAllManual,
    assignAgent,
    updateCRMStage,
    updateAppointment,
    addTag,
    removeTag,
    createTag,
    deleteTag,
    startNewConversation,
    updateFilter,
    resetFilters,
  };
}
