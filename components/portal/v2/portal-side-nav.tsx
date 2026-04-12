'use client'

import { usePortalAgent } from '@/store/portal-agent-store'

const NAV_ITEMS = [
  { icon: '⊞', label: 'Explorar', mode: 'discover' as const },
  { icon: '≡', label: 'Resultados', mode: 'search-results' as const },
  { icon: '◈', label: 'Detalle', mode: 'property-detail' as const },
  { icon: '◷', label: 'Agendar', mode: 'scheduling' as const },
]

export function PortalSideNav() {
  const viewMode = usePortalAgent((s) => s.viewMode)
  const setViewMode = usePortalAgent((s) => s.setViewMode)
  const displayedProperties = usePortalAgent((s) => s.displayedProperties)

  return (
    <nav className="hidden md:flex flex-col items-center gap-1 w-12 py-4 bg-surface border-r border-outline-variant/40 shrink-0">
      {NAV_ITEMS.map(({ icon, label, mode }) => {
        const isActive = viewMode === mode
        const isDisabled =
          (mode === 'search-results' && displayedProperties.length === 0) ||
          (mode === 'property-detail' && !usePortalAgent.getState().focusedProperty) ||
          (mode === 'scheduling' && !usePortalAgent.getState().schedulingProperty)

        return (
          <button
            key={mode}
            onClick={() => !isDisabled && setViewMode(mode)}
            disabled={isDisabled}
            title={label}
            className={[
              'w-9 h-9 rounded-lg flex items-center justify-center text-base transition-all',
              isActive
                ? 'bg-brand-teal/15 text-authority-green shadow-glow-subtle'
                : 'text-on-surface/40 hover:bg-surface-container hover:text-on-surface',
              isDisabled ? 'opacity-30 cursor-not-allowed' : 'cursor-pointer',
            ].join(' ')}
          >
            {icon}
          </button>
        )
      })}
    </nav>
  )
}
