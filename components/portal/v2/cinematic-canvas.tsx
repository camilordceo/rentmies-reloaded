'use client'

import { useEffect } from 'react'
import { usePortalAgent } from '@/store/portal-agent-store'
import { CinematicHero } from './cinematic-hero'
import { PropertyMatchCard } from './property-match-card'
import { PropertyDetailView } from './property-detail-view'
import { MapSection } from './map-section'
import type { PropertyItem } from '@/store/portal-agent-store'

interface CinematicCanvasProps {
  empresaNombre: string
  featuredProperties: PropertyItem[]
}

export function CinematicCanvas({ empresaNombre, featuredProperties }: CinematicCanvasProps) {
  const viewMode = usePortalAgent((s) => s.viewMode)
  const displayedProperties = usePortalAgent((s) => s.displayedProperties)
  const setFeaturedProperties = usePortalAgent((s) => s.setFeaturedProperties)

  // Seed featured properties into store on mount
  useEffect(() => {
    setFeaturedProperties(featuredProperties)
  }, [featuredProperties, setFeaturedProperties])

  const properties =
    viewMode === 'discover'
      ? featuredProperties
      : displayedProperties

  return (
    <main className="flex-1 overflow-y-auto hide-scrollbar bg-surface-container/30">
      {viewMode === 'property-detail' ? (
        <PropertyDetailView />
      ) : viewMode === 'discover' && properties.length === 0 ? (
        <CinematicHero empresaNombre={empresaNombre} />
      ) : (
        <div className="p-4 md:p-6">
          {/* Section label */}
          <div className="flex items-center justify-between mb-4">
            <p className="text-xs font-medium text-on-surface/50 uppercase tracking-wider">
              {viewMode === 'discover' ? 'Destacados' : `${properties.length} inmuebles`}
            </p>
            {viewMode === 'search-results' && (
              <button
                onClick={() => usePortalAgent.getState().setViewMode('discover')}
                className="text-xs text-on-surface/40 hover:text-on-surface transition-colors"
              >
                ← Inicio
              </button>
            )}
          </div>

          {/* Property grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3 md:gap-4">
            {properties.map((p) => (
              <PropertyMatchCard key={p.codigo} property={p} />
            ))}
          </div>

          {/* Map / location chips */}
          <MapSection />
        </div>
      )}
    </main>
  )
}
