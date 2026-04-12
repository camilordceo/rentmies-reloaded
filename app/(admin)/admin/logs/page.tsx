export const dynamic = 'force-dynamic'

import { createClient } from '@/lib/supabase/server'
import { LogsTable } from '@/components/admin/logs-table'

export default async function LogsPage() {
  const supabase = createClient()

  const { data: logs } = await supabase
    .from('admin_logs')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(200)

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div>
        <p className="text-[11px] font-bold uppercase tracking-[0.15em] text-authority-green mb-1">MONITOREO</p>
        <h1 className="text-3xl font-bold tracking-tight text-on-surface">Logs del Sistema</h1>
        <p className="text-on-surface/50 text-sm mt-1">Actividad y errores en tiempo real</p>
      </div>
      <LogsTable initialLogs={logs ?? []} />
    </div>
  )
}
