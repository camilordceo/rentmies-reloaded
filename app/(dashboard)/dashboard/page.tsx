export const dynamic = 'force-dynamic'

import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { MessageSquare, Users, Bot, TrendingUp, Calendar, ArrowRight } from 'lucide-react'
import Link from 'next/link'

export default async function DashboardPage() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase.from('profiles').select('nombre, empresa_id').eq('id', user.id).single()
  const empresaId = profile?.empresa_id || ''

  const db = createAdminClient()
  const today = new Date()
  const thirtyDaysAgo = new Date(today.getTime() - 30 * 86400000).toISOString()

  const [{ count: totalLeads }, { count: conversaciones }, { count: citas }, { data: agentesIA }] = await Promise.all([
    db.from('leads').select('id', { count: 'exact', head: true }).eq('empresa_id', empresaId).eq('activo', true),
    db.from('conversacion').select('id', { count: 'exact', head: true }),
    db.from('citas').select('id', { count: 'exact', head: true }).eq('empresa_id', empresaId).gte('created_at', thirtyDaysAgo),
    db.from('agentes_ia').select('id,nombre,canal,activo').eq('empresa_id', empresaId).eq('activo', true).limit(3),
  ])

  const nombre = profile?.nombre ?? user.email?.split('@')[0] ?? 'Usuario'

  const stats = [
    { label: 'Leads activos', value: totalLeads ?? 0, icon: Users, color: 'bg-[#40d99d]/10 text-[#40d99d]', href: '/crm' },
    { label: 'Conversaciones', value: conversaciones ?? 0, icon: MessageSquare, color: 'bg-blue-50 text-blue-600', href: '/conversaciones' },
    { label: 'Citas este mes', value: citas ?? 0, icon: Calendar, color: 'bg-amber-50 text-amber-600', href: '/crm' },
    { label: 'Agentes IA activos', value: agentesIA?.length ?? 0, icon: Bot, color: 'bg-purple-50 text-purple-600', href: '/configuracion/agentes-ia' },
  ]

  const quickLinks = [
    { href: '/conversaciones', label: 'Ver conversaciones', sub: 'Gestiona todos tus chats', icon: MessageSquare, color: 'text-[#40d99d] bg-[#40d99d]/10' },
    { href: '/crm', label: 'CRM Kanban', sub: 'Mueve leads por tu pipeline', icon: Users, color: 'text-blue-600 bg-blue-50' },
    { href: '/analytics', label: 'Analytics', sub: 'Métricas de los últimos 7 días', icon: TrendingUp, color: 'text-amber-600 bg-amber-50' },
    { href: '/configuracion/agentes-ia', label: 'Agentes IA', sub: 'Configura tus asistentes', icon: Bot, color: 'text-purple-600 bg-purple-50' },
  ]

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-medium text-[#1a1a1a]">Hola, {nombre}</h1>
        <p className="text-[#6b7280] text-sm mt-1">Aquí tienes un resumen de tu actividad.</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map(s => (
          <Link key={s.label} href={s.href}
            className="bg-white rounded-xl border border-[#e5e5e5] p-5 shadow-sm hover:border-[#40d99d]/40 transition-all group">
            <div className={`w-9 h-9 rounded-lg ${s.color} flex items-center justify-center mb-3`}>
              <s.icon className="w-5 h-5" />
            </div>
            <p className="text-2xl font-medium text-[#1a1a1a]">{s.value.toLocaleString('es-CO')}</p>
            <p className="text-xs text-[#6b7280] mt-0.5">{s.label}</p>
          </Link>
        ))}
      </div>

      {/* Active AI agents */}
      {agentesIA && agentesIA.length > 0 && (
        <div className="bg-white border border-[#e5e5e5] rounded-xl p-5 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-medium text-[#1a1a1a]">Agentes IA activos</h2>
            <Link href="/configuracion/agentes-ia" className="text-xs text-[#40d99d] hover:underline flex items-center gap-1">
              Ver todos <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
          <div className="flex flex-wrap gap-2">
            {agentesIA.map(a => (
              <span key={a.id} className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-full bg-[#40d99d]/10 text-[#40d99d] font-medium">
                <Bot className="w-3 h-3" />{a.nombre}
                <span className="text-[#40d99d]/60 capitalize">· {a.canal}</span>
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Quick actions */}
      <div className="bg-white rounded-xl border border-[#e5e5e5] p-5 shadow-sm">
        <h2 className="text-sm font-medium text-[#1a1a1a] mb-3">Acciones rápidas</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {quickLinks.map(l => (
            <Link key={l.href} href={l.href}
              className="flex items-center gap-3 p-4 rounded-xl border border-[#e5e5e5] hover:border-[#40d99d]/40 hover:bg-[#f8f8f8] transition-all">
              <div className={`w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0 ${l.color}`}>
                <l.icon className="w-4 h-4" />
              </div>
              <div>
                <p className="text-sm font-medium text-[#1a1a1a]">{l.label}</p>
                <p className="text-xs text-[#6b7280]">{l.sub}</p>
              </div>
              <ArrowRight className="w-4 h-4 text-[#e5e5e5] ml-auto" />
            </Link>
          ))}
        </div>
      </div>
    </div>
  )
}
