export const dynamic = 'force-dynamic'

import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { InfoEmpresaTab } from '@/components/empresa/info-empresa-tab'
import { AgentesTab } from '@/components/empresa/agentes-tab'
import { InventarioTab } from '@/components/empresa/inventario-tab'
import { AsignacionTab } from '@/components/empresa/asignacion-tab'

export default async function EmpresaPage({ searchParams }: { searchParams: { tab?: string } }) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase.from('profiles').select('empresa_id').eq('id', user.id).single()
  if (!profile?.empresa_id) return (
    <div className="flex items-center justify-center h-64">
      <p className="text-sm text-[#6b7280]">No tienes empresa asignada. Contacta al administrador.</p>
    </div>
  )

  const db = createAdminClient()
  const [{ data: empresa }, { data: agentes }, { data: propiedades }] = await Promise.all([
    db.from('empresas').select('*').eq('id', profile.empresa_id).single(),
    db.from('agentes').select('*').eq('empresa_id', profile.empresa_id).order('nombre'),
    db.from('propiedades').select('*').eq('empresa_id', profile.empresa_id).order('created_at', { ascending: false }),
  ])

  const tab = searchParams.tab || 'info'
  const tabs = [
    { key: 'info', label: 'Info Empresa' },
    { key: 'agentes', label: 'Agentes' },
    { key: 'inventario', label: 'Inventario' },
    { key: 'asignacion', label: 'Asignación Automática' },
  ]

  return (
    <div className="max-w-5xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-medium text-[#1a1a1a]">Empresa</h1>
        <p className="text-sm text-[#6b7280] mt-1">{empresa?.nombre}</p>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-1 bg-[#f0f0f0] rounded-xl p-1 mb-6 w-fit">
        {tabs.map(t => (
          <a key={t.key} href={`/empresa?tab=${t.key}`}
            className={`px-4 py-2 text-sm font-medium rounded-lg transition-all ${tab === t.key ? 'bg-white text-[#1a1a1a] shadow-sm' : 'text-[#6b7280] hover:text-[#1a1a1a]'}`}>
            {t.label}
          </a>
        ))}
      </div>

      <div className="bg-white border border-[#e5e5e5] rounded-xl p-6 shadow-sm">
        {tab === 'info' && empresa && <InfoEmpresaTab empresa={empresa} />}
        {tab === 'agentes' && <AgentesTab agentes={agentes || []} empresaId={profile.empresa_id} />}
        {tab === 'inventario' && <InventarioTab propiedades={propiedades || []} updatedAt={new Date().toLocaleDateString('es-CO')} />}
        {tab === 'asignacion' && <AsignacionTab agentes={agentes || []} empresaId={profile.empresa_id} />}
      </div>
    </div>
  )
}
