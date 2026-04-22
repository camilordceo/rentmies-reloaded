'use client'
import { useAtlasStore } from '@/store/atlas-store'
import { EmaSphere } from './ema-sphere'
import { Waveform } from './waveform'

const INTENTS = [
  'Luz natural',
  'Home office',
  'Barrio caminable',
  'Piscina',
  'Cerca del trabajo',
  'Escape de fin de semana',
  'Inversión para arrendar',
  'Pet friendly',
  'Cocina abierta',
  'Piso alto',
  'Parqueadero',
  'Zona social',
  'Terraza',
  'Vigilancia 24h',
  'Amoblado',
  'Vista panorámica',
]

export function Chapter1Awakening() {
  const mouse = useAtlasStore((s) => s.mouse)
  const activeIntents = useAtlasStore((s) => s.activeIntents)
  const toggleIntent = useAtlasStore((s) => s.toggleIntent)

  return (
    <section
      className="atlas-chapter"
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '0 80px 0 140px',
        position: 'relative',
        background: '#fcf9f8',
        overflow: 'hidden',
      }}
    >
      {/* Manifesto quote */}
      <div
        style={{
          position: 'absolute',
          top: 92,
          left: '50%',
          transform: 'translateX(-50%)',
          maxWidth: 820,
          textAlign: 'center',
          padding: '0 40px',
          zIndex: 3,
        }}
      >
        <div
          style={{
            fontFamily: 'Georgia, serif',
            fontStyle: 'italic',
            fontWeight: 400,
            fontSize: 'clamp(15px, 1.2vw, 19px)',
            lineHeight: 1.5,
            color: '#1c1b1b',
            letterSpacing: '-0.005em',
          }}
        >
          &ldquo;Una casa no se compra con filtros; se reconoce en silencio.
          El buen corretaje no te presenta cien propiedades &mdash;
          te devuelve las tres que ya eran tuyas, y algo de dinero para celebrarlo.&rdquo;
        </div>
        <div
          className="atlas-mono atlas-eyebrow"
          style={{ marginTop: 12, color: '#6b7280', fontSize: 10, letterSpacing: '0.2em' }}
        >
          &mdash; Manifiesto Rentmies
        </div>
      </div>

      {/* Floating orbs */}
      <div style={{ position: 'absolute', inset: 0, overflow: 'hidden', pointerEvents: 'none' }}>
        <div
          style={{
            position: 'absolute',
            top: '15%',
            right: '8%',
            width: 320,
            height: 320,
            borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(64,217,157,0.16), transparent 70%)',
            transform: `translate(${(mouse.x - 0.5) * 28}px, ${(mouse.y - 0.5) * 28}px)`,
            transition: 'transform .4s',
          }}
        />
        <div
          style={{
            position: 'absolute',
            bottom: '10%',
            left: '18%',
            width: 240,
            height: 240,
            borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(0,108,74,0.10), transparent 70%)',
            transform: `translate(${(mouse.x - 0.5) * -36}px, ${(mouse.y - 0.5) * -36}px)`,
            transition: 'transform .5s',
          }}
        />
      </div>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: 72,
          alignItems: 'center',
          maxWidth: 1280,
          width: '100%',
        }}
      >
        {/* Left: text + intent cloud */}
        <div>
          <div className="atlas-eyebrow" style={{ color: '#006c4a', marginBottom: 24 }}>
            Capítulo 01 · El despertar
          </div>
          <h1
            className="atlas-display"
            style={{
              fontSize: 'clamp(38px, 4.8vw, 72px)',
              margin: 0,
              marginBottom: 28,
              color: '#1c1b1b',
            }}
          >
            Dime qué te hace<br />
            <span className="atlas-shimmer-text">volver a casa.</span>
          </h1>
          <p
            style={{
              fontSize: 16,
              lineHeight: 1.65,
              color: '#3c4a42',
              maxWidth: 440,
              marginBottom: 36,
              fontWeight: 400,
            }}
          >
            EMA escucha. Traduce emoción en arquitectura. Sin filtros fríos, sin dropdowns. Elige las intenciones que te mueven — ella compone el resto.
          </p>

          {/* Intent cloud */}
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10, maxWidth: 520 }}>
            {INTENTS.map((intent, i) => {
              const on = activeIntents.includes(intent)
              return (
                <button
                  key={intent}
                  onClick={() => toggleIntent(intent)}
                  className="atlas-intent-orb"
                  style={{
                    transform: `translateY(${Math.sin(i) * 2}px)`,
                    background: on ? '#006c4a' : '#fff',
                    color: on ? '#fff' : '#1c1b1b',
                    boxShadow: on
                      ? '0 0 24px 2px rgba(64,217,157,0.35)'
                      : '0 32px 64px -12px rgba(28,27,27,0.06)',
                  }}
                >
                  {on && <span style={{ marginRight: 5 }}>✦</span>}
                  {intent}
                </button>
              )
            })}
          </div>

          <div
            style={{
              marginTop: 32,
              display: 'flex',
              alignItems: 'center',
              gap: 12,
              fontSize: 12,
              color: '#6b7280',
            }}
          >
            <kbd
              style={{
                padding: '4px 10px',
                borderRadius: 6,
                background: '#f0eded',
                fontSize: 11,
                fontFamily: 'ui-monospace, monospace',
                fontWeight: 600,
              }}
            >
              →
            </kbd>
            Desliza para ver la curaduría en vivo
          </div>
        </div>

        {/* Right: EMA sphere + orbiting intents + waveform */}
        <div style={{ display: 'flex', justifyContent: 'center', position: 'relative' }}>
          <div style={{ position: 'relative' }}>
            <EmaSphere
              size={280}
              style={{
                transform: `translate(${(mouse.x - 0.5) * -18}px, ${(mouse.y - 0.5) * -18}px)`,
                transition: 'transform .5s',
              }}
            />

            {/* Orbiting intent bubbles */}
            {activeIntents.slice(0, 6).map((intent, i) => {
              const angle = (i / Math.max(activeIntents.length, 1)) * Math.PI * 2 - Math.PI / 2
              const r = 168 + (i % 2) * 16
              return (
                <div
                  key={intent}
                  style={{
                    position: 'absolute',
                    top: '50%',
                    left: '50%',
                    transform: `translate(${Math.cos(angle) * r}px, ${Math.sin(angle) * r}px) translate(-50%, -50%)`,
                    background: '#fff',
                    boxShadow: '0 32px 64px -12px rgba(28,27,27,0.06)',
                    padding: '7px 12px',
                    borderRadius: 999,
                    fontSize: 11,
                    fontWeight: 600,
                    color: '#006c4a',
                    whiteSpace: 'nowrap',
                    animation: 'rise-in .6s ease-out',
                    zIndex: 2,
                  }}
                >
                  {intent}
                </div>
              )
            })}

            {/* Waveform */}
            <div
              style={{
                position: 'absolute',
                bottom: -50,
                left: '50%',
                transform: 'translateX(-50%)',
              }}
            >
              <Waveform active={activeIntents.length > 0} bars={18} color="#006c4a" />
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
