'use client'
import { useShallow } from 'zustand/react/shallow'
import { useAtlasStore, fmtCOP } from '@/store/atlas-store'
import type { SearchFilters } from '@/store/atlas-store'

interface ChipDescriptor {
  key: keyof SearchFilters
  label: string
}

function buildChips(filters: SearchFilters): ChipDescriptor[] {
  const chips: ChipDescriptor[] = []
  if (filters.tipo_inmueble) chips.push({ key: 'tipo_inmueble', label: filters.tipo_inmueble })
  if (filters.tipo_negocio) chips.push({ key: 'tipo_negocio', label: filters.tipo_negocio })
  if (filters.ciudad) chips.push({ key: 'ciudad', label: filters.ciudad })
  if (filters.barrio) chips.push({ key: 'barrio', label: filters.barrio })
  if (filters.precio_min || filters.precio_max) {
    const min = filters.precio_min ? fmtCOP(filters.precio_min) : null
    const max = filters.precio_max ? fmtCOP(filters.precio_max) : null
    const label =
      min && max ? `${min} – ${max}` :
      min ? `desde ${min}` :
      max ? `hasta ${max}` : ''
    chips.push({ key: 'precio_min', label })
  }
  if (filters.habitaciones_min) chips.push({ key: 'habitaciones_min', label: `${filters.habitaciones_min}+ hab` })
  if (filters.area_min) chips.push({ key: 'area_min', label: `${filters.area_min}+ m²` })
  return chips
}

export function ConversationFilters() {
  const { activeFilters, clearFilter, clearAllFilters } = useAtlasStore(
    useShallow((s) => ({
      activeFilters: s.activeFilters,
      clearFilter: s.clearFilter,
      clearAllFilters: s.clearAllFilters,
    }))
  )

  const chips = buildChips(activeFilters)
  if (chips.length === 0) return null

  return (
    <div
      style={{
        display: 'flex',
        flexWrap: 'wrap',
        alignItems: 'center',
        gap: 6,
        padding: '6px 0',
      }}
    >
      <span
        className="atlas-mono"
        style={{
          fontSize: 8,
          letterSpacing: '0.15em',
          textTransform: 'uppercase',
          color: '#6b7280',
          fontWeight: 700,
          paddingRight: 4,
        }}
      >
        Buscado · {chips.length}
      </span>

      {chips.map((c) => (
        <button
          key={c.key}
          onClick={() => {
            // Price chip removes both bounds together
            if (c.key === 'precio_min') {
              clearFilter('precio_min')
              clearFilter('precio_max')
            } else {
              clearFilter(c.key)
            }
          }}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 5,
            padding: '4px 8px 4px 10px',
            borderRadius: 999,
            background: 'rgba(0,108,74,0.1)',
            border: '1px solid rgba(0,108,74,0.18)',
            color: '#006c4a',
            fontSize: 11,
            fontWeight: 600,
            cursor: 'pointer',
            transition: 'all .15s',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = 'rgba(0,108,74,0.18)'
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = 'rgba(0,108,74,0.1)'
          }}
        >
          <span>{c.label}</span>
          <span style={{ fontSize: 11, opacity: 0.6 }}>×</span>
        </button>
      ))}

      {chips.length > 1 && (
        <button
          onClick={clearAllFilters}
          style={{
            padding: '3px 8px',
            borderRadius: 999,
            background: 'transparent',
            border: 'none',
            color: '#6b7280',
            fontSize: 10,
            fontWeight: 600,
            cursor: 'pointer',
            textDecoration: 'underline',
            textUnderlineOffset: 2,
          }}
        >
          Limpiar todos
        </button>
      )}
    </div>
  )
}
