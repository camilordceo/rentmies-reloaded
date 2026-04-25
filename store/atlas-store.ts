'use client'
import { create } from 'zustand'
import type { ParsedReference } from '@/lib/atlas-message-parser'
export { fmtCOP, deriveMood, deriveTags, computeMatchScore } from '@/lib/atlas-helpers'

export interface AtlasProperty {
  id: string
  codigo: string
  ubicacion: string
  ciudad: string | null
  tipo_inmueble: string | null
  tipo_negocio: 'Venta' | 'Arriendo' | 'Venta/Arriendo' | null
  precio: number | null
  area_m2: number | null
  habitaciones: number | null
  banos: number | null
  parqueaderos: number | null
  estrato: number | null
  imagenes: string[]
  descripcion: string | null
  cashback_amount: number | null
  cashback_rate: number | null
  empresa_id: string | null
  caracteristicas: Record<string, unknown>
  // Computed for Atlas display
  match_score: number   // 0-100
  agent_insight: string | null
  tags: string[]
  mood: string
  // Pinned by EMA in the latest reply — Chapter 2 puts these at the focus
  spotlight?: boolean
}

export interface ChatDebug {
  used_path: 'tool' | 'fallback' | 'none'
  extracted_codes: string[]
  codes_queried: string[]
  tool_results: number
  fallback_results: number
  inventory_total: number | null
  search_filters: Record<string, unknown> | null
  tool_calls: string[]
  assistant_id: string
  empresa_id: string | null
}

export type AtlasChapter = 0 | 1 | 2 | 3

export interface SearchFilters {
  tipo_inmueble?: string | null
  tipo_negocio?: string | null
  ciudad?: string | null
  barrio?: string | null
  precio_min?: number | null
  precio_max?: number | null
  habitaciones_min?: number | null
  area_min?: number | null
}

interface AtlasState {
  // Chapter navigation
  activeChapter: AtlasChapter
  setChapter: (i: AtlasChapter) => void

  // Intent chips
  activeIntents: string[]
  toggleIntent: (intent: string) => void
  clearIntents: () => void

  // Properties
  properties: AtlasProperty[]
  setProperties: (props: AtlasProperty[]) => void
  selectedProperty: AtlasProperty | null
  setSelectedProperty: (p: AtlasProperty | null) => void
  drawerProperty: AtlasProperty | null
  openDrawer: (p: AtlasProperty) => void
  closeDrawer: () => void

  // Mouse parallax
  mouse: { x: number; y: number }
  setMouse: (m: { x: number; y: number }) => void

  // EMA panel
  emaListening: boolean
  setEmaListening: (v: boolean) => void
  emaMode: 'resumen' | 'dialogo'
  setEmaMode: (m: 'resumen' | 'dialogo') => void
  emaPanelOpen: boolean
  toggleEmaPanel: () => void
  openEmaPanel: () => void

  // Chat session (wired to /api/chat)
  sessionId: string
  responseId: string | null
  setResponseId: (id: string | null) => void
  emaMessages: Array<{
    role: 'user' | 'assistant'
    text: string
    properties?: AtlasProperty[]
    references?: ParsedReference[]
  }>
  addEmaMessage: (msg: {
    role: 'user' | 'assistant'
    text: string
    properties?: AtlasProperty[]
    references?: ParsedReference[]
  }) => void
  emaProcessing: boolean
  setEmaProcessing: (v: boolean) => void
  isSearching: boolean
  setIsSearching: (v: boolean) => void

  // Active search filters from latest tool call
  activeFilters: SearchFilters
  setActiveFilters: (f: SearchFilters) => void
  clearFilter: (key: keyof SearchFilters) => void
  clearAllFilters: () => void

  // Session id management
  setSessionId: (id: string) => void
  hydrateMessages: (msgs: Array<{ role: 'user' | 'assistant'; text: string }>) => void

  // Latest /api/chat debug payload — surfaced inline in EMA panel + admin logs
  lastDebug: ChatDebug | null
  setLastDebug: (d: ChatDebug | null) => void

  // Cashback calculator
  calcPrice: number
  calcType: 'Venta' | 'Arriendo'
  setCalcPrice: (v: number) => void
  setCalcType: (t: 'Venta' | 'Arriendo') => void
}

export const useAtlasStore = create<AtlasState>((set, get) => ({
  activeChapter: 0,
  setChapter: (i) => set({ activeChapter: i }),

  activeIntents: [],
  toggleIntent: (intent) =>
    set((s) => ({
      activeIntents: s.activeIntents.includes(intent)
        ? s.activeIntents.filter((x) => x !== intent)
        : [...s.activeIntents, intent],
    })),
  clearIntents: () => set({ activeIntents: [] }),

  properties: [],
  setProperties: (props) => set({ properties: props }),
  selectedProperty: null,
  setSelectedProperty: (p) => set({ selectedProperty: p }),
  drawerProperty: null,
  openDrawer: (p) => set({ drawerProperty: p }),
  closeDrawer: () => set({ drawerProperty: null }),

  mouse: { x: 0.5, y: 0.5 },
  setMouse: (m) => set({ mouse: m }),

  emaListening: true,
  setEmaListening: (v) => set({ emaListening: v }),
  emaMode: 'resumen',
  setEmaMode: (m) => set({ emaMode: m }),
  emaPanelOpen: false,
  toggleEmaPanel: () => set((s) => ({ emaPanelOpen: !s.emaPanelOpen })),
  openEmaPanel: () => set({ emaPanelOpen: true }),

  sessionId: typeof crypto !== 'undefined' ? crypto.randomUUID() : '',
  responseId: null,
  setResponseId: (id) => set({ responseId: id }),
  emaMessages: [],
  addEmaMessage: (msg) => set((s) => ({ emaMessages: [...s.emaMessages, msg] })),
  emaProcessing: false,
  setEmaProcessing: (v) => set({ emaProcessing: v }),
  isSearching: false,
  setIsSearching: (v) => set({ isSearching: v }),

  activeFilters: {},
  setActiveFilters: (f) => set({ activeFilters: f }),
  clearFilter: (key) =>
    set((s) => {
      const next = { ...s.activeFilters }
      delete next[key]
      return { activeFilters: next }
    }),
  clearAllFilters: () => set({ activeFilters: {} }),

  setSessionId: (id) => set({ sessionId: id }),
  hydrateMessages: (msgs) => set({ emaMessages: msgs }),

  lastDebug: null,
  setLastDebug: (d) => set({ lastDebug: d }),

  calcPrice: 450_000_000,
  calcType: 'Venta',
  setCalcPrice: (v) => set({ calcPrice: v }),
  setCalcType: (t) => {
    set({ calcType: t, calcPrice: t === 'Venta' ? 450_000_000 : 2_500_000 })
  },
}))

// helpers re-exported from lib/atlas-helpers (no duplication)
