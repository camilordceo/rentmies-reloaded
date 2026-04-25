'use client'
import { useState } from 'react'
import { useShallow } from 'zustand/react/shallow'
import { useAtlasStore, fmtCOP, computeMatchScore } from '@/store/atlas-store'
import type { AtlasProperty } from '@/store/atlas-store'
import { CashbackCoin } from './cashback-coin'
import { SkeletonCard, SkeletonRailCard } from './skeleton-card'

function getImg(p: AtlasProperty): string {
  return p.imagenes?.[0] ?? 'https://images.unsplash.com/photo-1613977257363-707ba9348227?w=1200&q=80'
}

function fmtPrice(p: AtlasProperty): string {
  if (!p.precio) return '—'
  const base = fmtCOP(p.precio)
  return p.tipo_negocio === 'Arriendo' ? base + '/mes' : base
}

export function Chapter2Curation() {
  const { properties, activeIntents, openDrawer, mouse, isSearching } = useAtlasStore(
    useShallow((s) => ({
      properties: s.properties,
      activeIntents: s.activeIntents,
      openDrawer: s.openDrawer,
      mouse: s.mouse,
      isSearching: s.isSearching,
    }))
  )

  const [focusIdx, setFocusIdx] = useState(0)

  const sorted = [...properties]
    .map((p) => ({ ...p, match_score: computeMatchScore(p, activeIntents) }))
    .sort((a, b) => b.match_score - a.match_score)
    .slice(0, 10)

  const focus = sorted[focusIdx] ?? null
  const totalCashback = sorted.reduce((s, p) => s + (p.cashback_amount ?? 0), 0)

  if (!focus) {
    return (
      <section
        className="atlas-chapter"
        style={{
          display: 'flex',
          flexDirection: 'column',
          background: '#fcf9f8',
          padding: '88px 56px 32px 140px',
          gap: 20,
        }}
      >
        <div>
          <div className="atlas-eyebrow" style={{ color: '#006c4a', marginBottom: 10 }}>
            Capítulo 02 · Curaduría viva
          </div>
          <h2
            className="atlas-display"
            style={{ fontSize: 'clamp(28px, 3vw, 46px)', margin: 0, maxWidth: 620, lineHeight: 1.04 }}
          >
            {isSearching ? (
              <>EMA está buscando para ti.<br /><span style={{ color: '#006c4a' }}>Componiendo tu curaduría…</span></>
            ) : (
              <>Aún sin propiedades.<br /><span style={{ color: '#006c4a' }}>Háblale a EMA para empezar.</span></>
            )}
          </h2>
        </div>
        <div
          style={{
            flex: 1,
            display: 'grid',
            gridTemplateColumns: '256px 1fr 300px',
            gap: 18,
            minHeight: 0,
          }}
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: 7, padding: 16, background: '#fff', borderRadius: 20 }}>
            {Array.from({ length: 5 }).map((_, i) => <SkeletonRailCard key={i} />)}
          </div>
          <SkeletonCard />
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <SkeletonCard delay={120} />
            <SkeletonCard delay={240} />
          </div>
        </div>
      </section>
    )
  }

  return (
    <section
      className="atlas-chapter"
      style={{
        display: 'flex',
        flexDirection: 'column',
        padding: '88px 56px 32px 140px',
        position: 'relative',
        overflow: 'hidden',
        background: '#fcf9f8',
        gap: 20,
      }}
    >
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
        <div>
          <div className="atlas-eyebrow" style={{ color: '#006c4a', marginBottom: 10 }}>
            Capítulo 02 · Curaduría viva
          </div>
          <h2
            className="atlas-display"
            style={{ fontSize: 'clamp(28px, 3vw, 46px)', margin: 0, maxWidth: 620, lineHeight: 1.04 }}
          >
            {sorted.length} propiedades reordenadas por ti.<br />
            <span style={{ color: '#006c4a' }}>Las mejores flotan al frente.</span>
          </h2>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span
            style={{
              width: 8,
              height: 8,
              borderRadius: '50%',
              background: '#40d99d',
              boxShadow: '0 0 12px #40d99d',
              animation: 'breathe 1.6s infinite',
            }}
          />
          <span style={{ fontSize: 12, fontWeight: 600, color: '#3c4a42' }}>EMA reorganizando en vivo</span>
        </div>
      </div>

      {/* 3-col grid */}
      <div
        style={{
          flex: 1,
          display: 'grid',
          gridTemplateColumns: '256px 1fr 300px',
          gap: 18,
          minHeight: 0,
        }}
      >
        {/* LEFT: Ranked list */}
        <div
          style={{
            background: '#fff',
            borderRadius: 20,
            padding: 16,
            display: 'flex',
            flexDirection: 'column',
            boxShadow: '0 32px 64px -12px rgba(28,27,27,0.06)',
            minHeight: 0,
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
            <span className="atlas-mono atlas-eyebrow" style={{ color: '#6b7280', fontSize: 8 }}>
              Ranking en vivo
            </span>
            <span
              className="atlas-mono"
              style={{
                fontSize: 8,
                fontWeight: 700,
                color: '#006c4a',
                background: 'rgba(0,108,74,0.1)',
                padding: '2px 6px',
                borderRadius: 999,
                letterSpacing: '0.1em',
              }}
            >
              ↑↓ EMA
            </span>
          </div>

          <div
            style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 7 }}
            className="hide-scrollbar"
          >
            {sorted.map((p, i) => {
              const isActive = i === focusIdx
              return (
                <button
                  key={p.id}
                  onClick={() => setFocusIdx(i)}
                  style={{
                    textAlign: 'left',
                    border: 'none',
                    cursor: 'pointer',
                    padding: 9,
                    borderRadius: 12,
                    background: isActive ? '#1c1b1b' : '#f0eded',
                    color: isActive ? '#fff' : '#1c1b1b',
                    display: 'flex',
                    gap: 9,
                    alignItems: 'center',
                    transition: 'all .3s',
                  }}
                >
                  <span
                    className="atlas-mono"
                    style={{
                      fontSize: 9,
                      fontWeight: 700,
                      color: isActive ? '#4fffb4' : '#6b7280',
                      width: 18,
                      flexShrink: 0,
                    }}
                  >
                    {String(i + 1).padStart(2, '0')}
                  </span>
                  <div
                    style={{
                      width: 40,
                      height: 40,
                      borderRadius: 8,
                      flexShrink: 0,
                      backgroundImage: `url(${getImg(p)})`,
                      backgroundSize: 'cover',
                      backgroundPosition: 'center',
                    }}
                  />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div
                      style={{
                        fontSize: 11,
                        fontWeight: 600,
                        whiteSpace: 'nowrap',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                      }}
                    >
                      {p.ubicacion}
                    </div>
                    <div style={{ fontSize: 9, color: isActive ? 'rgba(255,255,255,0.6)' : '#6b7280', marginTop: 2 }}>
                      {p.ciudad} · {fmtPrice(p)}
                    </div>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 1 }}>
                    <div
                      style={{
                        fontSize: 13,
                        fontWeight: 800,
                        color: isActive ? '#4fffb4' : '#006c4a',
                        lineHeight: 1,
                      }}
                    >
                      {p.match_score}
                    </div>
                    <span
                      className="atlas-mono"
                      style={{ fontSize: 7, color: isActive ? 'rgba(255,255,255,0.5)' : '#6b7280', letterSpacing: '0.1em' }}
                    >
                      MATCH
                    </span>
                  </div>
                </button>
              )
            })}
          </div>

          {/* Cashback pool */}
          <div
            style={{
              marginTop: 12,
              padding: 12,
              borderRadius: 12,
              background: 'linear-gradient(135deg, #004d35, #006c4a)',
              color: '#fff',
            }}
          >
            <div className="atlas-mono atlas-eyebrow" style={{ color: '#4fffb4', fontSize: 7, marginBottom: 2 }}>
              Cashback del set
            </div>
            <div style={{ fontSize: 22, fontWeight: 800, color: '#4fffb4', letterSpacing: '-0.02em' }}>
              +{fmtCOP(totalCashback)}
            </div>
            <div style={{ fontSize: 9, color: 'rgba(255,255,255,0.7)', marginTop: 2 }}>
              Si eligieras aquí, esto vuelve a ti.
            </div>
          </div>
        </div>

        {/* CENTER: Hero card */}
        <div
          key={focus.id}
          style={{
            position: 'relative',
            borderRadius: 22,
            overflow: 'hidden',
            boxShadow: '0 12px 40px -6px rgba(28,27,27,0.10)',
            animation: 'rise-in .6s ease-out',
            cursor: 'pointer',
          }}
          onClick={() => openDrawer(focus)}
        >
          <img
            src={getImg(focus)}
            alt={focus.ubicacion}
            style={{
              position: 'absolute',
              inset: 0,
              width: '100%',
              height: '100%',
              objectFit: 'cover',
              transform: `scale(1.08) translate(${(mouse.x - 0.5) * -10}px, ${(mouse.y - 0.5) * -10}px)`,
              transition: 'transform .8s cubic-bezier(.2,.7,.2,1)',
            }}
          />
          <div
            style={{
              position: 'absolute',
              inset: 0,
              background:
                'linear-gradient(180deg, rgba(28,27,27,0.5) 0%, transparent 32%, transparent 52%, rgba(28,27,27,0.9) 100%)',
            }}
          />

          {/* Top chips */}
          <div
            style={{
              position: 'absolute',
              top: 20,
              left: 20,
              right: 20,
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'flex-start',
              zIndex: 3,
            }}
          >
            <div style={{ display: 'flex', flexDirection: 'column', gap: 7 }}>
              <span className="atlas-chip-glass">
                {focus.tipo_negocio === 'Arriendo' ? 'En arriendo' : 'En venta'}
              </span>
              <span
                className="atlas-mono"
                style={{
                  fontSize: 8,
                  color: 'rgba(255,255,255,0.9)',
                  letterSpacing: '0.15em',
                  textTransform: 'uppercase',
                  background: 'rgba(0,0,0,0.42)',
                  backdropFilter: 'blur(8px)',
                  padding: '4px 8px',
                  borderRadius: 4,
                  width: 'fit-content',
                  fontWeight: 600,
                }}
              >
                {focus.mood}
              </span>
            </div>

            {/* Match ring */}
            <div style={{ width: 64, height: 64, borderRadius: '50%', position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <div
                style={{
                  position: 'absolute',
                  inset: 0,
                  borderRadius: '50%',
                  background: `conic-gradient(#40d99d ${focus.match_score}%, rgba(255,255,255,0.18) 0)`,
                }}
              />
              <div
                style={{
                  position: 'absolute',
                  inset: 4,
                  borderRadius: '50%',
                  background: 'rgba(28,27,27,0.92)',
                  backdropFilter: 'blur(8px)',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <span style={{ fontSize: 16, fontWeight: 800, color: '#40d99d', lineHeight: 1 }}>
                  {focus.match_score}
                </span>
                <span className="atlas-mono" style={{ fontSize: 6, color: 'rgba(255,255,255,0.6)', letterSpacing: '0.15em', marginTop: 2 }}>
                  MATCH
                </span>
              </div>
            </div>
          </div>

          {/* Cashback coin */}
          <div style={{ position: 'absolute', top: 108, right: -24, zIndex: 4 }}>
            <CashbackCoin amount={focus.cashback_amount} tipo={focus.tipo_negocio} size={148} />
          </div>

          {/* Bottom info */}
          <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, padding: 28, color: '#fff', zIndex: 3 }}>
            <div className="atlas-mono atlas-eyebrow" style={{ color: '#4fffb4', marginBottom: 8 }}>
              {focus.ciudad}
            </div>
            <div
              style={{
                fontSize: 'clamp(24px, 2.6vw, 38px)',
                fontWeight: 700,
                letterSpacing: '-0.03em',
                lineHeight: 1.04,
                marginBottom: 12,
                maxWidth: 460,
              }}
            >
              {focus.ubicacion}
            </div>
            <div style={{ display: 'flex', gap: 24, alignItems: 'flex-end', flexWrap: 'wrap' }}>
              <div>
                <div className="atlas-mono atlas-eyebrow" style={{ color: 'rgba(255,255,255,0.55)', fontSize: 8, marginBottom: 4 }}>
                  {focus.tipo_negocio === 'Arriendo' ? 'Canon mensual' : 'Precio'}
                </div>
                <div style={{ fontSize: 20, fontWeight: 700 }}>{fmtPrice(focus)}</div>
              </div>
              <div style={{ display: 'flex', gap: 14, fontSize: 11, color: 'rgba(255,255,255,0.7)', paddingBottom: 2 }}>
                {focus.area_m2 && <span><b style={{ color: '#fff', fontSize: 13 }}>{focus.area_m2}</b>m²</span>}
                {focus.habitaciones && <span><b style={{ color: '#fff', fontSize: 13 }}>{focus.habitaciones}</b>hab</span>}
                {focus.banos && <span><b style={{ color: '#fff', fontSize: 13 }}>{focus.banos}</b>baños</span>}
              </div>
              <button
                onClick={(e) => { e.stopPropagation(); openDrawer(focus) }}
                style={{
                  marginLeft: 'auto',
                  background: '#40d99d',
                  color: '#004d35',
                  border: 'none',
                  padding: '12px 20px',
                  borderRadius: 999,
                  fontSize: 11,
                  fontWeight: 800,
                  cursor: 'pointer',
                  letterSpacing: '0.05em',
                  textTransform: 'uppercase',
                }}
              >
                Entrar →
              </button>
            </div>
          </div>
        </div>

        {/* RIGHT: TikTok-stack */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12, minHeight: 0, overflow: 'hidden' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span className="atlas-mono atlas-eyebrow" style={{ color: '#6b7280', fontSize: 8 }}>
              También te compuso
            </span>
            <span className="atlas-mono" style={{ fontSize: 10, color: '#006c4a', fontWeight: 700 }}>
              swipe ↓
            </span>
          </div>
          <div
            style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 12, paddingRight: 2 }}
            className="hide-scrollbar"
          >
            {sorted
              .filter((_, i) => i !== focusIdx)
              .slice(0, 6)
              .map((p, i) => (
                <div
                  key={p.id}
                  onClick={() => setFocusIdx(sorted.indexOf(p))}
                  style={{
                    position: 'relative',
                    aspectRatio: '5/4',
                    borderRadius: 16,
                    overflow: 'hidden',
                    cursor: 'pointer',
                    flexShrink: 0,
                    boxShadow: '0 32px 64px -12px rgba(28,27,27,0.06)',
                    transition: 'transform .4s',
                    animation: `rise-in .5s ease-out ${i * 0.05}s both`,
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.transform = 'translateY(-4px) scale(1.01)')}
                  onMouseLeave={(e) => (e.currentTarget.style.transform = 'none')}
                >
                  <img
                    src={getImg(p)}
                    alt=""
                    style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }}
                  />
                  <div
                    style={{
                      position: 'absolute',
                      inset: 0,
                      background: 'linear-gradient(180deg, rgba(28,27,27,0.22) 0%, transparent 38%, rgba(28,27,27,0.86) 100%)',
                    }}
                  />

                  {/* Match pill */}
                  <div
                    style={{
                      position: 'absolute',
                      top: 10,
                      right: 10,
                      display: 'flex',
                      alignItems: 'center',
                      gap: 4,
                      background: 'rgba(28,27,27,0.75)',
                      backdropFilter: 'blur(8px)',
                      padding: '4px 8px',
                      borderRadius: 999,
                      color: '#40d99d',
                      fontSize: 10,
                      fontWeight: 800,
                    }}
                  >
                    {p.match_score}
                    <span className="atlas-mono" style={{ fontSize: 7, color: 'rgba(255,255,255,0.6)', letterSpacing: '0.1em' }}>
                      MATCH
                    </span>
                  </div>

                  {/* Cashback sticker */}
                  <div
                    style={{
                      position: 'absolute',
                      top: 10,
                      left: 10,
                      background: '#40d99d',
                      color: '#004d35',
                      padding: '3px 8px',
                      borderRadius: 5,
                      fontSize: 9,
                      fontWeight: 900,
                      transform: 'rotate(-4deg)',
                      boxShadow: '0 4px 12px rgba(64,217,157,0.4)',
                    }}
                  >
                    +{fmtCOP(p.cashback_amount)} ↵
                  </div>

                  <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, padding: 12, color: '#fff' }}>
                    <div
                      style={{ fontSize: 13, fontWeight: 700, letterSpacing: '-0.02em', lineHeight: 1.1, marginBottom: 3 }}
                    >
                      {p.ubicacion}
                    </div>
                    <div
                      style={{ display: 'flex', justifyContent: 'space-between', fontSize: 10, color: 'rgba(255,255,255,0.72)' }}
                    >
                      <span>{fmtPrice(p)}</span>
                      <span>{p.area_m2 && `${p.area_m2}m²`} {p.habitaciones && `· ${p.habitaciones}hab`}</span>
                    </div>
                  </div>
                </div>
              ))}
          </div>
        </div>
      </div>
    </section>
  )
}
