'use client'

import { useState } from 'react'
import { Check, Zap, Crown, Building2, CreditCard, Clock, CheckCircle2, XCircle } from 'lucide-react'
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
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-medium text-[#1a1a1a]">Pagos & Suscripción</h1>
        {isActive && (
          <span className="flex items-center gap-1.5 text-sm text-[#40d99d] bg-[#40d99d]/10 px-3 py-1.5 rounded-full font-medium">
            <CheckCircle2 className="w-4 h-4" />Plan activo
          </span>
        )}
      </div>

      {/* Current subscription banner */}
      {suscripcion && (
        <div className="bg-white border border-[#e5e5e5] rounded-xl p-5 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs text-[#6b7280] mb-0.5">Plan actual</p>
            <p className="text-lg font-medium text-[#1a1a1a] capitalize">{suscripcion.plan}</p>
            <p className="text-xs text-[#6b7280] mt-1">
              {suscripcion.fecha_fin
                ? `Vence: ${new Date(suscripcion.fecha_fin).toLocaleDateString('es-CO', { day: 'numeric', month: 'long', year: 'numeric' })}`
                : 'Sin fecha de vencimiento'}
            </p>
          </div>
          <div className="text-right">
            <p className="text-2xl font-medium text-[#1a1a1a]">
              ${(PLANES[currentPlan as keyof typeof PLANES]?.precio || 0).toLocaleString('es-CO')}
            </p>
            <p className="text-xs text-[#6b7280]">COP / mes</p>
          </div>
        </div>
      )}

      {/* Plan cards */}
      <div>
        <h2 className="text-sm font-medium text-[#6b7280] mb-4 uppercase tracking-wide">Planes disponibles</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {PLAN_ORDER.map(planKey => {
            const plan = PLANES[planKey]
            const Icon = PLAN_ICONS[planKey]
            const isCurrent = currentPlan === planKey
            const isPro = planKey === 'pro'

            return (
              <div key={planKey} className={`relative bg-white border rounded-2xl p-5 shadow-sm transition-all ${isCurrent ? 'border-[#40d99d] ring-1 ring-[#40d99d]' : isPro ? 'border-[#40d99d]/30' : 'border-[#e5e5e5]'}`}>
                {isPro && !isCurrent && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-[#40d99d] text-white text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-wide">
                    Recomendado
                  </div>
                )}
                {isCurrent && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-[#1a1a1a] text-white text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-wide">
                    Plan actual
                  </div>
                )}

                <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-4 ${isPro ? 'bg-[#40d99d] text-white' : 'bg-[#f0f0f0] text-[#6b7280]'}`}>
                  <Icon className="w-5 h-5" />
                </div>

                <h3 className="text-lg font-medium text-[#1a1a1a]">{plan.nombre}</h3>
                <div className="flex items-baseline gap-1 mt-1 mb-4">
                  <span className="text-2xl font-semibold text-[#1a1a1a]">${plan.precio.toLocaleString('es-CO')}</span>
                  <span className="text-xs text-[#6b7280]">COP/mes</span>
                </div>

                <ul className="space-y-2 mb-5">
                  {plan.features.map(f => (
                    <li key={f} className="flex items-start gap-2 text-xs text-[#6b7280]">
                      <Check className="w-3.5 h-3.5 text-[#40d99d] flex-shrink-0 mt-0.5" />
                      {f}
                    </li>
                  ))}
                </ul>

                <button
                  onClick={() => handleSubscribe(planKey)}
                  disabled={isCurrent || (paying && selectedPlan === planKey)}
                  className={`w-full py-2.5 rounded-xl text-sm font-medium transition-all ${
                    isCurrent
                      ? 'bg-[#f0f0f0] text-[#6b7280] cursor-default'
                      : isPro
                      ? 'bg-[#40d99d] text-white hover:bg-[#40d99d]/90'
                      : 'bg-[#1a1a1a] text-white hover:bg-[#1a1a1a]/90'
                  } disabled:opacity-50`}
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
        <h2 className="text-sm font-medium text-[#6b7280] mb-4 uppercase tracking-wide">Historial de pagos</h2>
        {pagos.length === 0 ? (
          <div className="bg-white border border-[#e5e5e5] rounded-xl p-8 text-center">
            <CreditCard className="w-8 h-8 text-[#e5e5e5] mx-auto mb-2" />
            <p className="text-sm text-[#6b7280]">Sin pagos registrados</p>
          </div>
        ) : (
          <div className="bg-white border border-[#e5e5e5] rounded-xl overflow-hidden shadow-sm">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-[#e5e5e5] bg-[#f8f8f8]">
                  <th className="text-left px-4 py-3 text-xs font-medium text-[#6b7280]">Fecha</th>
                  <th className="text-left px-4 py-3 text-xs font-medium text-[#6b7280]">Plan</th>
                  <th className="text-left px-4 py-3 text-xs font-medium text-[#6b7280]">Referencia</th>
                  <th className="text-right px-4 py-3 text-xs font-medium text-[#6b7280]">Monto</th>
                  <th className="text-center px-4 py-3 text-xs font-medium text-[#6b7280]">Estado</th>
                </tr>
              </thead>
              <tbody>
                {pagos.map(pago => (
                  <tr key={pago.id} className="border-b border-[#f0f0f0] last:border-0 hover:bg-[#f8f8f8] transition-colors">
                    <td className="px-4 py-3 text-[#6b7280]">
                      {new Date(pago.created_at).toLocaleDateString('es-CO', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </td>
                    <td className="px-4 py-3 font-medium text-[#1a1a1a] capitalize">{(pago.metadata as any)?.plan || '—'}</td>
                    <td className="px-4 py-3 text-[#6b7280] font-mono text-xs">{pago.wompi_reference || '—'}</td>
                    <td className="px-4 py-3 text-right font-medium text-[#1a1a1a]">
                      ${(pago.monto / 100).toLocaleString('es-CO')}
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span className={`inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full font-medium ${
                        pago.estado === 'aprobado' ? 'bg-[#40d99d]/10 text-[#40d99d]' :
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
        )}
      </div>
    </div>
  )
}
