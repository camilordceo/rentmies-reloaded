export const dynamic = 'force-dynamic'

import { createClient } from '@/lib/supabase/server'
import { ConfigForm } from '@/components/dashboard/config-form'

export default async function ConfiguracionPage() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user!.id)
    .single()

  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-xl font-medium text-[#1a1a1a] mb-6">Configuración</h1>
      <ConfigForm profile={profile} />
    </div>
  )
}
