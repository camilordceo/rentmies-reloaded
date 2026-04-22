'use client'
import { useState } from 'react'
import { useAtlasStore, fmtCOP } from '@/store/atlas-store'

const ROOMS = [
  { name: 'Vestíbulo', detail: 'Techo de doble altura, primera impresión', temp: '22°', luz: '75%', db: '30dB' },
  { name: 'Sala principal', detail: 'Orientación norte, luz natural constante', temp: '23°', luz: '88%', db: '28dB' },
  { name: 'Cocina abierta', detail: 'Isla central, integrada con zona social', temp: '21°', luz: '82%', db: '32dB' },
  { name: 'Terraza', detail: 'Vista panorámica, atardecer incluido', temp: '19°', luz: '100%', db: '38dB' },
  { name: 'Suite principal', detail: 'Baño en mármol, walk-in closet', temp: '22°', luz: '78%', db: '24dB' },
]

export function Chapter3Tour() {
  const { properties, mouse, openDrawer, openEmaPanel } = useAtlasStore((s) => ({
    properties: s.properties,
    mouse: s.mouse,
    openDrawer: s.openDrawer,
    openEmaPanel: s.openEmaPanel,
  }))

  const [activeRoom, setActiveRoom] = useState(0)

  const featured = properties[0] ?? null
  const img =
    featured?.imagenes?.[0] ??
    'https://images.unsplash.com/photo-1613977257363-707ba9348227?w=1200&q=80'

  return (
    <section
      className="atlas-chapter"
      style={{
        display: 'grid',
        gridTemplateColumns: '1.2fr 1fr',
        padding: '100px 72px 72px 180px',
        gap: 48,
        position: 'relative',
        background: '#fcf9f8',
      }}
    >
      {/* Left: immersive image */}
      <div
        style={{
          position: 'relative',
          borderRadius: 20,
          overflow: 'hidden',
          boxShadow: '0 12px 40px -6px rgba(28,27,27,0.10)',
        }}
      >
        <img
          src={img}
          alt=""
          style={{
            position: 'absolute',
            inset: 0,
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            transform: `scale(${1.04 + activeRoom * 0.015}) translate(${(mouse.x - 0.5) * -8}px, ${(mouse.y - 0.5) * -8}px)`,
            transition: 'transform 1s cubic-bezier(.2,.7,.2,1)',
          }}
        />
        <div
          style={{
            position: 'absolute',
            inset: 0,
            background:
              'linear-gradient(180deg, rgba(28,27,27,0.28) 0%, transparent 40%, rgba(28,27,27,0.68) 100%)',
          }}
        />

        {/* Room selector */}
        <div
          style={{
            position: 'absolute',
            bottom: 28,
            left: 28,
            right: 28,
            display: 'flex',
            flexDirection: 'column',
            gap: 10,
          }}
        >
          <div className="atlas-mono atlas-eyebrow" style={{ color: '#4fffb4', marginBottom: 10 }}>
            Recorrido íntimo {featured ? `· ${featured.ubicacion}` : ''}
          </div>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            {ROOMS.map((r, i) => (
              <button
                key={r.name}
                onClick={() => setActiveRoom(i)}
                style={{
                  border: 'none',
                  cursor: 'pointer',
                  padding: '9px 14px',
                  borderRadius: 999,
                  background: i === activeRoom ? '#40d99d' : 'rgba(255,255,255,0.14)',
                  color: i === activeRoom ? '#004d35' : '#fff',
                  backdropFilter: 'blur(12px)',
                  fontSize: 11,
                  fontWeight: 600,
                  transition: 'all .3s',
                  boxShadow: i === activeRoom ? '0 0 24px 2px rgba(64,217,157,0.35)' : 'none',
                }}
              >
                {r.name}
              </button>
            ))}
          </div>
        </div>

        {/* Hotspot ping */}
        <div
          style={{
            position: 'absolute',
            top: '42%',
            left: '52%',
            width: 16,
            height: 16,
            borderRadius: '50%',
            background: '#40d99d',
            transform: 'translate(-50%,-50%)',
            animation: 'breathe 1.8s infinite',
          }}
        >
          <span
            style={{
              position: 'absolute',
              inset: -6,
              borderRadius: '50%',
              border: '1.5px solid #40d99d',
              animation: 'pulse-ring 2s ease-out infinite',
            }}
          />
        </div>
      </div>

      {/* Right: details */}
      <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
        <div className="atlas-eyebrow" style={{ color: '#006c4a', marginBottom: 18 }}>
          Capítulo 03 · Recorrido íntimo
        </div>
        <h2
          className="atlas-display"
          style={{ fontSize: 'clamp(36px, 4vw, 58px)', margin: 0, marginBottom: 20, color: '#1c1b1b' }}
        >
          Entra, sin agente,<br />sin presión.
        </h2>

        {/* Room detail card */}
        <div
          style={{
            background: '#fff',
            borderRadius: 16,
            padding: 24,
            boxShadow: '0 32px 64px -12px rgba(28,27,27,0.06)',
            marginTop: 8,
          }}
        >
          <div className="atlas-mono atlas-eyebrow" style={{ color: '#6b7280', marginBottom: 8, fontSize: 8 }}>
            EMA narra
          </div>
          <div
            style={{ fontSize: 26, fontWeight: 700, letterSpacing: '-0.02em', color: '#1c1b1b', marginBottom: 8 }}
          >
            {ROOMS[activeRoom].name}
          </div>
          <div style={{ fontSize: 13, color: '#3c4a42', marginBottom: 16 }}>
            {ROOMS[activeRoom].detail}
          </div>

          <div
            style={{
              display: 'flex',
              gap: 12,
              background: '#f0eded',
              margin: '0 -24px -24px',
              padding: '16px 24px',
              borderRadius: '0 0 16px 16px',
            }}
          >
            {[
              { label: 'Temp.', value: ROOMS[activeRoom].temp },
              { label: 'Luz', value: ROOMS[activeRoom].luz },
              { label: 'Acústica', value: ROOMS[activeRoom].db },
            ].map(({ label, value }) => (
              <div key={label} style={{ flex: 1 }}>
                <div className="atlas-mono atlas-eyebrow" style={{ color: '#6b7280', marginBottom: 4, fontSize: 8 }}>
                  {label}
                </div>
                <div style={{ fontSize: 19, fontWeight: 700, color: '#006c4a' }}>{value}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Cashback snapshot */}
        {featured?.cashback_amount && (
          <div
            style={{
              background: 'linear-gradient(135deg, #004d35, #006c4a)',
              borderRadius: 14,
              padding: '14px 18px',
              marginTop: 16,
              color: '#fff',
            }}
          >
            <div className="atlas-mono atlas-eyebrow" style={{ color: '#4fffb4', fontSize: 8, marginBottom: 4 }}>
              Tu cashback aquí
            </div>
            <div style={{ fontSize: 26, fontWeight: 800, color: '#4fffb4', letterSpacing: '-0.02em' }}>
              +{fmtCOP(featured.cashback_amount)}
            </div>
          </div>
        )}

        <div style={{ display: 'flex', gap: 10, marginTop: 18 }}>
          <button
            onClick={() => featured && openDrawer(featured)}
            style={{
              background: '#1c1b1b',
              color: '#fff',
              border: 'none',
              padding: '13px 20px',
              borderRadius: 999,
              fontSize: 12,
              fontWeight: 600,
              cursor: 'pointer',
              flex: 1,
            }}
          >
            Agendar visita privada
          </button>
          <button
            onClick={openEmaPanel}
            style={{
              background: '#40d99d',
              color: '#004d35',
              border: 'none',
              padding: '13px 20px',
              borderRadius: 999,
              fontSize: 12,
              fontWeight: 700,
              cursor: 'pointer',
              flex: 1,
            }}
          >
            Tour con EMA ✦
          </button>
        </div>
      </div>
    </section>
  )
}
