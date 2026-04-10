export const dynamic = 'force-dynamic'

import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { PagosClient } from './pagos-client'

export default async function PagosPage() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase.from('profiles').select('empresa_id').eq('id', user.id).single()
  const empresaId = profile?.empresa_id || ''

  const db = createAdminClient()
  const [{ data: suscripcion }, { data: pagos }] = await Promise.all([
    db.from('suscripciones').select('*').eq('empresa_id', empresaId).order('created_at', { ascending: false }).limit(1).single(),
    db.from('pagos').select('*').eq('empresa_id', empresaId).order('created_at', { ascending: false }).limit(20),
  ])

  return <PagosClient suscripcion={suscripcion} pagos={pagos || []} empresaId={empresaId} />
}
