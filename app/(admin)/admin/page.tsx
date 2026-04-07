import { createClient } from '@/lib/supabase/server'
import { Users, Building2, MessageSquare, AlertCircle } from 'lucide-react'

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
    {
      label: 'Total usuarios',
      value: usersRes.count ?? 0,
      icon: Users,
      color: 'bg-blue-50 text-blue-600',
    },
    {
      label: 'Empresas activas',
      value: empresasRes.count ?? 0,
      icon: Building2,
      color: 'bg-purple-50 text-purple-600',
    },
    {
      label: 'Conversaciones hoy',
      value: convsRes.count ?? 0,
      icon: MessageSquare,
      color: 'bg-[#40d99d]/10 text-[#40d99d]',
    },
    {
      label: 'Errores 24h',
      value: logsRes.count ?? 0,
      icon: AlertCircle,
      color: logsRes.count ? 'bg-red-50 text-red-600' : 'bg-[#f0f0f0] text-[#6b7280]',
    },
  ]

  return (
    <div className="max-w-5xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-medium text-[#1a1a1a]">Panel de administración</h1>
        <p className="text-[#6b7280] text-sm mt-1">Vista general del sistema Rentmies</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {stats.map((stat) => (
          <div key={stat.label} className="bg-white rounded-xl border border-[#e5e5e5] p-5 shadow-sm">
            <div className={`w-9 h-9 rounded-lg ${stat.color} flex items-center justify-center mb-3`}>
              <stat.icon className="w-5 h-5" />
            </div>
            <p className="text-2xl font-medium text-[#1a1a1a]">{stat.value}</p>
            <p className="text-xs text-[#6b7280] mt-0.5">{stat.label}</p>
          </div>
        ))}
      </div>

      {/* Quick links */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[
          { href: '/admin/logs', label: 'Ver logs del sistema', desc: 'Monitoreo en tiempo real', color: 'text-orange-600 bg-orange-50' },
          { href: '/admin/usuarios', label: 'Gestionar usuarios', desc: 'Roles y permisos', color: 'text-blue-600 bg-blue-50' },
          { href: '/admin/empresas', label: 'Gestionar empresas', desc: 'Planes y estados', color: 'text-purple-600 bg-purple-50' },
        ].map((item) => (
          <a
            key={item.href}
            href={item.href}
            className="bg-white p-5 rounded-xl border border-[#e5e5e5] shadow-sm hover:border-[#40d99d] hover:shadow-md transition-all group"
          >
            <div className={`inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-medium mb-3 ${item.color}`}>
              {item.label}
            </div>
            <p className="text-xs text-[#6b7280]">{item.desc}</p>
          </a>
        ))}
      </div>
    </div>
  )
}
