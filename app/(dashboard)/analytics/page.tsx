export const dynamic = 'force-dynamic'

import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { AnalyticsClient } from './analytics-client'

export default async function AnalyticsPage() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase.from('profiles').select('empresa_id').eq('id', user.id).single()
  const empresaId = profile?.empresa_id || ''

  const db = createAdminClient()
  const sevenDaysAgo = new Date(Date.now() - 7 * 86400000).toISOString().split('T')[0]

  const [{ data: analytics }, { count: totalLeads }, { count: convCount }, { count: citasCount }] = await Promise.all([
    db.from('analytics_diarios').select('*').eq('empresa_id', empresaId).gte('fecha', sevenDaysAgo).order('fecha'),
    db.from('leads').select('id', { count: 'exact', head: true }).eq('empresa_id', empresaId),
    db.from('conversacion').select('id', { count: 'exact', head: true }),
    db.from('citas').select('id', { count: 'exact', head: true }).eq('empresa_id', empresaId),
  ])

  // Aggregate stats
  const totals = (analytics || []).reduce((acc, d) => ({
    leads: acc.leads + d.leads_nuevos,
    conversaciones: acc.conversaciones + d.conversaciones,
    solicitudes: acc.solicitudes + d.solicitudes,
    cierres: acc.cierres + d.cierres,
    mensajes: acc.mensajes + d.mensajes_enviados,
  }), { leads: 0, conversaciones: 0, solicitudes: 0, cierres: 0, mensajes: 0 })

  return (
    <AnalyticsClient
      analytics={analytics || []}
      stats={{ totalLeads: totalLeads ?? 0, convCount: convCount ?? 0, citasCount: citasCount ?? 0, ...totals }}
    />
  )
}
