'use client'

import { usePortalAgent } from '@/store/portal-agent-store'

/**
 * MapSection — placeholder that shows a grid of property location chips.
 * Replace the inner <div> with <MapboxMap> or <LeafletMap> when adding a maps dependency.
 */
export function MapSection() {
  const displayedProperties = usePortalAgent((s) => s.displayedProperties)
  const highlightedCode = usePortalAgent((s) => s.highlightedPropertyCode)
  const focusProperty = usePortalAgent((s) => s.focusProperty)
  const highlightProperty = usePortalAgent((s) => s.highlightProperty)

  if (displayedProperties.length === 0) return null

  return (
    <div className="mt-6 px-1">
      <p className="text-xs font-medium text-on-surface/50 uppercase tracking-wider mb-3 px-1">
        Ubicaciones
      </p>
      <div className="flex flex-wrap gap-2">
        {displayedProperties.map((p) => (
          <button
            key={p.codigo}
            onClick={() => focusProperty(p)}
            onMouseEnter={() => highlightProperty(p.codigo)}
            onMouseLeave={() => highlightProperty(null)}
            className={[
              'text-xs px-2.5 py-1 rounded-full border transition-all duration-150',
              highlightedCode === p.codigo
                ? 'bg-brand-teal text-white border-brand-teal'
                : 'bg-surface-container border-outline-variant/30 text-on-surface/70 hover:border-brand-teal/50',
            ].join(' ')}
          >
            {p.ciudad ?? p.ubicacion ?? p.codigo}
          </button>
        ))}
      </div>
    </div>
  )
}
