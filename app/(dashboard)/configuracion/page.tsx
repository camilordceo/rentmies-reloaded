export const dynamic = 'force-dynamic'

import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { ConfiguracionClient } from './configuracion-client'

export default async function ConfiguracionPage() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase.from('profiles').select('*').eq('id', user.id).single()
  const empresaId = profile?.empresa_id || ''

  const db = createAdminClient()
  const { data: empresa } = await db.from('empresas').select('*').eq('id', empresaId).single()

  return <ConfiguracionClient profile={profile} empresa={empresa} />
}
