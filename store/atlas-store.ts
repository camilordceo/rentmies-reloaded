'use client'
import { create } from 'zustand'

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
}

export type AtlasChapter = 0 | 1 | 2 | 3

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
  emaMessages: Array<{ role: 'user' | 'assistant'; text: string }>
  addEmaMessage: (msg: { role: 'user' | 'assistant'; text: string }) => void
  emaProcessing: boolean
  setEmaProcessing: (v: boolean) => void

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
  emaPanelOpen: true,
  toggleEmaPanel: () => set((s) => ({ emaPanelOpen: !s.emaPanelOpen })),
  openEmaPanel: () => set({ emaPanelOpen: true }),

  sessionId: typeof crypto !== 'undefined' ? crypto.randomUUID() : '',
  responseId: null,
  setResponseId: (id) => set({ responseId: id }),
  emaMessages: [],
  addEmaMessage: (msg) => set((s) => ({ emaMessages: [...s.emaMessages, msg] })),
  emaProcessing: false,
  setEmaProcessing: (v) => set({ emaProcessing: v }),

  calcPrice: 450_000_000,
  calcType: 'Venta',
  setCalcPrice: (v) => set({ calcPrice: v }),
  setCalcType: (t) => {
    set({ calcType: t, calcPrice: t === 'Venta' ? 450_000_000 : 2_500_000 })
  },
}))

// ─── Helpers ──────────────────────────────────────────────────────────────────

export function fmtCOP(n: number | null | undefined): string {
  if (n == null) return '—'
  return '$' + Math.round(n).toLocaleString('es-CO')
}

export function deriveMood(p: AtlasProperty): string {
  const d = (p.descripcion ?? '').toLowerCase()
  const u = (p.ubicacion ?? '').toLowerCase()
  if (d.includes('penthouse') || d.includes('ático')) return 'Penthouse · Altura'
  if (d.includes('loft') || d.includes('industrial')) return 'Industrial · Loft'
  if (d.includes('colonial') || d.includes('tradicional')) return 'Clásico · Colonial'
  if ((p.habitaciones ?? 0) >= 4) return 'Familiar · Amplio'
  if (d.includes('piscina') || d.includes('club')) return 'Club · Piscina'
  if (u.includes('chapinero') || u.includes('usaquén') || u.includes('laureles')) return 'Barrio · Caminable'
  if (p.tipo_inmueble === 'Apartamento') return 'Luminoso · Contemporáneo'
  if (p.tipo_inmueble === 'Casa') return 'Casa · Jardín'
  return 'Moderno · Diseño'
}

export function deriveTags(p: AtlasProperty): string[] {
  const d = (p.descripcion ?? '').toLowerCase()
  const tags: string[] = []
  if (d.includes('piscina')) tags.push('Piscina')
  if (d.includes('terraza') || d.includes('balcón')) tags.push('Terraza')
  if (d.includes('amoblado') || d.includes('amueblado')) tags.push('Amoblado')
  if (d.includes('gym') || d.includes('gimnasio')) tags.push('Gym')
  if (d.includes('home office') || d.includes('estudio')) tags.push('Home office')
  if (d.includes('pet') || d.includes('mascota')) tags.push('Pet friendly')
  if (d.includes('vigilancia') || d.includes('seguridad')) tags.push('Vigilancia 24h')
  if ((p.parqueaderos ?? 0) > 0) tags.push('Parqueadero')
  if ((p.estrato ?? 0) >= 5) tags.push(`Estrato ${p.estrato}`)
  if (tags.length === 0 && p.tipo_negocio === 'Venta') tags.push('Off-market')
  return tags.slice(0, 4)
}

export function computeMatchScore(p: AtlasProperty, intents: string[]): number {
  if (intents.length === 0) return 72 + Math.floor(Math.random() * 20)
  const text = [p.descripcion, p.ubicacion, p.ciudad, ...p.tags, p.mood]
    .join(' ')
    .toLowerCase()
  const hits = intents.filter((it) => text.includes(it.toLowerCase())).length
  const base = Math.round((hits / intents.length) * 35)
  return Math.min(99, 60 + base + Math.floor(Math.random() * 8))
}
