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
    <div className="max-w-6xl mx-auto">
      <div className="mb-6">
        <h1 className="text-xl font-medium text-[#1a1a1a]">Usuarios</h1>
        <p className="text-sm text-[#6b7280] mt-0.5">
          {profiles?.length ?? 0} usuarios registrados
        </p>
      </div>
      <UsersTable initialProfiles={profiles ?? []} />
    </div>
  )
}
