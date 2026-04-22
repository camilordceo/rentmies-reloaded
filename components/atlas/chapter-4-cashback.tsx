'use client'
import { useAtlasStore, fmtCOP } from '@/store/atlas-store'

const TICKER_ITEMS = [
  { name: 'María José P.', amount: 4_500_000, location: 'Usaquén, Bogotá', type: 'Venta' },
  { name: 'Andrés L.', amount: 250_000, location: 'Laureles, Medellín', type: 'Arriendo' },
  { name: 'Catalina V.', amount: 8_900_000, location: 'El Poblado', type: 'Venta' },
  { name: 'Tomás R.', amount: 580_000, location: 'Chapinero, Bogotá', type: 'Arriendo' },
  { name: 'Isidora M.', amount: 6_200_000, location: 'Ciudad del Río', type: 'Venta' },
  { name: 'Benjamín S.', amount: 320_000, location: 'Bellavista, Cali', type: 'Arriendo' },
]

export function Chapter4Cashback() {
  const { calcPrice, calcType, setCalcPrice, setCalcType, openEmaPanel } = useAtlasStore((s) => ({
    calcPrice: s.calcPrice,
    calcType: s.calcType,
    setCalcPrice: s.setCalcPrice,
    setCalcType: s.setCalcType,
    openEmaPanel: s.openEmaPanel,
  }))

  const rate = calcType === 'Arriendo' ? 0.10 : 0.01
  const cashback = Math.round(calcPrice * rate)
  const totalPaid = TICKER_ITEMS.reduce((s, t) => s + t.amount, 0)

  return (
    <section
      className="atlas-chapter"
      style={{
        position: 'relative',
        overflow: 'hidden',
        background: 'linear-gradient(135deg, #004d35 0%, #006c4a 60%, #40d99d 160%)',
        color: '#fff',
        padding: '100px 120px 72px 180px',
      }}
    >
      {/* Radial glow */}
      <div
        style={{
          position: 'absolute',
          top: '-20%',
          right: '-10%',
          width: '65%',
          height: '70%',
          background: 'radial-gradient(circle, rgba(79,255,180,0.18), transparent 60%)',
          pointerEvents: 'none',
        }}
      />

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '1.1fr 1fr',
          gap: 72,
          height: '100%',
          alignItems: 'center',
          position: 'relative',
        }}
      >
        {/* Left: headline + ticker */}
        <div>
          <div className="atlas-eyebrow" style={{ color: '#4fffb4', marginBottom: 20 }}>
            Capítulo 04 · Tu parte del trato
          </div>
          <h2
            className="atlas-display"
            style={{ fontSize: 'clamp(42px, 5.5vw, 80px)', margin: 0, marginBottom: 24 }}
          >
            1% vuelve a ti<br />
            al cerrar la venta.<br />
            <span style={{ color: '#4fffb4' }}>10% en arriendo</span><br />
            al primer pago.
          </h2>
          <p
            style={{
              fontSize: 15,
              lineHeight: 1.65,
              maxWidth: 500,
              color: 'rgba(255,255,255,0.82)',
              marginBottom: 28,
            }}
          >
            Cobramos 1.5% de comisión al vendedor y te devolvemos 1% al cerrar.
            En arriendo, cobramos 20% y te devolvemos 10% con el primer pago.
            Sin letra chica.
          </p>

          {/* Ticker */}
          <div
            style={{
              background: 'rgba(0,0,0,0.22)',
              borderRadius: 14,
              padding: '18px 0',
              overflow: 'hidden',
              border: '1px solid rgba(255,255,255,0.08)',
            }}
          >
            <div
              className="atlas-mono atlas-eyebrow"
              style={{ color: '#4fffb4', padding: '0 18px', marginBottom: 10, fontSize: 8 }}
            >
              ✦ Cashback pagado esta semana · +{fmtCOP(totalPaid)}
            </div>
            <div style={{ overflow: 'hidden' }}>
              <div className="atlas-marquee">
                {[...TICKER_ITEMS, ...TICKER_ITEMS, ...TICKER_ITEMS].map((t, i) => (
                  <div
                    key={i}
                    style={{ display: 'inline-flex', alignItems: 'center', gap: 12, fontSize: 12, color: 'rgba(255,255,255,0.85)' }}
                  >
                    <span style={{ width: 5, height: 5, borderRadius: '50%', background: '#4fffb4', flexShrink: 0 }} />
                    <span style={{ fontWeight: 600 }}>{t.name}</span>
                    <span style={{ opacity: 0.6 }}>{t.location}</span>
                    <span style={{ color: '#4fffb4', fontWeight: 700 }}>+{fmtCOP(t.amount)}</span>
                    <span className="atlas-mono" style={{ fontSize: 9, opacity: 0.5, letterSpacing: '0.1em' }}>
                      {t.type.toUpperCase()}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Right: calculator */}
        <div
          style={{
            background: 'rgba(255,255,255,0.07)',
            backdropFilter: 'blur(24px)',
            borderRadius: 22,
            padding: 32,
            border: '1px solid rgba(255,255,255,0.10)',
          }}
        >
          <div className="atlas-eyebrow" style={{ color: '#4fffb4', marginBottom: 8 }}>
            Calculadora en vivo
          </div>
          <div style={{ fontSize: 22, fontWeight: 700, letterSpacing: '-0.02em', marginBottom: 24 }}>
            Ve cuánto vuelve a ti.
          </div>

          {/* Type toggle */}
          <div style={{ display: 'flex', gap: 8, marginBottom: 22 }}>
            {(['Venta', 'Arriendo'] as const).map((t) => (
              <button
                key={t}
                onClick={() => setCalcType(t)}
                style={{
                  flex: 1,
                  border: 'none',
                  padding: '11px',
                  borderRadius: 10,
                  cursor: 'pointer',
                  background: calcType === t ? '#40d99d' : 'rgba(255,255,255,0.08)',
                  color: calcType === t ? '#004d35' : '#fff',
                  fontSize: 13,
                  fontWeight: 600,
                  transition: 'all .3s',
                }}
              >
                {t}
              </button>
            ))}
          </div>

          <div className="atlas-mono atlas-eyebrow" style={{ color: 'rgba(255,255,255,0.6)', marginBottom: 8, fontSize: 8 }}>
            {calcType === 'Venta' ? 'Precio de la propiedad' : 'Canon mensual'}
          </div>
          <input
            type="range"
            min={calcType === 'Venta' ? 100_000_000 : 800_000}
            max={calcType === 'Venta' ? 3_000_000_000 : 8_000_000}
            step={calcType === 'Venta' ? 10_000_000 : 50_000}
            value={calcPrice}
            onChange={(e) => setCalcPrice(Number(e.target.value))}
            style={{ width: '100%', accentColor: '#4fffb4', marginBottom: 8 }}
          />
          <div style={{ fontSize: 24, fontWeight: 700, color: '#fff', marginBottom: 6 }}>
            {fmtCOP(calcPrice)}
            {calcType === 'Arriendo' ? '/mes' : ''}
          </div>

          <div style={{ height: 1, background: 'rgba(255,255,255,0.1)', margin: '22px 0' }} />

          <div className="atlas-mono atlas-eyebrow" style={{ color: '#4fffb4', marginBottom: 8, fontSize: 8 }}>
            Tu cashback
          </div>
          <div
            style={{
              fontSize: 'clamp(44px, 5.5vw, 68px)',
              fontWeight: 800,
              letterSpacing: '-0.04em',
              lineHeight: 1,
              color: '#4fffb4',
              textShadow: '0 0 28px rgba(79,255,180,0.4)',
            }}
          >
            {fmtCOP(cashback)}
          </div>
          <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.7)', marginTop: 8 }}>
            {calcType === 'Venta'
              ? 'Al cerrar la venta · 1% del precio'
              : 'Al primer pago · 10% del canon'}
          </div>

          <button
            onClick={openEmaPanel}
            style={{
              width: '100%',
              marginTop: 24,
              background: '#4fffb4',
              color: '#004d35',
              border: 'none',
              padding: '15px',
              borderRadius: 12,
              fontSize: 13,
              fontWeight: 700,
              cursor: 'pointer',
              letterSpacing: '0.02em',
            }}
          >
            Hablar con EMA sobre este cashback →
          </button>
        </div>
      </div>
    </section>
  )
}
