'use client'
import { fmtCOP } from '@/lib/atlas-helpers'
import type { AtlasProperty } from '@/store/atlas-store'

export function InlinePropertyCard({
  property,
  onClick,
}: {
  property: AtlasProperty
  onClick: () => void
}) {
  const img = property.imagenes?.[0] ?? null
  const isArriendo = property.tipo_negocio === 'Arriendo'
  const priceLabel = property.precio
    ? isArriendo ? `${fmtCOP(property.precio)}/mes` : fmtCOP(property.precio)
    : '—'

  return (
    <button
      onClick={onClick}
      style={{
        width: '100%',
        display: 'flex',
        gap: 10,
        padding: 8,
        borderRadius: 12,
        background: 'rgba(255,255,255,0.06)',
        border: '1px solid rgba(64,217,157,0.18)',
        borderLeft: '2px solid #40d99d',
        cursor: 'pointer',
        textAlign: 'left',
        color: '#fff',
        animation: 'rise-in .35s ease-out',
        transition: 'all .2s',
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.background = 'rgba(64,217,157,0.1)'
        e.currentTarget.style.transform = 'translateY(-1px)'
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.background = 'rgba(255,255,255,0.06)'
        e.currentTarget.style.transform = 'none'
      }}
    >
      <div
        style={{
          width: 56,
          height: 56,
          borderRadius: 8,
          flexShrink: 0,
          backgroundImage: img ? `url(${img})` : 'linear-gradient(135deg, #1c1b1b, #2a2a2a)',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          position: 'relative',
        }}
      >
        {property.match_score > 0 && (
          <div
            style={{
              position: 'absolute',
              top: -4,
              right: -4,
              width: 22,
              height: 22,
              borderRadius: '50%',
              background: '#40d99d',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 9,
              fontWeight: 800,
              color: '#004d35',
              boxShadow: '0 2px 8px rgba(64,217,157,0.4)',
            }}
          >
            {property.match_score}
          </div>
        )}
      </div>

      <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
        <div
          style={{
            fontSize: 11,
            fontWeight: 600,
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            lineHeight: 1.2,
          }}
        >
          {property.ubicacion || property.ciudad || property.codigo}
        </div>
        <div style={{ display: 'flex', gap: 6, alignItems: 'center', fontSize: 9, color: 'rgba(255,255,255,0.55)' }}>
          {property.habitaciones && <span>{property.habitaciones}h</span>}
          {property.banos && <span>· {property.banos}b</span>}
          {property.area_m2 && <span>· {property.area_m2}m²</span>}
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', gap: 6 }}>
          <span style={{ fontSize: 11, fontWeight: 700, color: '#fff' }}>{priceLabel}</span>
          {property.cashback_amount && (
            <span style={{ fontSize: 9, fontWeight: 700, color: '#4fffb4' }}>
              +{fmtCOP(property.cashback_amount)}
            </span>
          )}
        </div>
      </div>
    </button>
  )
}
