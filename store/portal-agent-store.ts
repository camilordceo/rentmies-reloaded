import { create } from 'zustand'

export type ViewMode = 'discover' | 'search-results' | 'property-detail' | 'scheduling'
export type VoiceState = 'idle' | 'listening' | 'processing' | 'speaking'

export interface AgentMessage {
  id: string
  role: 'user' | 'assistant'
  text: string
  properties?: PropertyItem[]
  timestamp: Date
}

export interface PropertyItem {
  id?: string
  codigo: string
  ubicacion?: string | null
  ciudad?: string | null
  tipo_inmueble?: string | null
  tipo_negocio?: string | null
  precio?: number | null
  area_m2?: number | null
  habitaciones?: number | null
  banos?: number | null
  parqueaderos?: number | null
  estrato?: number | null
  descripcion?: string | null
  imagenes?: string[]
  enlace_portal?: string | null
  codigo_portal?: string | null
  match_score?: number
  agent_insight?: string
}

interface PortalAgentState {
  // View orchestration — the AI controls what the canvas shows
  viewMode: ViewMode
  setViewMode: (mode: ViewMode) => void

  // Conversation
  messages: AgentMessage[]
  isProcessing: boolean
  addMessage: (msg: AgentMessage) => void
  setProcessing: (v: boolean) => void

  // Property display — driven by AI responses
  displayedProperties: PropertyItem[]
  highlightedPropertyCode: string | null
  focusedProperty: PropertyItem | null
  setDisplayedProperties: (props: PropertyItem[]) => void
  highlightProperty: (code: string | null) => void
  focusProperty: (prop: PropertyItem | null) => void

  // Voice
  voiceState: VoiceState
  setVoiceState: (state: VoiceState) => void
  transcript: string
  setTranscript: (text: string) => void

  // Session
  sessionId: string
  responseId: string | null
  setResponseId: (id: string | null) => void

  // Scheduling
  schedulingProperty: PropertyItem | null
  setSchedulingProperty: (prop: PropertyItem | null) => void

  // Featured / initial properties (loaded from server)
  featuredProperties: PropertyItem[]
  setFeaturedProperties: (props: PropertyItem[]) => void

  // Panel state
  isPanelCollapsed: boolean
  togglePanel: () => void
}

export const usePortalAgent = create<PortalAgentState>((set) => ({
  viewMode: 'discover',
  setViewMode: (mode) => set({ viewMode: mode }),

  messages: [],
  isProcessing: false,
  addMessage: (msg) => set((s) => ({ messages: [...s.messages, msg] })),
  setProcessing: (v) => set({ isProcessing: v }),

  displayedProperties: [],
  highlightedPropertyCode: null,
  focusedProperty: null,
  setDisplayedProperties: (props) =>
    set({ displayedProperties: props, viewMode: props.length > 0 ? 'search-results' : 'discover' }),
  highlightProperty: (code) => set({ highlightedPropertyCode: code }),
  focusProperty: (prop) =>
    set({ focusedProperty: prop, viewMode: prop ? 'property-detail' : 'search-results' }),

  voiceState: 'idle',
  setVoiceState: (state) => set({ voiceState: state }),
  transcript: '',
  setTranscript: (text) => set({ transcript: text }),

  sessionId: typeof crypto !== 'undefined' ? crypto.randomUUID() : '',
  responseId: null,
  setResponseId: (id) => set({ responseId: id }),

  schedulingProperty: null,
  setSchedulingProperty: (prop) =>
    set({ schedulingProperty: prop, viewMode: prop ? 'scheduling' : 'search-results' }),

  featuredProperties: [],
  setFeaturedProperties: (props) => set({ featuredProperties: props }),

  isPanelCollapsed: false,
  togglePanel: () => set((s) => ({ isPanelCollapsed: !s.isPanelCollapsed })),
}))
