export const dynamic = 'force-dynamic'

import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { InfoEmpresaTab } from '@/components/empresa/info-empresa-tab'
import { AgentesTab } from '@/components/empresa/agentes-tab'
import { InventarioTab } from '@/components/empresa/inventario-tab'
import { AsignacionTab } from '@/components/empresa/asignacion-tab'
import { Sparkles } from 'lucide-react'

export default async function EmpresaPage({ searchParams }: { searchParams: { tab?: string } }) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase.from('profiles').select('empresa_id').eq('id', user.id).single()
  if (!profile?.empresa_id) return (
    <div className="flex items-center justify-center h-64">
      <p className="text-sm text-on-surface/50">No tienes empresa asignada. Contacta al administrador.</p>
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
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Eyebrow + title */}
      <div>
        <p className="text-[11px] font-bold uppercase tracking-[0.15em] text-authority-green mb-1">
          EXECUTIVE MANAGEMENT
        </p>
        <h1 className="text-3xl font-bold tracking-tight text-on-surface">Gestión de Empresa</h1>
        <p className="text-on-surface/50 text-sm mt-1">{empresa?.nombre}</p>
      </div>

      {/* IA-Human summary card */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-surface-container-lowest rounded-xl p-6 shadow-editorial">
          <p className="text-[10px] font-bold uppercase tracking-widest text-on-surface/40 mb-4">COLABORACIÓN IA-HUMANO</p>
          <div className="flex items-end gap-4">
            <div>
              <p className="text-4xl font-bold text-authority-green">87%</p>
              <p className="text-xs text-on-surface/50 mt-1">Eficiencia operativa</p>
            </div>
            <div>
              <p className="text-4xl font-bold text-authority-green">6h</p>
              <p className="text-xs text-on-surface/50 mt-1">Ahorradas por día</p>
            </div>
          </div>
        </div>

        {/* EMA next action */}
        <div className="bg-authority-green text-white rounded-xl p-6">
          <div className="flex items-center gap-2 mb-3">
            <Sparkles className="w-3.5 h-3.5 text-brand-teal" />
            <span className="text-[10px] font-bold uppercase tracking-widest text-brand-teal">SIGUIENTE ACCIÓN</span>
          </div>
          <p className="text-sm font-semibold leading-snug mb-4">
            2 agentes sin asignaciones activas. EMA recomienda redistribuir leads de mayor valor.
          </p>
          <a href="/empresa?tab=agentes"
            className="inline-flex items-center text-xs font-semibold text-white/80 hover:text-white transition-colors">
            Ver agentes →
          </a>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-1 bg-surface-container rounded-xl p-1 w-fit">
        {tabs.map(t => (
          <a key={t.key} href={`/empresa?tab=${t.key}`}
            className={`px-4 py-2 text-sm font-medium rounded-lg transition-all ${
              tab === t.key
                ? 'bg-surface-container-lowest text-on-surface shadow-editorial'
                : 'text-on-surface/50 hover:text-on-surface'
            }`}>
            {t.label}
          </a>
        ))}
      </div>

      {/* Tab content */}
      <div className="bg-surface-container-lowest rounded-xl p-6 shadow-editorial">
        {tab === 'info' && empresa && <InfoEmpresaTab empresa={empresa} />}
        {tab === 'agentes' && <AgentesTab agentes={agentes || []} empresaId={profile.empresa_id} />}
        {tab === 'inventario' && <InventarioTab propiedades={propiedades || []} updatedAt={new Date().toLocaleDateString('es-CO')} />}
        {tab === 'asignacion' && <AsignacionTab agentes={agentes || []} empresaId={profile.empresa_id} />}
      </div>

      {/* EMA Tip */}
      <div className="bg-surface-container-low rounded-xl p-5">
        <div className="flex items-center gap-2 mb-2">
          <Sparkles className="w-3.5 h-3.5 text-brand-teal" />
          <span className="text-[10px] font-bold uppercase tracking-widest text-brand-teal">PERSPECTIVA DE EMA</span>
        </div>
        <p className="text-xs text-on-surface/70 italic leading-relaxed">
          Tu inventario de {propiedades?.length ?? 0} propiedades tiene una cobertura óptima.
          Las propiedades con fotos de alta resolución reciben 3× más consultas.
        </p>
      </div>
    </div>
  )
}
