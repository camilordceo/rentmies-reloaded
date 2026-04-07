import { createClient } from '@/lib/supabase/server'
import { MessageSquare, Users, Bot, TrendingUp } from 'lucide-react'

export default async function DashboardPage() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const { data: profile } = await supabase
    .from('profiles')
    .select('nombre')
    .eq('id', user!.id)
    .single()

  // Try to get stats (graceful fallback if tables don't have data yet)
  const today = new Date()
  today.setHours(0, 0, 0, 0)

  const [convResult, contactResult] = await Promise.all([
    supabase.from('conversations').select('id', { count: 'exact', head: true }),
    supabase.from('contacts').select('id', { count: 'exact', head: true }),
  ])

  const stats = [
    {
      label: 'Conversaciones',
      value: convResult.count ?? 0,
      icon: MessageSquare,
      color: 'bg-[#40d99d]/10 text-[#40d99d]',
    },
    {
      label: 'Contactos',
      value: contactResult.count ?? 0,
      icon: Users,
      color: 'bg-blue-50 text-blue-600',
    },
    {
      label: 'Modo IA activo',
      value: '—',
      icon: Bot,
      color: 'bg-purple-50 text-purple-600',
    },
    {
      label: 'Tasa de respuesta',
      value: '—',
      icon: TrendingUp,
      color: 'bg-orange-50 text-orange-600',
    },
  ]

  const nombre = profile?.nombre ?? user?.email?.split('@')[0] ?? 'Usuario'

  return (
    <div className="max-w-5xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-medium text-[#1a1a1a]">
          Hola, {nombre} 👋
        </h1>
        <p className="text-[#6b7280] text-sm mt-1">
          Aquí tienes un resumen de tu actividad reciente.
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {stats.map((stat) => (
          <div
            key={stat.label}
            className="bg-white rounded-xl border border-[#e5e5e5] p-5 shadow-sm"
          >
            <div className={`w-9 h-9 rounded-lg ${stat.color} flex items-center justify-center mb-3`}>
              <stat.icon className="w-5 h-5" />
            </div>
            <p className="text-2xl font-medium text-[#1a1a1a]">{stat.value}</p>
            <p className="text-xs text-[#6b7280] mt-0.5">{stat.label}</p>
          </div>
        ))}
      </div>

      {/* Quick actions */}
      <div className="bg-white rounded-xl border border-[#e5e5e5] p-6 shadow-sm">
        <h2 className="font-medium text-[#1a1a1a] mb-4">Acciones rápidas</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <a
            href="/dashboard/conversaciones"
            className="flex items-center gap-3 p-4 rounded-lg border border-[#e5e5e5] hover:border-[#40d99d] hover:bg-[#40d99d]/5 transition-all group"
          >
            <div className="w-9 h-9 bg-[#40d99d]/10 rounded-lg flex items-center justify-center flex-shrink-0">
              <MessageSquare className="w-5 h-5 text-[#40d99d]" />
            </div>
            <div>
              <p className="text-sm font-medium text-[#1a1a1a]">Ver conversaciones</p>
              <p className="text-xs text-[#6b7280]">Gestiona todos tus chats</p>
            </div>
          </a>
          <a
            href="/dashboard/contactos"
            className="flex items-center gap-3 p-4 rounded-lg border border-[#e5e5e5] hover:border-[#40d99d] hover:bg-[#40d99d]/5 transition-all group"
          >
            <div className="w-9 h-9 bg-blue-50 rounded-lg flex items-center justify-center flex-shrink-0">
              <Users className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-[#1a1a1a]">Ver contactos</p>
              <p className="text-xs text-[#6b7280]">Tu base de clientes</p>
            </div>
          </a>
        </div>
      </div>
    </div>
  )
}
