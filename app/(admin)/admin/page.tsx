export const dynamic = 'force-dynamic'

import { createClient } from '@/lib/supabase/server'
import { Users, Building2, MessageSquare, AlertCircle, Sparkles } from 'lucide-react'

export default async function AdminPage() {
  const supabase = createClient()

  const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()
  const todayStart = new Date()
  todayStart.setHours(0, 0, 0, 0)

  const [usersRes, empresasRes, convsRes, logsRes] = await Promise.all([
    supabase.from('profiles').select('id', { count: 'exact', head: true }),
    supabase.from('empresas').select('id', { count: 'exact', head: true }).eq('activo', true),
    supabase.from('conversations').select('id', { count: 'exact', head: true })
      .gte('created_at', todayStart.toISOString()),
    supabase.from('admin_logs').select('id', { count: 'exact', head: true })
      .eq('level', 'error')
      .gte('created_at', yesterday),
  ])

  const stats = [
    { label: 'TOTAL USUARIOS', value: usersRes.count ?? 0, icon: Users, accent: 'text-brand-teal', bg: 'bg-brand-teal/10' },
    { label: 'EMPRESAS ACTIVAS', value: empresasRes.count ?? 0, icon: Building2, accent: 'text-purple-600', bg: 'bg-purple-50' },
    { label: 'CONVERSACIONES HOY', value: convsRes.count ?? 0, icon: MessageSquare, accent: 'text-brand-teal', bg: 'bg-brand-teal/10' },
    { label: 'ERRORES 24H', value: logsRes.count ?? 0, icon: AlertCircle, accent: logsRes.count ? 'text-red-600' : 'text-on-surface/40', bg: logsRes.count ? 'bg-red-50' : 'bg-surface-container' },
  ]

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      {/* Eyebrow + title */}
      <div>
        <p className="text-[11px] font-bold uppercase tracking-[0.15em] text-authority-green mb-1">SISTEMA</p>
        <h1 className="text-3xl font-bold tracking-tight text-on-surface">Panel de Administración</h1>
        <p className="text-on-surface/50 text-sm mt-1">Vista general del sistema Rentmies</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat) => (
          <div key={stat.label} className="bg-surface-container-lowest rounded-xl p-6 shadow-editorial">
            <div className={`w-9 h-9 rounded-lg ${stat.bg} flex items-center justify-center mb-4`}>
              <stat.icon className={`w-5 h-5 ${stat.accent}`} />
            </div>
            <p className="text-4xl font-bold text-authority-green">{stat.value}</p>
            <p className="text-[10px] font-bold uppercase tracking-widest text-on-surface/40 mt-2">{stat.label}</p>
          </div>
        ))}
      </div>

      {/* EMA Insight */}
      <div className="bg-authority-green text-white rounded-xl p-6">
        <div className="flex items-center gap-2 mb-2">
          <Sparkles className="w-4 h-4 text-brand-teal" />
          <span className="text-[11px] font-bold uppercase tracking-[0.15em] text-brand-teal">ESTADO DEL SISTEMA</span>
        </div>
        <p className="text-base font-semibold leading-snug">
          Sistema operando en parámetros normales. EMA procesando conversaciones en tiempo real.
          Todos los agentes IA activos.
        </p>
      </div>

      {/* Quick links */}
      <div>
        <p className="text-[10px] font-bold uppercase tracking-widest text-on-surface/40 mb-4">ACCESOS RÁPIDOS</p>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {[
            { href: '/admin/logs', label: 'Logs del sistema', desc: 'Monitoreo en tiempo real de eventos y errores', accent: 'text-amber-600', bg: 'bg-amber-50' },
            { href: '/admin/usuarios', label: 'Gestionar usuarios', desc: 'Roles, permisos y cuentas activas', accent: 'text-blue-600', bg: 'bg-blue-50' },
            { href: '/admin/empresas', label: 'Gestionar empresas', desc: 'Planes, configuraciones y estados', accent: 'text-purple-600', bg: 'bg-purple-50' },
          ].map((item) => (
            <a
              key={item.href}
              href={item.href}
              className="bg-surface-container-lowest p-5 rounded-xl shadow-editorial hover:shadow-glow-subtle transition-all"
            >
              <span className={`inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-semibold mb-3 ${item.accent} ${item.bg}`}>
                {item.label}
              </span>
              <p className="text-xs text-on-surface/50 leading-relaxed">{item.desc}</p>
            </a>
          ))}
        </div>
      </div>
    </div>
  )
}
