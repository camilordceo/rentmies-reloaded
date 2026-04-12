export const dynamic = 'force-dynamic'

import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { Users2, MessageSquare, Sparkles } from 'lucide-react'

const ROL_LABEL: Record<string, string> = {
  empresa_admin: 'Admin',
  agente: 'Agente',
}

const ROL_COLOR: Record<string, string> = {
  empresa_admin: 'bg-purple-50 text-purple-700',
  agente: 'bg-brand-teal/10 text-brand-teal',
}

export default async function MiEquipoPage() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase.from('profiles').select('rol, empresa_id').eq('id', user.id).single()
  if (!['admin', 'empresa_admin'].includes(profile?.rol ?? '')) redirect('/dashboard')

  const empresaId = profile?.empresa_id
  if (!empresaId) redirect('/dashboard')

  const db = createAdminClient()
  const { data: equipo } = await db
    .from('profiles')
    .select('id, nombre, email, rol, activo, created_at')
    .eq('empresa_id', empresaId)
    .in('rol', ['empresa_admin', 'agente'])
    .order('rol')

  const agentIds = equipo?.filter(m => m.rol === 'agente').map(m => m.id) ?? []
  const leadsPerAgente: Record<string, number> = {}
  if (agentIds.length) {
    const { data: leadRows } = await db
      .from('leads')
      .select('agente_asignado_id')
      .in('agente_asignado_id', agentIds)
      .eq('activo', true)
    leadRows?.forEach(r => {
      if (r.agente_asignado_id) leadsPerAgente[r.agente_asignado_id] = (leadsPerAgente[r.agente_asignado_id] ?? 0) + 1
    })
  }

  const adminCount = equipo?.filter(m => m.rol === 'empresa_admin').length ?? 0
  const agenteCount = equipo?.filter(m => m.rol === 'agente').length ?? 0

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Eyebrow + title */}
      <div>
        <p className="text-[11px] font-bold uppercase tracking-[0.15em] text-authority-green mb-1">GESTIÓN DE EQUIPO</p>
        <h1 className="text-3xl font-bold tracking-tight text-on-surface">Mi Equipo</h1>
        <p className="text-on-surface/50 text-sm mt-1">{equipo?.length ?? 0} miembros · {adminCount} admins · {agenteCount} agentes</p>
      </div>

      {!equipo?.length ? (
        <div className="bg-surface-container-lowest rounded-xl p-12 text-center shadow-editorial">
          <div className="w-12 h-12 rounded-xl bg-surface-container flex items-center justify-center mx-auto mb-4">
            <Users2 className="w-6 h-6 text-on-surface/30" />
          </div>
          <p className="text-sm text-on-surface/50">No hay miembros en tu equipo todavía.</p>
        </div>
      ) : (
        <div className="bg-surface-container-lowest rounded-xl overflow-hidden shadow-editorial">
          {equipo.map((member, i) => (
            <div
              key={member.id}
              className={`flex items-center gap-4 px-5 py-4 hover:bg-surface-container-low transition-colors ${i > 0 ? 'border-t border-outline-variant/10' : ''}`}
            >
              <div className="w-9 h-9 rounded-full bg-brand-teal/10 flex items-center justify-center flex-shrink-0">
                <span className="text-sm font-bold text-brand-teal">
                  {(member.nombre ?? member.email ?? 'U')[0].toUpperCase()}
                </span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-on-surface truncate">{member.nombre ?? member.email}</p>
                <p className="text-xs text-on-surface/50 truncate">{member.email}</p>
              </div>
              <div className="flex items-center gap-3 flex-shrink-0">
                {member.rol === 'agente' && (
                  <span className="flex items-center gap-1 text-xs text-on-surface/50">
                    <MessageSquare className="w-3 h-3" />
                    {leadsPerAgente[member.id] ?? 0} leads
                  </span>
                )}
                <span className={`text-[10px] px-2.5 py-1 rounded-full font-semibold ${ROL_COLOR[member.rol] ?? 'bg-surface-container text-on-surface/50'}`}>
                  {ROL_LABEL[member.rol] ?? member.rol}
                </span>
                {!member.activo && (
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-red-50 text-red-600 font-semibold">Inactivo</span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* EMA tip */}
      <div className="bg-surface-container-low rounded-xl p-5">
        <div className="flex items-center gap-2 mb-1.5">
          <Sparkles className="w-3.5 h-3.5 text-brand-teal" />
          <span className="text-[10px] font-bold uppercase tracking-widest text-brand-teal">PERSPECTIVA DE EMA</span>
        </div>
        <p className="text-xs text-on-surface/60 italic leading-relaxed">
          Para invitar miembros al equipo, comparte el link de registro con su email
          y asigna la empresa desde el panel de administración.
        </p>
      </div>
    </div>
  )
}
