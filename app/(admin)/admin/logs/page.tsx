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
    <div className="max-w-6xl mx-auto">
      <div className="mb-6">
        <h1 className="text-xl font-medium text-[#1a1a1a]">Logs del sistema</h1>
        <p className="text-sm text-[#6b7280] mt-0.5">Monitoreo de actividad y errores</p>
      </div>
      <LogsTable initialLogs={logs ?? []} />
    </div>
  )
}
