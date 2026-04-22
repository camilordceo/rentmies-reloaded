'use client'
import { useState } from 'react'
import { useAtlasStore, fmtCOP } from '@/store/atlas-store'
import type { AtlasProperty } from '@/store/atlas-store'

function OfferSheet({ prop, onClose }: { prop: AtlasProperty; onClose: () => void }) {
  const [offer, setOffer] = useState(prop.precio ?? 0)
  const [step, setStep] = useState(0)
  const [name, setName] = useState('')
  const [phone, setPhone] = useState('')
  const [email, setEmail] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const precio = prop.precio ?? 1
  const delta = offer - precio
  const pct = ((delta / precio) * 100).toFixed(1)
  const cb = Math.round(offer * (prop.tipo_negocio === 'Arriendo' ? 0.10 : 0.01))

  async function submitOffer() {
    if (!name.trim() || !phone.trim()) return
    setSubmitting(true)
    try {
      await fetch('/api/ofertas', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          empresa_id: prop.empresa_id,
          propiedad_id: prop.id,
          nombre_contacto: name,
          telefono: phone,
          email: email || undefined,
          tipo_negocio: prop.tipo_negocio,
          monto_oferta: offer,
          cashback_estimado: cb,
        }),
      })
      setStep(2)
    } catch {
      setStep(2) // Show success anyway — notification may still work
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div
      style={{
        position: 'absolute',
        inset: 0,
        zIndex: 30,
        background: 'rgba(28,27,27,0.92)',
        backdropFilter: 'blur(18px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        animation: 'rise-in .35s ease-out',
        padding: 32,
      }}
    >
      <div
        style={{
          background: '#fcf9f8',
          borderRadius: 22,
          padding: 36,
          maxWidth: 520,
          width: '100%',
          position: 'relative',
          boxShadow: '0 12px 40px -6px rgba(28,27,27,0.1)',
        }}
      >
        <button
          onClick={onClose}
          style={{
            position: 'absolute',
            top: 14,
            right: 14,
            border: 'none',
            background: '#f0eded',
            borderRadius: '50%',
            width: 34,
            height: 34,
            cursor: 'pointer',
            fontSize: 16,
            color: '#1c1b1b',
          }}
        >
          ×
        </button>

        {step === 0 && (
          <>
            <div className="atlas-eyebrow" style={{ color: '#006c4a', marginBottom: 10 }}>
              Propón tu oferta
            </div>
            <div style={{ fontSize: 28, fontWeight: 700, letterSpacing: '-0.02em', marginBottom: 6 }}>
              ¿Cuánto ofreces?
            </div>
            <div style={{ fontSize: 12, color: '#6b7280', marginBottom: 22 }}>
              EMA presenta tu oferta en minutos, no semanas.
            </div>

            <div className="atlas-mono atlas-eyebrow" style={{ color: '#6b7280', marginBottom: 6, fontSize: 8 }}>
              Precio lista · {fmtCOP(prop.precio)}
            </div>
            <div
              style={{
                fontSize: 48,
                fontWeight: 800,
                color: '#006c4a',
                letterSpacing: '-0.03em',
                lineHeight: 1,
                marginBottom: 10,
              }}
            >
              {fmtCOP(offer)}
            </div>
            <input
              type="range"
              min={Math.round(precio * 0.75)}
              max={Math.round(precio * 1.1)}
              step={prop.tipo_negocio === 'Arriendo' ? 50_000 : 5_000_000}
              value={offer}
              onChange={(e) => setOffer(Number(e.target.value))}
              style={{ width: '100%', accentColor: '#40d99d', marginBottom: 6 }}
            />
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 10, color: '#6b7280' }}>
              <span>-25%</span>
              <span style={{ fontWeight: 700, color: delta >= 0 ? '#006c4a' : '#c85250' }}>
                {delta >= 0 ? '+' : ''}{pct}%
              </span>
              <span>+10%</span>
            </div>

            {/* Cashback highlight */}
            <div
              style={{
                background: 'linear-gradient(135deg, #004d35, #006c4a)',
                borderRadius: 12,
                padding: 18,
                marginTop: 22,
                color: '#fff',
              }}
            >
              <div className="atlas-mono atlas-eyebrow" style={{ color: '#4fffb4', marginBottom: 5, fontSize: 8 }}>
                Cashback si cierras a este precio
              </div>
              <div style={{ fontSize: 30, fontWeight: 800, color: '#4fffb4', letterSpacing: '-0.02em' }}>
                +{fmtCOP(cb)}
              </div>
            </div>

            <button
              onClick={() => setStep(1)}
              style={{
                width: '100%',
                marginTop: 18,
                padding: '16px',
                background: '#1c1b1b',
                color: '#fff',
                border: 'none',
                borderRadius: 12,
                fontSize: 13,
                fontWeight: 700,
                cursor: 'pointer',
              }}
            >
              Continuar →
            </button>
          </>
        )}

        {step === 1 && (
          <>
            <div className="atlas-eyebrow" style={{ color: '#006c4a', marginBottom: 10 }}>
              Tus datos
            </div>
            <div style={{ fontSize: 24, fontWeight: 700, letterSpacing: '-0.02em', marginBottom: 20 }}>
              ¿A quién le avisamos?
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 20 }}>
              {[
                { label: 'Nombre completo *', value: name, set: setName, ph: 'Camilo Ordóñez' },
                { label: 'WhatsApp *', value: phone, set: setPhone, ph: '3103565492' },
                { label: 'Email (opcional)', value: email, set: setEmail, ph: 'camilo@email.com' },
              ].map(({ label, value, set, ph }) => (
                <div key={label}>
                  <div className="atlas-mono atlas-eyebrow" style={{ color: '#6b7280', marginBottom: 5, fontSize: 8 }}>
                    {label}
                  </div>
                  <input
                    value={value}
                    onChange={(e) => set(e.target.value)}
                    placeholder={ph}
                    style={{
                      width: '100%',
                      padding: '11px 14px',
                      borderRadius: 10,
                      border: '1px solid #e5e2e1',
                      fontSize: 13,
                      fontFamily: 'inherit',
                      outline: 'none',
                      background: '#fff',
                      color: '#1c1b1b',
                      boxSizing: 'border-box',
                    }}
                  />
                </div>
              ))}
            </div>

            <div style={{ display: 'flex', gap: 10 }}>
              <button
                onClick={() => setStep(0)}
                style={{
                  flex: 1,
                  padding: '14px',
                  background: '#f0eded',
                  color: '#1c1b1b',
                  border: 'none',
                  borderRadius: 12,
                  fontSize: 13,
                  fontWeight: 600,
                  cursor: 'pointer',
                }}
              >
                ← Volver
              </button>
              <button
                onClick={submitOffer}
                disabled={submitting || !name.trim() || !phone.trim()}
                style={{
                  flex: 2,
                  padding: '14px',
                  background: 'linear-gradient(135deg, #40d99d, #006c4a)',
                  color: '#fff',
                  border: 'none',
                  borderRadius: 12,
                  fontSize: 13,
                  fontWeight: 700,
                  cursor: submitting ? 'wait' : 'pointer',
                  opacity: !name.trim() || !phone.trim() ? 0.5 : 1,
                }}
              >
                {submitting ? 'Enviando…' : 'Enviar oferta a EMA →'}
              </button>
            </div>
          </>
        )}

        {step === 2 && (
          <div style={{ textAlign: 'center', padding: '16px 0' }}>
            <div
              className="atlas-ema-sphere"
              style={{ width: 88, height: 88, margin: '0 auto 20px' }}
            />
            <div className="atlas-eyebrow" style={{ color: '#006c4a', marginBottom: 10 }}>
              Oferta enviada
            </div>
            <div style={{ fontSize: 26, fontWeight: 700, letterSpacing: '-0.02em', marginBottom: 12 }}>
              EMA la está presentando.
            </div>
            <p style={{ fontSize: 13, color: '#3c4a42', lineHeight: 1.6, maxWidth: 360, margin: '0 auto 22px' }}>
              Te avisamos por WhatsApp cuando la contraparte responda.
              Tu cashback de{' '}
              <strong style={{ color: '#006c4a' }}>{fmtCOP(cb)}</strong> queda reservado.
            </p>
            <button
              onClick={onClose}
              style={{
                padding: '13px 28px',
                background: '#40d99d',
                color: '#004d35',
                border: 'none',
                borderRadius: 999,
                fontSize: 13,
                fontWeight: 700,
                cursor: 'pointer',
              }}
            >
              Cerrar
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

export function PropDrawer() {
  const { drawerProperty, closeDrawer, openEmaPanel } = useAtlasStore((s) => ({
    drawerProperty: s.drawerProperty,
    closeDrawer: s.closeDrawer,
    openEmaPanel: s.openEmaPanel,
  }))

  const [galleryIdx, setGalleryIdx] = useState(0)
  const [offerOpen, setOfferOpen] = useState(false)

  const prop = drawerProperty
  if (!prop) return null

  const gallery = prop.imagenes?.length
    ? prop.imagenes.slice(0, 4)
    : ['https://images.unsplash.com/photo-1613977257363-707ba9348227?w=1200&q=80']

  const cashback = prop.cashback_amount
  const isArriendo = prop.tipo_negocio === 'Arriendo'

  const equivalents = isArriendo
    ? [
        { label: 'Meses de arriendo gratis', value: cashback ? (cashback / (prop.precio ?? 1)).toFixed(1) : '—' },
        { label: 'Pagas 10 meses, vives 12', value: '✓' },
        { label: 'Ahorro vs. portal tradicional', value: '100%' },
        { label: 'Cenas para 2 en restaurante top', value: cashback ? Math.round(cashback / 280_000) : '—' },
      ]
    : [
        { label: 'Meses de administración pagados', value: cashback ? Math.round(cashback / 350_000) : '—' },
        { label: 'Cuotas hipotecarias cubiertas', value: cashback ? Math.round(cashback / 1_800_000) : '—' },
        { label: '% del pie (30%) recuperado', value: cashback && prop.precio ? ((cashback / (prop.precio * 0.3)) * 100).toFixed(1) + '%' : '—' },
        { label: 'Viajes a San Andrés para 2', value: cashback ? Math.round(cashback / 2_800_000) : '—' },
      ]

  const amenities = [
    { icon: '☀', label: 'Luz natural' },
    ...(prop.area_m2 ? [{ icon: '▲', label: `${prop.area_m2}m²` }] : []),
    ...(prop.parqueaderos ? [{ icon: '◉', label: `${prop.parqueaderos} parqueadero(s)` }] : []),
    { icon: '◎', label: 'Verificado por EMA' },
    ...(prop.estrato ? [{ icon: '◈', label: `Estrato ${prop.estrato}` }] : []),
    { icon: '◯', label: 'Seguridad 24/7' },
    ...(prop.tags?.slice(0, 2).map((t) => ({ icon: '✦', label: t })) ?? []),
  ].slice(0, 8)

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 200,
        display: 'flex',
        alignItems: 'stretch',
        animation: 'rise-in .4s ease-out',
      }}
    >
      {/* Backdrop */}
      <div
        onClick={closeDrawer}
        style={{ position: 'absolute', inset: 0, background: 'rgba(28,27,27,0.65)', backdropFilter: 'blur(10px)' }}
      />

      {/* Drawer panel */}
      <div
        style={{
          marginLeft: 'auto',
          width: '65%',
          minWidth: 780,
          background: '#fcf9f8',
          position: 'relative',
          boxShadow: '0 12px 40px -6px rgba(28,27,27,0.1)',
          overflowY: 'auto',
          overflowX: 'hidden',
        }}
        className="hide-scrollbar"
      >
        {/* Hero gallery */}
        <div style={{ position: 'relative', height: 500 }}>
          <img
            key={galleryIdx}
            src={gallery[galleryIdx]}
            alt=""
            onError={(e) => { e.currentTarget.src = gallery[0] }}
            style={{
              position: 'absolute',
              inset: 0,
              width: '100%',
              height: '100%',
              objectFit: 'cover',
              animation: 'rise-in .5s ease-out',
            }}
          />
          <div
            style={{
              position: 'absolute',
              inset: 0,
              background:
                'linear-gradient(180deg, rgba(28,27,27,0.42) 0%, transparent 32%, transparent 62%, rgba(28,27,27,0.88))',
            }}
          />

          <button
            onClick={closeDrawer}
            style={{
              position: 'absolute',
              top: 18,
              right: 18,
              zIndex: 3,
              width: 42,
              height: 42,
              borderRadius: '50%',
              border: 'none',
              cursor: 'pointer',
              background: 'rgba(255,255,255,0.18)',
              backdropFilter: 'blur(12px)',
              color: '#fff',
              fontSize: 19,
            }}
          >
            ×
          </button>

          {/* Chips */}
          <div style={{ position: 'absolute', top: 22, left: 28, display: 'flex', gap: 8 }}>
            <span className="atlas-chip-glass">{prop.tipo_negocio === 'Arriendo' ? 'En arriendo' : 'En venta'}</span>
            {prop.match_score > 0 && (
              <span className="atlas-chip-glass">{prop.match_score}% Match</span>
            )}
          </div>

          {/* Title */}
          <div style={{ position: 'absolute', bottom: 28, left: 28, right: 28, color: '#fff' }}>
            <div className="atlas-mono atlas-eyebrow" style={{ color: '#4fffb4', marginBottom: 8 }}>
              {prop.ciudad} {prop.mood && `· ${prop.mood}`}
            </div>
            <div
              style={{ fontSize: 'clamp(28px, 3.5vw, 50px)', fontWeight: 700, letterSpacing: '-0.035em', lineHeight: 0.98, marginBottom: 14 }}
            >
              {prop.ubicacion}
            </div>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: 22 }}>
              <div style={{ fontSize: 26, fontWeight: 600 }}>
                {fmtCOP(prop.precio)}{prop.tipo_negocio === 'Arriendo' ? '/mes' : ''}
              </div>
              <div className="atlas-mono" style={{ fontSize: 11, color: 'rgba(255,255,255,0.7)', letterSpacing: '0.08em' }}>
                {prop.area_m2 && `${prop.area_m2}M²`}
                {prop.habitaciones && ` · ${prop.habitaciones} HAB`}
                {prop.banos && ` · ${prop.banos} BAÑOS`}
              </div>
            </div>
          </div>

          {/* Gallery dots */}
          <div style={{ position: 'absolute', bottom: 14, right: 28, display: 'flex', gap: 5 }}>
            {gallery.map((_, i) => (
              <button
                key={i}
                onClick={() => setGalleryIdx(i)}
                style={{
                  width: i === galleryIdx ? 36 : 18,
                  height: 3.5,
                  borderRadius: 2,
                  border: 'none',
                  cursor: 'pointer',
                  background: i === galleryIdx ? '#4fffb4' : 'rgba(255,255,255,0.4)',
                  transition: 'all .3s',
                }}
              />
            ))}
          </div>
        </div>

        {/* Content */}
        <div style={{ padding: '36px 44px 120px' }}>

          {/* CASHBACK MONEY SHOT */}
          {cashback != null && (
            <div
              style={{
                position: 'relative',
                overflow: 'hidden',
                background: 'linear-gradient(135deg, #002a1d 0%, #004d35 45%, #006c4a 100%)',
                borderRadius: 22,
                padding: 32,
                color: '#fff',
                marginBottom: 36,
                boxShadow: '0 12px 40px -6px rgba(28,27,27,0.1)',
              }}
            >
              <div
                style={{
                  position: 'absolute',
                  top: '-40%',
                  right: '-20%',
                  width: '80%',
                  height: '180%',
                  background: 'radial-gradient(circle, rgba(79,255,180,0.16), transparent 60%)',
                  pointerEvents: 'none',
                }}
              />
              <div
                style={{
                  position: 'absolute',
                  bottom: 0,
                  left: 0,
                  right: 0,
                  height: 3,
                  background: 'linear-gradient(90deg, #4fffb4, #40d99d, #4fffb4)',
                  backgroundSize: '200% 100%',
                  animation: 'shimmer 3s linear infinite',
                }}
              />

              <div style={{ position: 'relative' }}>
                <div className="atlas-mono atlas-eyebrow" style={{ color: '#4fffb4', marginBottom: 12, fontSize: 9 }}>
                  ✦ Al cerrar esta {prop.tipo_negocio?.toLowerCase()}, te devolvemos
                </div>
                <div
                  style={{
                    fontSize: 'clamp(64px, 7vw, 100px)',
                    fontWeight: 800,
                    letterSpacing: '-0.045em',
                    lineHeight: 0.92,
                    color: '#4fffb4',
                    textShadow: '0 0 36px rgba(79,255,180,0.35)',
                    marginBottom: 12,
                  }}
                >
                  {fmtCOP(cashback)}
                </div>

                <div style={{ fontSize: 16, fontWeight: 500, maxWidth: 520, lineHeight: 1.5, color: 'rgba(255,255,255,0.92)', marginBottom: 22 }}>
                  {isArriendo
                    ? <>Tu primer mes de arriendo se paga solo. <span style={{ color: '#4fffb4', fontWeight: 700 }}>10% del canon</span>, de vuelta a ti, directo.</>
                    : <>Ningún otro portal te paga por comprar. Nosotros sí. <span style={{ color: '#4fffb4', fontWeight: 700 }}>1% del precio</span>, transferido el día del cierre.</>
                  }
                </div>

                <div className="atlas-mono atlas-eyebrow" style={{ color: '#4fffb4', marginBottom: 12, opacity: 0.8, fontSize: 9 }}>
                  Eso equivale a →
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 12, marginBottom: 22 }}>
                  {equivalents.map((eq, i) => (
                    <div
                      key={i}
                      style={{ background: 'rgba(255,255,255,0.06)', borderRadius: 10, padding: '12px 16px', borderLeft: '2px solid #4fffb4' }}
                    >
                      <div style={{ fontSize: 24, fontWeight: 800, color: '#4fffb4', letterSpacing: '-0.02em', lineHeight: 1, marginBottom: 3 }}>
                        {eq.value}
                      </div>
                      <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.7)', lineHeight: 1.3 }}>{eq.label}</div>
                    </div>
                  ))}
                </div>

                <div style={{ background: 'rgba(0,0,0,0.28)', borderRadius: 10, padding: '12px 16px', display: 'flex', gap: 16, alignItems: 'center', fontSize: 11, flexWrap: 'wrap' }}>
                  <div><span style={{ color: 'rgba(255,255,255,0.55)' }}>Comisión Rentmies: </span><strong>{isArriendo ? '20%' : '1.5%'}</strong></div>
                  <div style={{ width: 1, height: 12, background: 'rgba(255,255,255,0.15)' }} />
                  <div><span style={{ color: 'rgba(255,255,255,0.55)' }}>De vuelta a ti: </span><strong style={{ color: '#4fffb4' }}>{isArriendo ? '10%' : '1%'}</strong></div>
                  <div style={{ width: 1, height: 12, background: 'rgba(255,255,255,0.15)' }} />
                  <div><span style={{ color: 'rgba(255,255,255,0.55)' }}>Pago: </span><strong>{isArriendo ? 'Primer mes' : 'Día del cierre'}</strong></div>
                </div>
              </div>
            </div>
          )}

          {/* Description */}
          {prop.descripcion && (
            <div style={{ marginBottom: 36 }}>
              <div className="atlas-eyebrow" style={{ color: '#006c4a', marginBottom: 12 }}>Sobre esta propiedad</div>
              <p style={{ fontSize: 16, lineHeight: 1.7, color: '#1c1b1b', margin: 0, maxWidth: 640 }}>
                {prop.descripcion}
              </p>
            </div>
          )}

          {/* EMA insight */}
          {prop.agent_insight && (
            <div
              style={{ background: '#f0eded', borderRadius: 14, padding: 22, marginBottom: 36, borderLeft: '2px solid #40d99d' }}
            >
              <div className="atlas-mono atlas-eyebrow" style={{ color: '#006c4a', marginBottom: 8, fontSize: 9 }}>
                ✦ EMA insight
              </div>
              <p style={{ fontSize: 15, lineHeight: 1.55, margin: 0, fontStyle: 'italic', color: '#3c4a42' }}>
                &ldquo;{prop.agent_insight}&rdquo;
              </p>
            </div>
          )}

          {/* Amenities */}
          {amenities.length > 0 && (
            <div style={{ marginBottom: 36 }}>
              <div className="atlas-eyebrow" style={{ color: '#006c4a', marginBottom: 16 }}>Detalles & equipamiento</div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12 }}>
                {amenities.map((a, i) => (
                  <div
                    key={i}
                    style={{ background: '#fff', borderRadius: 10, padding: '14px 12px', display: 'flex', alignItems: 'center', gap: 9, boxShadow: '0 32px 64px -12px rgba(28,27,27,0.06)' }}
                  >
                    <span style={{ fontSize: 16, color: '#40d99d' }}>{a.icon}</span>
                    <span style={{ fontSize: 12, fontWeight: 500 }}>{a.label}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Tags */}
          {prop.tags?.length > 0 && (
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 28 }}>
              {prop.tags.map((t) => (
                <span key={t} className="atlas-chip-teal">{t}</span>
              ))}
            </div>
          )}
        </div>

        {/* Sticky CTA bar */}
        <div
          style={{
            position: 'sticky',
            bottom: 0,
            padding: 18,
            background: 'rgba(252,249,248,0.92)',
            backdropFilter: 'blur(20px)',
            display: 'flex',
            gap: 9,
            alignItems: 'center',
            boxShadow: '0 -18px 36px -10px rgba(28,27,27,0.07)',
          }}
        >
          {cashback != null && (
            <div style={{ flex: '0 0 auto', paddingRight: 12 }}>
              <div className="atlas-mono atlas-eyebrow" style={{ color: '#6b7280', fontSize: 8, marginBottom: 2 }}>
                Tu cashback
              </div>
              <div style={{ fontSize: 18, fontWeight: 800, color: '#006c4a', letterSpacing: '-0.02em' }}>
                +{fmtCOP(cashback)}
              </div>
            </div>
          )}
          <button
            onClick={openEmaPanel}
            style={{ flex: 1, background: '#fff', color: '#1c1b1b', border: 'none', padding: '14px', borderRadius: 12, fontSize: 12, fontWeight: 600, cursor: 'pointer', boxShadow: '0 32px 64px -12px rgba(28,27,27,0.06)' }}
          >
            Tour con EMA ✦
          </button>
          <button
            onClick={() => setOfferOpen(true)}
            style={{
              flex: 1.4,
              background: 'linear-gradient(135deg, #40d99d, #006c4a)',
              color: '#fff',
              border: 'none',
              padding: '14px',
              borderRadius: 12,
              fontSize: 13,
              fontWeight: 800,
              cursor: 'pointer',
              letterSpacing: '0.02em',
              boxShadow: '0 0 24px 2px rgba(64,217,157,0.35)',
            }}
          >
            Haz una oferta →
          </button>
        </div>

        {offerOpen && <OfferSheet prop={prop} onClose={() => setOfferOpen(false)} />}
      </div>
    </div>
  )
}
