'use client'

import Image from 'next/image'
import { usePortalAgent } from '@/store/portal-agent-store'
import type { PropertyItem } from '@/store/portal-agent-store'

interface PropertyMatchCardProps {
  property: PropertyItem
}

function formatCOP(value: number): string {
  if (value >= 1_000_000_000) return `$${(value / 1_000_000_000).toFixed(1)}B`
  if (value >= 1_000_000) return `$${(value / 1_000_000).toFixed(0)}M`
  return `$${value.toLocaleString('es-CO')}`
}

export function PropertyMatchCard({ property }: PropertyMatchCardProps) {
  const highlightedCode = usePortalAgent((s) => s.highlightedPropertyCode)
  const focusProperty = usePortalAgent((s) => s.focusProperty)
  const highlightProperty = usePortalAgent((s) => s.highlightProperty)

  const isHighlighted = highlightedCode === property.codigo
  const coverImage = property.imagenes?.[0]

  return (
    <article
      onClick={() => focusProperty(property)}
      onMouseEnter={() => highlightProperty(property.codigo)}
      onMouseLeave={() => highlightProperty(null)}
      className={[
        'group relative rounded-xl overflow-hidden cursor-pointer transition-all duration-200',
        'bg-surface-container-low border border-outline-variant/20',
        'hover:shadow-editorial hover:-translate-y-0.5',
        isHighlighted ? 'ring-2 ring-brand-teal shadow-glow-subtle' : '',
      ].join(' ')}
    >
      {/* Image */}
      <div className="relative h-40 bg-surface-container">
        {coverImage ? (
          <Image
            src={coverImage}
            alt={property.codigo}
            fill
            className="object-cover transition-transform duration-300 group-hover:scale-105"
            sizes="(max-width: 768px) 100vw, 320px"
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center text-outline-variant/50">
            <svg viewBox="0 0 24 24" fill="currentColor" className="w-8 h-8" aria-hidden>
              <path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z" />
            </svg>
          </div>
        )}

        {/* Match score badge */}
        {property.match_score !== undefined && (
          <div className="absolute top-2 right-2 bg-authority-green text-white text-[10px] font-bold px-1.5 py-0.5 rounded-md">
            {Math.round(property.match_score * 100)}%
          </div>
        )}

        {/* Tipo negocio */}
        {property.tipo_negocio && (
          <div className="absolute top-2 left-2 bg-black/50 text-white text-[10px] font-medium px-1.5 py-0.5 rounded-md uppercase tracking-wide">
            {property.tipo_negocio}
          </div>
        )}
      </div>

      {/* Info */}
      <div className="p-3 space-y-1.5">
        <div className="flex items-start justify-between gap-2">
          <p className="text-xs font-medium text-on-surface line-clamp-2 leading-tight">
            {property.ubicacion ?? property.ciudad ?? property.codigo}
          </p>
          {property.precio != null && (
            <span className="text-sm font-semibold text-authority-green shrink-0">
              {formatCOP(property.precio)}
            </span>
          )}
        </div>

        {/* Specs */}
        <div className="flex items-center gap-3 text-[11px] text-on-surface/50">
          {property.area_m2 && <span>{property.area_m2} m²</span>}
          {property.habitaciones != null && <span>{property.habitaciones} hab.</span>}
          {property.banos != null && <span>{property.banos} baños</span>}
        </div>

        {/* Agent insight */}
        {property.agent_insight && (
          <p className="text-[11px] text-on-surface/60 italic line-clamp-2 border-t border-outline-variant/20 pt-1.5 mt-1.5">
            {property.agent_insight}
          </p>
        )}
      </div>
    </article>
  )
}
