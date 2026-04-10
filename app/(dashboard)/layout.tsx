export const dynamic = 'force-dynamic'

import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { Sidebar } from '@/components/dashboard/sidebar'
import { Topbar } from '@/components/dashboard/topbar'

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single()

  // Consumo conversaciones del periodo actual (rolling 30 days)
  const periodoFin = new Date()
  const periodoInicio = new Date()
  periodoInicio.setDate(periodoInicio.getDate() - 30)
  const fmtDate = (d: Date) => d.toLocaleDateString('es-CO', { day: 'numeric', month: 'short' })
  const periodo = `${fmtDate(periodoInicio)} - ${fmtDate(periodoFin)}`

  const { count: convCount } = await supabase
    .from('conversacion')
    .select('id', { count: 'exact', head: true })
    .gte('created_at', periodoInicio.toISOString())

  return (
    <div className="flex h-screen bg-[#f8f8f8] overflow-hidden">
      <Sidebar
        userRole={profile?.rol ?? 'user'}
        consumo={{ periodo, conversaciones: convCount ?? 0, limite: 1000 }}
      />
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <Topbar profile={profile} />
        <main className="flex-1 overflow-auto p-4 lg:p-6">
          {children}
        </main>
      </div>
    </div>
  )
}
