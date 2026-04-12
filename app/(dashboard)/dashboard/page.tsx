export const dynamic = 'force-dynamic'

import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { MessageSquare, Users, Bot, TrendingUp, Calendar, ArrowRight, Sparkles } from 'lucide-react'
import Link from 'next/link'

export default async function DashboardPage() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase.from('profiles').select('id, nombre, rol, empresa_id').eq('id', user.id).single()
  const empresaId = profile?.empresa_id || ''
  const rol = profile?.rol ?? 'empresa_admin'

  const db = createAdminClient()
  const thirtyDaysAgo = new Date(Date.now() - 30 * 86400000).toISOString()
  const nombre = profile?.nombre ?? user.email?.split('@')[0] ?? 'Usuario'

  // ── Agente view ────────────────────────────────────────────────────────────
  if (rol === 'agente') {
    const [{ count: misLeads }, { count: misCitas }] = await Promise.all([
      db.from('leads').select('id', { count: 'exact', head: true }).eq('agente_asignado_id', user.id).eq('activo', true),
      db.from('citas').select('id', { count: 'exact', head: true }).eq('agente_id', user.id).gte('created_at', thirtyDaysAgo),
    ])
    const stats = [
      { label: 'Mis Leads', value: misLeads ?? 0, icon: Users, href: '/mis-leads' },
      { label: 'Citas este mes', value: misCitas ?? 0, icon: Calendar, href: '/mis-citas-agente' },
    ]
    return (
      <div className="max-w-3xl mx-auto space-y-6">
        {/* Eyebrow + title */}
        <div>
          <p className="text-[11px] font-bold uppercase tracking-[0.15em] text-authority-green mb-1">MI ACTIVIDAD</p>
          <h1 className="text-3xl font-bold tracking-tight text-on-surface">Hola, {nombre}</h1>
          <p className="text-on-surface/50 text-sm mt-1">Tu actividad de hoy.</p>
        </div>

        {/* EMA tip */}
        <div className="bg-surface-container-low rounded-xl p-5">
          <div className="flex items-center gap-2 mb-2">
            <Sparkles className="w-3.5 h-3.5 text-brand-teal" />
            <span className="text-[10px] font-bold uppercase tracking-widest text-brand-teal">TIP DE EMA</span>
          </div>
          <p className="text-xs text-on-surface/70 italic leading-relaxed">
            Tienes leads sin contactar en las últimas 48h. El seguimiento oportuno aumenta la conversión en un 3×.
          </p>
        </div>

        {/* Stat tiles */}
        <div className="grid grid-cols-2 gap-4">
          {stats.map(s => (
            <Link key={s.label} href={s.href}
              className="bg-surface-container-lowest rounded-xl p-6 shadow-editorial hover:shadow-glow-subtle transition-all group">
              <div className="w-9 h-9 rounded-lg bg-brand-teal/10 flex items-center justify-center mb-4">
                <s.icon className="w-5 h-5 text-brand-teal" />
              </div>
              <p className="text-4xl font-bold text-authority-green">{s.value.toLocaleString('es-CO')}</p>
              <p className="text-[10px] font-bold uppercase tracking-widest text-on-surface/40 mt-2">{s.label}</p>
            </Link>
          ))}
        </div>

        {/* Quick links */}
        <div className="bg-surface-container-lowest rounded-xl p-6 shadow-editorial">
          <p className="text-[10px] font-bold uppercase tracking-widest text-on-surface/40 mb-4">ACCESOS RÁPIDOS</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {[
              { href: '/conversaciones', label: 'Conversaciones', sub: 'Chats activos', icon: MessageSquare },
              { href: '/mis-leads', label: 'Mis Leads', sub: 'Pipeline asignado', icon: Users },
            ].map(l => (
              <Link key={l.href} href={l.href}
                className="flex items-center gap-3 p-4 rounded-xl bg-surface-container hover:bg-surface-container-high transition-all">
                <div className="w-9 h-9 rounded-lg bg-brand-teal/10 flex items-center justify-center flex-shrink-0">
                  <l.icon className="w-4 h-4 text-brand-teal" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-on-surface">{l.label}</p>
                  <p className="text-xs text-on-surface/50">{l.sub}</p>
                </div>
                <ArrowRight className="w-4 h-4 text-on-surface/20 ml-auto" />
              </Link>
            ))}
          </div>
        </div>
      </div>
    )
  }

  // ── Admin / empresa_admin view ─────────────────────────────────────────────
  const [{ count: totalLeads }, { count: conversaciones }, { count: citas }, { data: agentesIA }] = await Promise.all([
    db.from('leads').select('id', { count: 'exact', head: true }).eq('empresa_id', empresaId).eq('activo', true),
    db.from('conversacion').select('id', { count: 'exact', head: true }),
    db.from('citas').select('id', { count: 'exact', head: true }).eq('empresa_id', empresaId).gte('created_at', thirtyDaysAgo),
    db.from('agentes_ia').select('id,nombre,canal,activo').eq('empresa_id', empresaId).eq('activo', true).limit(3),
  ])

  const stats = [
    { label: 'Leads Activos', value: totalLeads ?? 0, icon: Users, href: '/crm', delta: '+12%' },
    { label: 'Conversaciones', value: conversaciones ?? 0, icon: MessageSquare, href: '/conversaciones', delta: '+8%' },
    { label: 'Citas Este Mes', value: citas ?? 0, icon: Calendar, href: '/crm', delta: '+5%' },
    { label: 'Agentes IA', value: agentesIA?.length ?? 0, icon: Bot, href: '/configuracion/agentes-ia', delta: 'activos' },
  ]

  const quickLinks = [
    { href: '/conversaciones', label: 'Ver Conversaciones', sub: 'Gestiona todos tus chats', icon: MessageSquare },
    { href: '/crm', label: 'CRM Kanban', sub: 'Mueve leads por tu pipeline', icon: Users },
    { href: '/analytics', label: 'Analytics', sub: 'Métricas de los últimos 7 días', icon: TrendingUp },
    { href: '/configuracion/agentes-ia', label: 'Agentes IA', sub: 'Configura tus asistentes', icon: Bot },
  ]

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Eyebrow + title */}
      <div>
        <p className="text-[11px] font-bold uppercase tracking-[0.15em] text-authority-green mb-1">EXECUTIVE OVERVIEW</p>
        <h1 className="text-3xl font-bold tracking-tight text-on-surface">Hola, {nombre}</h1>
        <p className="text-on-surface/50 text-sm mt-1">Resumen ejecutivo de tu operación.</p>
      </div>

      {/* EMA Strategic Insight card */}
      <div className="bg-authority-green text-white rounded-xl p-8">
        <div className="flex items-center gap-2 mb-3">
          <Sparkles className="w-4 h-4 text-brand-teal" />
          <span className="text-[11px] font-bold uppercase tracking-[0.15em] text-brand-teal">
            EMA STRATEGIC INSIGHT
          </span>
        </div>
        <p className="text-xl font-semibold leading-snug mb-6">
          3 leads en etapa &quot;Propuesta enviada&quot; llevan más de 5 días sin respuesta.
          La tasa de cierre cae 40% después de ese umbral.
        </p>
        <div className="flex flex-wrap gap-3">
          <Link href="/crm"
            className="px-4 py-2 rounded-lg bg-white text-authority-green text-sm font-semibold hover:bg-white/90 transition-colors">
            Ejecutar Seguimiento
          </Link>
          <Link href="/conversaciones"
            className="px-4 py-2 rounded-lg bg-white/20 text-white text-sm font-semibold hover:bg-white/30 transition-colors">
            Ver Detalles del Lead
          </Link>
        </div>
      </div>

      {/* Stat tiles */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map(s => (
          <Link key={s.label} href={s.href}
            className="bg-surface-container-lowest rounded-xl p-6 shadow-editorial hover:shadow-glow-subtle transition-all group">
            <div className="flex items-center justify-between mb-4">
              <div className="w-9 h-9 rounded-lg bg-brand-teal/10 flex items-center justify-center">
                <s.icon className="w-5 h-5 text-brand-teal" />
              </div>
              <span className="text-[10px] font-semibold text-brand-teal bg-brand-teal/10 px-2 py-0.5 rounded-full">
                {s.delta}
              </span>
            </div>
            <p className="text-4xl font-bold text-authority-green">{s.value.toLocaleString('es-CO')}</p>
            <p className="text-[10px] font-bold uppercase tracking-widest text-on-surface/40 mt-2">{s.label}</p>
          </Link>
        ))}
      </div>

      {/* Active AI agents + Tip de EMA side by side */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* AI Agents */}
        {agentesIA && agentesIA.length > 0 && (
          <div className="lg:col-span-2 bg-surface-container-lowest rounded-xl p-6 shadow-editorial">
            <div className="flex items-center justify-between mb-4">
              <p className="text-[10px] font-bold uppercase tracking-widest text-on-surface/40">AGENTES IA ACTIVOS</p>
              <Link href="/configuracion/agentes-ia" className="text-xs text-brand-teal hover:underline flex items-center gap-1">
                Ver todos <ArrowRight className="w-3 h-3" />
              </Link>
            </div>
            <div className="flex flex-wrap gap-2">
              {agentesIA.map(a => (
                <span key={a.id} className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-full bg-brand-teal/10 text-brand-teal font-medium">
                  <Bot className="w-3 h-3" />{a.nombre}
                  <span className="text-brand-teal/60 capitalize">· {a.canal}</span>
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Tip de EMA */}
        <div className="bg-surface-container-low rounded-xl p-5">
          <div className="flex items-center gap-2 mb-3">
            <Sparkles className="w-3.5 h-3.5 text-brand-teal" />
            <span className="text-[10px] font-bold uppercase tracking-widest text-brand-teal">TIP DE EMA</span>
          </div>
          <p className="text-xs text-on-surface/70 italic leading-relaxed">
            Las inmobiliarias que responden en menos de 5 minutos tienen 9× más probabilidad de contactar exitosamente al lead.
            EMA ya está respondiendo en tiempo real.
          </p>
        </div>
      </div>

      {/* Quick actions */}
      <div className="bg-surface-container-lowest rounded-xl p-6 shadow-editorial">
        <p className="text-[10px] font-bold uppercase tracking-widest text-on-surface/40 mb-4">ACCIONES RÁPIDAS</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {quickLinks.map(l => (
            <Link key={l.href} href={l.href}
              className="flex items-center gap-3 p-4 rounded-xl bg-surface-container hover:bg-surface-container-high transition-all">
              <div className="w-9 h-9 rounded-lg bg-brand-teal/10 flex items-center justify-center flex-shrink-0">
                <l.icon className="w-4 h-4 text-brand-teal" />
              </div>
              <div>
                <p className="text-sm font-semibold text-on-surface">{l.label}</p>
                <p className="text-xs text-on-surface/50">{l.sub}</p>
              </div>
              <ArrowRight className="w-4 h-4 text-on-surface/20 ml-auto" />
            </Link>
          ))}
        </div>
      </div>
    </div>
  )
}
