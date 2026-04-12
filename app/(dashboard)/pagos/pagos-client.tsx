'use client'

import { useState } from 'react'
import { Check, Zap, Crown, Building2, CreditCard, Clock, CheckCircle2, XCircle, Sparkles } from 'lucide-react'
import { PLANES } from '@/lib/constants'
import type { Suscripcion, Pago } from '@/lib/types/database'

interface PagosClientProps {
  suscripcion: Suscripcion | null
  pagos: Pago[]
  empresaId: string
}

const PLAN_ICONS = { starter: Zap, pro: Crown, enterprise: Building2 }
const PLAN_ORDER = ['starter', 'pro', 'enterprise'] as const

export function PagosClient({ suscripcion, pagos, empresaId }: PagosClientProps) {
  const [paying, setPaying] = useState(false)
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null)

  const currentPlan = suscripcion?.plan || 'starter'
  const isActive = suscripcion?.estado === 'activa'

  async function handleSubscribe(plan: string) {
    setSelectedPlan(plan)
    setPaying(true)
    try {
      const res = await fetch('/api/pagos/crear-transaccion', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ plan, empresa_id: empresaId }),
      })
      const { checkout_url } = await res.json()
      if (checkout_url) window.location.href = checkout_url
    } catch (e) {
      console.error(e)
    } finally {
      setPaying(false)
    }
  }

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      {/* Eyebrow + title */}
      <div className="flex items-start justify-between">
        <div>
          <p className="text-[11px] font-bold uppercase tracking-[0.15em] text-authority-green mb-1">FACTURACIÓN</p>
          <h1 className="text-3xl font-bold tracking-tight text-on-surface">Pagos & Suscripción</h1>
        </div>
        {isActive && (
          <span className="flex items-center gap-1.5 text-sm text-brand-teal bg-brand-teal/10 px-3 py-1.5 rounded-full font-semibold">
            <CheckCircle2 className="w-4 h-4" />Plan activo
          </span>
        )}
      </div>

      {/* Current subscription */}
      {suscripcion && (
        <div className="bg-authority-green text-white rounded-xl p-6 flex items-center justify-between">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-widest text-white/50 mb-1">PLAN ACTUAL</p>
            <p className="text-xl font-bold capitalize">{suscripcion.plan}</p>
            <p className="text-sm text-white/60 mt-1">
              {suscripcion.fecha_fin
                ? `Vence: ${new Date(suscripcion.fecha_fin).toLocaleDateString('es-CO', { day: 'numeric', month: 'long', year: 'numeric' })}`
                : 'Sin fecha de vencimiento'}
            </p>
          </div>
          <div className="text-right">
            <p className="text-4xl font-bold">
              ${(PLANES[currentPlan as keyof typeof PLANES]?.precio || 0).toLocaleString('es-CO')}
            </p>
            <p className="text-sm text-white/50 mt-0.5">COP / mes</p>
          </div>
        </div>
      )}

      {/* Plan cards */}
      <div>
        <p className="text-[10px] font-bold uppercase tracking-widest text-on-surface/40 mb-4">PLANES DISPONIBLES</p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {PLAN_ORDER.map(planKey => {
            const plan = PLANES[planKey]
            const Icon = PLAN_ICONS[planKey]
            const isCurrent = currentPlan === planKey
            const isPro = planKey === 'pro'

            return (
              <div
                key={planKey}
                className={`relative bg-surface-container-lowest rounded-2xl p-5 transition-all ${isCurrent ? 'shadow-glow-subtle ring-2 ring-brand-teal' : isPro ? 'shadow-editorial ring-1 ring-brand-teal/20' : 'shadow-editorial'}`}
              >
                {isPro && !isCurrent && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-brand-teal text-white text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-wide">
                    Recomendado
                  </div>
                )}
                {isCurrent && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-authority-green text-white text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-wide">
                    Plan actual
                  </div>
                )}

                <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-4 ${isPro ? 'bg-brand-teal text-white' : 'bg-surface-container text-on-surface/50'}`}>
                  <Icon className="w-5 h-5" />
                </div>

                <h3 className="text-base font-bold text-on-surface">{plan.nombre}</h3>
                <div className="flex items-baseline gap-1 mt-1 mb-4">
                  <span className="text-2xl font-bold text-authority-green">${plan.precio.toLocaleString('es-CO')}</span>
                  <span className="text-xs text-on-surface/40">COP/mes</span>
                </div>

                <ul className="space-y-2 mb-5">
                  {plan.features.map(f => (
                    <li key={f} className="flex items-start gap-2 text-xs text-on-surface/60">
                      <Check className="w-3.5 h-3.5 text-brand-teal flex-shrink-0 mt-0.5" />
                      {f}
                    </li>
                  ))}
                </ul>

                <button
                  onClick={() => handleSubscribe(planKey)}
                  disabled={isCurrent || (paying && selectedPlan === planKey)}
                  className={`w-full py-2.5 rounded-xl text-sm font-semibold transition-all disabled:opacity-50 ${
                    isCurrent
                      ? 'bg-surface-container text-on-surface/40 cursor-default'
                      : isPro
                      ? 'bg-authority-green text-white hover:bg-authority-green/90'
                      : 'bg-on-surface text-white hover:bg-on-surface/90'
                  }`}
                >
                  {isCurrent ? 'Plan actual' : paying && selectedPlan === planKey ? 'Redirigiendo...' : 'Suscribirse'}
                </button>
              </div>
            )
          })}
        </div>
      </div>

      {/* Billing history */}
      <div>
        <p className="text-[10px] font-bold uppercase tracking-widest text-on-surface/40 mb-4">HISTORIAL DE PAGOS</p>
        {pagos.length === 0 ? (
          <div className="bg-surface-container-lowest rounded-xl p-10 text-center shadow-editorial">
            <div className="w-10 h-10 rounded-xl bg-surface-container flex items-center justify-center mx-auto mb-3">
              <CreditCard className="w-5 h-5 text-on-surface/30" />
            </div>
            <p className="text-sm text-on-surface/50">Sin pagos registrados</p>
          </div>
        ) : (
          <div className="bg-surface-container-lowest rounded-xl overflow-hidden shadow-editorial">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-surface-container">
                    {['Fecha', 'Plan', 'Referencia', 'Monto', 'Estado'].map(h => (
                      <th key={h} className="px-4 py-3 text-left text-[10px] font-bold uppercase tracking-widest text-on-surface/40 last:text-center">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {pagos.map((pago, i) => (
                    <tr key={pago.id} className={`hover:bg-surface-container-low transition-colors ${i > 0 ? 'border-t border-outline-variant/10' : ''}`}>
                      <td className="px-4 py-3 text-xs text-on-surface/50">
                        {new Date(pago.created_at).toLocaleDateString('es-CO', { day: 'numeric', month: 'short', year: 'numeric' })}
                      </td>
                      <td className="px-4 py-3 font-semibold text-on-surface capitalize">{(pago.metadata as any)?.plan || '—'}</td>
                      <td className="px-4 py-3 text-on-surface/50 font-mono text-xs">{pago.wompi_reference || '—'}</td>
                      <td className="px-4 py-3 font-bold text-authority-green">
                        ${(pago.monto / 100).toLocaleString('es-CO')}
                      </td>
                      <td className="px-4 py-3 text-center">
                        <span className={`inline-flex items-center gap-1 text-xs px-2.5 py-1 rounded-full font-semibold ${
                          pago.estado === 'aprobado' ? 'bg-brand-teal/10 text-brand-teal' :
                          pago.estado === 'pendiente' ? 'bg-amber-50 text-amber-600' :
                          'bg-red-50 text-red-600'
                        }`}>
                          {pago.estado === 'aprobado' ? <CheckCircle2 className="w-3 h-3" /> :
                           pago.estado === 'pendiente' ? <Clock className="w-3 h-3" /> :
                           <XCircle className="w-3 h-3" />}
                          {pago.estado}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* EMA tip */}
      <div className="bg-surface-container-low rounded-xl p-5">
        <div className="flex items-center gap-2 mb-1.5">
          <Sparkles className="w-3.5 h-3.5 text-brand-teal" />
          <span className="text-[10px] font-bold uppercase tracking-widest text-brand-teal">PERSPECTIVA DE EMA</span>
        </div>
        <p className="text-xs text-on-surface/60 italic leading-relaxed">
          El plan Pro tiene el mejor ROI para agencias de 3-15 agentes. EMA gestiona en promedio
          340 conversaciones mensuales por cuenta Pro.
        </p>
      </div>
    </div>
  )
}
