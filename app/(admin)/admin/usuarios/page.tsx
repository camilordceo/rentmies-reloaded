export const dynamic = 'force-dynamic'

import { createClient } from '@/lib/supabase/server'
import { UsersTable } from '@/components/admin/users-table'

export default async function UsuariosPage() {
  const supabase = createClient()

  const { data: profiles } = await supabase
    .from('profiles')
    .select('*')
    .order('created_at', { ascending: false })

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div>
        <p className="text-[11px] font-bold uppercase tracking-[0.15em] text-authority-green mb-1">GESTIÓN</p>
        <h1 className="text-3xl font-bold tracking-tight text-on-surface">Usuarios</h1>
        <p className="text-on-surface/50 text-sm mt-1">{profiles?.length ?? 0} usuarios registrados</p>
      </div>
      <UsersTable initialProfiles={profiles ?? []} />
    </div>
  )
}
