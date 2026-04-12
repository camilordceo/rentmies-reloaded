export const dynamic = 'force-dynamic'

import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { Calendar, CreditCard, MessageSquare, ArrowRight, Home, Sparkles } from 'lucide-react'
import Link from 'next/link'

export default async function MiCuentaPage() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase.from('profiles').select('nombre, rol').eq('id', user.id).single()
  if (profile?.rol !== 'comprador') redirect('/dashboard')

  const db = createAdminClient()
  const { data: comprador } = await db
    .from('compradores')
    .select('id, nombre, ciudad, tipo_interes, presupuesto_min, presupuesto_max')
    .eq('profile_id', user.id)
    .single()

  if (!comprador) {
    return (
      <div className="max-w-2xl mx-auto space-y-6">
        <div>
          <p className="text-[11px] font-bold uppercase tracking-[0.15em] text-authority-green mb-1">BIENVENIDO</p>
          <h1 className="text-3xl font-bold tracking-tight text-on-surface">
            Hola, {profile?.nombre ?? user.email?.split('@')[0]}
          </h1>
        </div>
        <div className="bg-authority-green text-white rounded-xl p-8 text-center space-y-4">
          <div className="w-14 h-14 bg-white/10 rounded-xl flex items-center justify-center mx-auto">
            <Home className="w-7 h-7 text-brand-teal" />
          </div>
          <p className="text-base font-semibold">Tu perfil está siendo configurado</p>
          <p className="text-sm text-white/70">Un asesor completará tu perfil próximamente.</p>
          <Link
            href="/inmuebles"
            className="inline-flex items-center gap-1.5 px-4 py-2 bg-brand-teal text-white text-sm font-semibold rounded-lg hover:bg-brand-teal/90 transition-all"
          >
            Explorar inmuebles <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>
    )
  }

  const now = new Date().toISOString()
  const [{ data: proxCitas }, { data: pagosPendientes }, { data: solicitudesAbiertas }] = await Promise.all([
    db.from('citas')
      .select('id, fecha, hora, estado, direccion')
      .eq('comprador_id', comprador.id)
      .gte('fecha', now.split('T')[0])
      .order('fecha')
      .limit(3),
    db.from('pagos_comprador')
      .select('id, concepto, monto, moneda, periodo_mes')
      .eq('comprador_id', comprador.id)
      .eq('estado', 'pendiente')
      .limit(5),
    db.from('solicitudes')
      .select('id, tipo, asunto, estado, created_at')
      .eq('comprador_id', comprador.id)
      .in('estado', ['abierta', 'en_proceso'])
      .limit(3),
  ])

  const nombre = comprador.nombre ?? profile?.nombre ?? user.email?.split('@')[0] ?? 'Usuario'

  const summaryCards = [
    { label: 'PRÓXIMAS CITAS', value: proxCitas?.length ?? 0, icon: Calendar, accent: 'text-amber-600', bg: 'bg-amber-50', href: '/mi-cuenta/mis-citas' },
    { label: 'PAGOS PENDIENTES', value: pagosPendientes?.length ?? 0, icon: CreditCard, accent: 'text-red-600', bg: 'bg-red-50', href: '/mi-cuenta/mis-pagos' },
    { label: 'SOLICITUDES ACTIVAS', value: solicitudesAbiertas?.length ?? 0, icon: MessageSquare, accent: 'text-brand-teal', bg: 'bg-brand-teal/10', href: '/mi-cuenta/mis-solicitudes' },
  ]

  const fmtCOP = (v: number) => v.toLocaleString('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 })

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Eyebrow + greeting */}
      <div>
        <p className="text-[11px] font-bold uppercase tracking-[0.15em] text-authority-green mb-1">MI CUENTA</p>
        <h1 className="text-3xl font-bold tracking-tight text-on-surface">Hola, {nombre}</h1>
        <p className="text-on-surface/50 text-sm mt-1">
          {comprador.tipo_interes === 'compra' ? 'Buscando comprar' : comprador.tipo_interes === 'arriendo' ? 'Buscando arrendar' : 'Comprando o arrendando'}
          {comprador.ciudad ? ` en ${comprador.ciudad}` : ''}.
        </p>
      </div>

      {/* Summary tiles */}
      <div className="grid grid-cols-3 gap-4">
        {summaryCards.map(s => (
          <Link
            key={s.label}
            href={s.href}
            className="bg-surface-container-lowest rounded-xl p-5 shadow-editorial hover:shadow-glow-subtle transition-all"
          >
            <div className={`w-9 h-9 rounded-lg ${s.bg} flex items-center justify-center mb-3`}>
              <s.icon className={`w-4 h-4 ${s.accent}`} />
            </div>
            <p className="text-3xl font-bold text-authority-green">{s.value}</p>
            <p className="text-[10px] font-bold uppercase tracking-widest text-on-surface/40 mt-1 leading-tight">{s.label}</p>
          </Link>
        ))}
      </div>

      {/* Próximas visitas */}
      {proxCitas && proxCitas.length > 0 && (
        <div className="bg-surface-container-lowest rounded-xl p-5 shadow-editorial">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-semibold text-on-surface">Próximas visitas</h2>
            <Link href="/mi-cuenta/mis-citas" className="text-xs text-brand-teal hover:text-authority-green font-medium flex items-center gap-1 transition-colors">
              Ver todas <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
          <div className="space-y-0">
            {proxCitas.map((c, i) => (
              <div
                key={c.id}
                className={`flex items-center gap-3 py-3 ${i < proxCitas.length - 1 ? 'border-b border-outline-variant/10' : ''}`}
              >
                <div className="w-8 h-8 rounded-lg bg-amber-50 flex items-center justify-center flex-shrink-0">
                  <Calendar className="w-4 h-4 text-amber-600" />
                </div>
                <div className="flex-1">
                  <p className="text-xs font-semibold text-on-surface">
                    {new Date(c.fecha).toLocaleDateString('es-CO', { weekday: 'long', day: 'numeric', month: 'long' })}
                    {c.hora ? ` · ${c.hora}` : ''}
                  </p>
                  {c.direccion && <p className="text-[10px] text-on-surface/50">{c.direccion}</p>}
                </div>
                <span className={`text-[10px] px-2.5 py-1 rounded-full font-semibold flex-shrink-0 ${c.estado === 'confirmada' ? 'bg-brand-teal/10 text-brand-teal' : 'bg-amber-50 text-amber-700'}`}>
                  {c.estado}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Pagos pendientes */}
      {pagosPendientes && pagosPendientes.length > 0 && (
        <div className="bg-surface-container-lowest rounded-xl p-5 shadow-editorial">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-semibold text-on-surface">Pagos pendientes</h2>
            <Link href="/mi-cuenta/mis-pagos" className="text-xs text-brand-teal hover:text-authority-green font-medium flex items-center gap-1 transition-colors">
              Ver todos <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
          <div className="space-y-0">
            {pagosPendientes.map((p, i) => (
              <div
                key={p.id}
                className={`flex items-center justify-between py-3 ${i < pagosPendientes.length - 1 ? 'border-b border-outline-variant/10' : ''}`}
              >
                <div>
                  <p className="text-xs font-semibold text-on-surface capitalize">{p.concepto}</p>
                  {p.periodo_mes && <p className="text-[10px] text-on-surface/50">{p.periodo_mes}</p>}
                </div>
                <p className="text-sm font-bold text-red-600">{fmtCOP(Number(p.monto))}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Portal CTA */}
      <div className="bg-surface-container-low rounded-xl p-5 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Sparkles className="w-4 h-4 text-brand-teal" />
          <div>
            <p className="text-sm font-semibold text-on-surface">Buscar más inmuebles</p>
            <p className="text-xs text-on-surface/50">Explora el portal con IA 24/7</p>
          </div>
        </div>
        <Link
          href="/inmuebles"
          className="flex items-center gap-1.5 px-3 py-2 bg-authority-green text-white text-xs font-semibold rounded-lg hover:bg-authority-green/90 transition-all"
        >
          Ir al portal <ArrowRight className="w-3 h-3" />
        </Link>
      </div>
    </div>
  )
}
