'use client'

import Image from 'next/image'
import { useState } from 'react'
import { usePortalAgent } from '@/store/portal-agent-store'

function formatCOP(value: number): string {
  if (value >= 1_000_000_000) return `$${(value / 1_000_000_000).toFixed(2)}B`
  if (value >= 1_000_000) return `$${(value / 1_000_000).toFixed(0)} millones`
  return `$${value.toLocaleString('es-CO')}`
}

export function PropertyDetailView() {
  const property = usePortalAgent((s) => s.focusedProperty)
  const focusProperty = usePortalAgent((s) => s.focusProperty)
  const setSchedulingProperty = usePortalAgent((s) => s.setSchedulingProperty)
  const [imgIdx, setImgIdx] = useState(0)

  if (!property) return null

  const images = property.imagenes ?? []
  const cover = images[imgIdx] ?? null

  const specs = [
    property.area_m2 && { label: 'Área', value: `${property.area_m2} m²` },
    property.habitaciones != null && { label: 'Habitaciones', value: property.habitaciones },
    property.banos != null && { label: 'Baños', value: property.banos },
    property.parqueaderos != null && { label: 'Parqueaderos', value: property.parqueaderos },
    property.estrato != null && { label: 'Estrato', value: property.estrato },
  ].filter(Boolean) as { label: string; value: string | number }[]

  return (
    <div className="flex flex-col h-full overflow-y-auto hide-scrollbar">
      {/* Back button */}
      <button
        onClick={() => focusProperty(null)}
        className="flex items-center gap-1.5 px-4 pt-4 pb-2 text-xs text-on-surface/60 hover:text-on-surface transition-colors"
      >
        ← Volver a resultados
      </button>

      {/* Image gallery */}
      <div className="relative h-64 md:h-80 bg-surface-container mx-4 rounded-xl overflow-hidden shrink-0">
        {cover ? (
          <Image
            src={cover}
            alt={`${property.codigo} foto ${imgIdx + 1}`}
            fill
            className="object-cover"
            sizes="(max-width: 768px) 100vw, 600px"
            priority
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center text-outline-variant/40">
            <svg viewBox="0 0 24 24" fill="currentColor" className="w-12 h-12" aria-hidden>
              <path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z" />
            </svg>
          </div>
        )}

        {/* Type badge */}
        {property.tipo_negocio && (
          <div className="absolute top-3 left-3 bg-black/50 text-white text-xs font-medium px-2 py-1 rounded-lg uppercase tracking-wide">
            {property.tipo_negocio}
          </div>
        )}

        {/* Image nav dots */}
        {images.length > 1 && (
          <div className="absolute bottom-3 inset-x-0 flex justify-center gap-1.5">
            {images.map((_, i) => (
              <button
                key={i}
                onClick={() => setImgIdx(i)}
                className={[
                  'w-1.5 h-1.5 rounded-full transition-all',
                  i === imgIdx ? 'bg-white scale-125' : 'bg-white/50',
                ].join(' ')}
              />
            ))}
          </div>
        )}
      </div>

      {/* Content */}
      <div className="flex flex-col gap-5 px-4 pt-4 pb-6">
        {/* Price + address */}
        <div>
          {property.precio != null && (
            <p className="text-2xl font-semibold text-authority-green mb-0.5">
              {formatCOP(property.precio)}
            </p>
          )}
          <p className="text-sm text-on-surface font-medium">
            {property.ubicacion ?? property.ciudad ?? property.codigo}
          </p>
          {property.tipo_inmueble && (
            <p className="text-xs text-on-surface/50 mt-0.5">{property.tipo_inmueble}</p>
          )}
        </div>

        {/* Specs grid */}
        {specs.length > 0 && (
          <div className="grid grid-cols-3 gap-2">
            {specs.map(({ label, value }) => (
              <div
                key={label}
                className="flex flex-col items-center gap-0.5 bg-surface-container rounded-lg px-2 py-2.5"
              >
                <span className="text-sm font-semibold text-on-surface">{value}</span>
                <span className="text-[10px] text-on-surface/50">{label}</span>
              </div>
            ))}
          </div>
        )}

        {/* AI insight */}
        {property.agent_insight && (
          <div className="bg-brand-teal/8 border border-brand-teal/20 rounded-xl p-3">
            <p className="text-xs font-medium text-authority-green mb-1">Análisis del agente</p>
            <p className="text-xs text-on-surface/70 leading-relaxed">{property.agent_insight}</p>
          </div>
        )}

        {/* Description */}
        {property.descripcion && (
          <div>
            <p className="text-xs font-medium text-on-surface mb-1.5">Descripción</p>
            <p className="text-xs text-on-surface/60 leading-relaxed">{property.descripcion}</p>
          </div>
        )}

        {/* CTA */}
        <button
          onClick={() => setSchedulingProperty(property)}
          className="w-full py-3 rounded-xl bg-authority-green text-white text-sm font-semibold hover:bg-authority-green/90 transition-colors shadow-glow-subtle"
        >
          Agendar visita
        </button>
      </div>
    </div>
  )
}
