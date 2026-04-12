'use client'

import { usePortalAgent } from '@/store/portal-agent-store'

interface PortalTopBarProps {
  empresaNombre: string
  ciudad: string | null
}

export function PortalTopBar({ empresaNombre, ciudad }: PortalTopBarProps) {
  const viewMode = usePortalAgent((s) => s.viewMode)
  const displayedProperties = usePortalAgent((s) => s.displayedProperties)

  const crumb =
    viewMode === 'discover'
      ? null
      : viewMode === 'search-results'
        ? `${displayedProperties.length} resultados`
        : viewMode === 'property-detail'
          ? 'Detalle del inmueble'
          : 'Agendar visita'

  return (
    <header className="flex items-center justify-between px-6 h-14 bg-surface border-b border-outline-variant/40 shrink-0">
      {/* Brand */}
      <div className="flex items-center gap-2">
        <span className="text-sm font-semibold text-on-surface tracking-tight">
          {empresaNombre}
        </span>
        {ciudad && (
          <>
            <span className="text-outline-variant">·</span>
            <span className="text-xs text-on-surface/60">{ciudad}</span>
          </>
        )}
      </div>

      {/* Breadcrumb */}
      {crumb && (
        <span className="text-xs text-on-surface/50 font-medium">{crumb}</span>
      )}

      {/* Powered by */}
      <div className="flex items-center gap-1.5">
        <span className="text-[10px] uppercase tracking-widest text-on-surface/40 font-medium">
          powered by
        </span>
        <span className="text-xs font-bold text-brand-teal">Rentmies</span>
      </div>
    </header>
  )
}
