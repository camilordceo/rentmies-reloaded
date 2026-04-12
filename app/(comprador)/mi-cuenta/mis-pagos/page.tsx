export const dynamic = 'force-dynamic'

import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { CreditCard, CheckCircle2, Clock, AlertCircle } from 'lucide-react'

const ESTADO_MAP: Record<string, { label: string; color: string; icon: typeof CreditCard }> = {
  pendiente:   { label: 'Pendiente',   color: 'bg-amber-50 text-amber-700',         icon: Clock },
  procesando:  { label: 'Procesando',  color: 'bg-blue-50 text-blue-700',           icon: Clock },
  pagado:      { label: 'Pagado',      color: 'bg-brand-teal/10 text-brand-teal',   icon: CheckCircle2 },
  fallido:     { label: 'Fallido',     color: 'bg-red-50 text-red-700',             icon: AlertCircle },
  reembolsado: { label: 'Reembolsado', color: 'bg-purple-50 text-purple-700',       icon: CheckCircle2 },
}

export default async function MisPagosPage() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase.from('profiles').select('rol').eq('id', user.id).single()
  if (profile?.rol !== 'comprador') redirect('/dashboard')

  const db = createAdminClient()
  const { data: comprador } = await db.from('compradores').select('id').eq('profile_id', user.id).single()
  if (!comprador) redirect('/mi-cuenta')

  const { data: pagos } = await db
    .from('pagos_comprador')
    .select('id, concepto, monto, moneda, estado, periodo_mes, descripcion, created_at, pagado_at, wompi_reference')
    .eq('comprador_id', comprador.id)
    .order('created_at', { ascending: false })

  const pendientes = pagos?.filter(p => p.estado === 'pendiente') ?? []
  const resto = pagos?.filter(p => p.estado !== 'pendiente') ?? []
  const totalPendiente = pendientes.reduce((acc, p) => acc + Number(p.monto), 0)

  const fmtCOP = (v: number) => v.toLocaleString('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 })

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Eyebrow + title */}
      <div>
        <p className="text-[11px] font-bold uppercase tracking-[0.15em] text-authority-green mb-1">FINANCIERO</p>
        <h1 className="text-3xl font-bold tracking-tight text-on-surface">Mis Pagos</h1>
        <p className="text-on-surface/50 text-sm mt-1">{pagos?.length ?? 0} registros</p>
      </div>

      {/* Alert: pagos pendientes */}
      {pendientes.length > 0 && (
        <div className="bg-red-50 rounded-xl p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-bold text-red-800">
                {pendientes.length} pago{pendientes.length > 1 ? 's' : ''} pendiente{pendientes.length > 1 ? 's' : ''}
              </p>
              <p className="text-xs text-red-600 mt-0.5 font-semibold">Total: {fmtCOP(totalPendiente)}</p>
            </div>
            <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0" />
          </div>
        </div>
      )}

      {!pagos?.length && (
        <div className="bg-surface-container-lowest rounded-xl p-12 text-center shadow-editorial">
          <div className="w-12 h-12 rounded-xl bg-surface-container flex items-center justify-center mx-auto mb-4">
            <CreditCard className="w-6 h-6 text-on-surface/30" />
          </div>
          <p className="text-sm text-on-surface/50">No tienes pagos registrados todavía.</p>
        </div>
      )}

      {/* Pendientes */}
      {pendientes.length > 0 && (
        <div className="space-y-3">
          <p className="text-[10px] font-bold uppercase tracking-widest text-on-surface/40">PENDIENTES</p>
          {pendientes.map(p => {
            const estado = ESTADO_MAP[p.estado] ?? ESTADO_MAP.pendiente
            const Icon = estado.icon
            return (
              <div key={p.id} className="bg-surface-container-lowest rounded-xl p-5 ring-1 ring-red-200 shadow-editorial">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1">
                    <p className="text-sm font-semibold text-on-surface capitalize">{p.concepto}</p>
                    {p.periodo_mes && <p className="text-xs text-on-surface/50">Período: {p.periodo_mes}</p>}
                    {p.descripcion && <p className="text-xs text-on-surface/50 mt-1">{p.descripcion}</p>}
                  </div>
                  <div className="text-right flex-shrink-0">
                    <p className="text-lg font-bold text-red-600">{fmtCOP(Number(p.monto))}</p>
                    <span className={`inline-flex items-center gap-1 text-[10px] px-2.5 py-1 rounded-full font-semibold mt-1 ${estado.color}`}>
                      <Icon className="w-3 h-3" />{estado.label}
                    </span>
                  </div>
                </div>
                {p.wompi_reference && (
                  <p className="mt-3 text-[10px] text-on-surface/40 font-mono">Ref: {p.wompi_reference}</p>
                )}
              </div>
            )
          })}
        </div>
      )}

      {/* Historial */}
      {resto.length > 0 && (
        <div className="space-y-3">
          <p className="text-[10px] font-bold uppercase tracking-widest text-on-surface/40">HISTORIAL</p>
          {resto.map(p => {
            const estado = ESTADO_MAP[p.estado] ?? ESTADO_MAP.pagado
            const Icon = estado.icon
            return (
              <div key={p.id} className="bg-surface-container-lowest rounded-xl p-4 shadow-editorial">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="text-sm font-semibold text-on-surface capitalize">{p.concepto}</p>
                    <p className="text-xs text-on-surface/50">
                      {p.periodo_mes ? `Período: ${p.periodo_mes} · ` : ''}
                      {new Date(p.pagado_at ?? p.created_at).toLocaleDateString('es-CO', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </p>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <p className="text-sm font-bold text-authority-green">{fmtCOP(Number(p.monto))}</p>
                    <span className={`inline-flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-full font-semibold mt-0.5 ${estado.color}`}>
                      <Icon className="w-3 h-3" />{estado.label}
                    </span>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
