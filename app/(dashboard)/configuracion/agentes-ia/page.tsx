export const dynamic = 'force-dynamic'

import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { AgentesIAClient } from './agentes-ia-client'

export default async function AgentesIAPage() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase.from('profiles').select('empresa_id').eq('id', user.id).single()
  const empresaId = profile?.empresa_id || ''

  const db = createAdminClient()
  const { data: agentes } = await db.from('agentes_ia').select('*').eq('empresa_id', empresaId).order('created_at')

  return <AgentesIAClient agentes={agentes || []} empresaId={empresaId} />
}
