export const dynamic = 'force-dynamic'

import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { CRMClient } from './crm-client'

export default async function CRMPage() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase.from('profiles').select('empresa_id').eq('id', user.id).single()
  const empresaId = profile?.empresa_id || ''

  const db = createAdminClient()
  const [{ data: pipelines }, { data: agentes }] = await Promise.all([
    db.from('pipelines').select('*, pipeline_etapas(*)').eq('empresa_id', empresaId).eq('activo', true).order('orden'),
    db.from('agentes').select('id,nombre').eq('empresa_id', empresaId).eq('activo', true),
  ])

  const activePipeline = pipelines?.[0] || null
  const etapas = (activePipeline as any)?.pipeline_etapas?.sort((a: any, b: any) => a.orden - b.orden) || []

  let leads: any[] = []
  if (activePipeline) {
    const { data } = await db.from('leads').select('*, agentes(id,nombre)').eq('pipeline_id', activePipeline.id).eq('activo', true).order('updated_at', { ascending: false })
    leads = data || []
  }

  return (
    <CRMClient
      pipelines={pipelines || []}
      initialEtapas={etapas}
      initialLeads={leads}
      agentes={agentes || []}
      empresaId={empresaId}
    />
  )
}
