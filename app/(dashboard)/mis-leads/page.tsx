export const dynamic = 'force-dynamic'

import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { Users, Phone, MapPin, Calendar, ArrowRight, Sparkles } from 'lucide-react'
import Link from 'next/link'

const STAGE_LABELS: Record<string, string> = {
  nuevo: 'Nuevo',
  contactado: 'Contactado',
  visita: 'Visita agendada',
  negociacion: 'Negociación',
  cerrado: 'Cerrado',
  perdido: 'Perdido',
}

const STAGE_COLOR: Record<string, string> = {
  nuevo: 'bg-blue-50 text-blue-700',
  contactado: 'bg-amber-50 text-amber-700',
  visita: 'bg-purple-50 text-purple-700',
  negociacion: 'bg-brand-teal/10 text-brand-teal',
  cerrado: 'bg-authority-green/10 text-authority-green',
  perdido: 'bg-red-50 text-red-700',
}

export default async function MisLeadsPage() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase.from('profiles').select('rol').eq('id', user.id).single()
  if (profile?.rol !== 'agente') redirect('/dashboard')

  const db = createAdminClient()
  const { data: leads } = await db
    .from('leads')
    .select('id, nombre, telefono, ciudad, etapa, tipo_negocio, presupuesto, created_at')
    .eq('agente_asignado_id', user.id)
    .eq('activo', true)
    .order('created_at', { ascending: false })

  const activeCount = leads?.filter(l => l.etapa !== 'cerrado' && l.etapa !== 'perdido').length ?? 0

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Eyebrow + title */}
      <div className="flex items-start justify-between">
        <div>
          <p className="text-[11px] font-bold uppercase tracking-[0.15em] text-authority-green mb-1">MI CARTERA</p>
          <h1 className="text-3xl font-bold tracking-tight text-on-surface">Mis Leads</h1>
          <p className="text-on-surface/50 text-sm mt-1">{leads?.length ?? 0} leads asignados · {activeCount} activos</p>
        </div>
        <Link
          href="/crm"
          className="flex items-center gap-1.5 px-4 py-2 bg-authority-green text-white text-sm font-semibold rounded-lg hover:bg-authority-green/90 transition-all"
        >
          Ver CRM <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>

      {/* EMA tip */}
      <div className="bg-surface-container-low rounded-xl p-5">
        <div className="flex items-center gap-2 mb-1.5">
          <Sparkles className="w-3.5 h-3.5 text-brand-teal" />
          <span className="text-[10px] font-bold uppercase tracking-widest text-brand-teal">CONSEJO DE EMA</span>
        </div>
        <p className="text-xs text-on-surface/60 italic leading-relaxed">
          Leads contactados en los primeros 5 minutos tienen 9× más probabilidad de conversión.
          EMA está respondiendo por ti 24/7.
        </p>
      </div>

      {!leads?.length && (
        <div className="bg-surface-container-lowest rounded-xl p-12 text-center shadow-editorial">
          <div className="w-12 h-12 rounded-xl bg-surface-container flex items-center justify-center mx-auto mb-4">
            <Users className="w-6 h-6 text-on-surface/30" />
          </div>
          <p className="text-sm text-on-surface/50">No tienes leads asignados todavía.</p>
        </div>
      )}

      <div className="grid gap-3">
        {leads?.map(lead => (
          <div key={lead.id} className="bg-surface-container-lowest rounded-xl p-4 shadow-editorial hover:shadow-glow-subtle transition-all">
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <p className="text-sm font-semibold text-on-surface truncate">{lead.nombre}</p>
                  <span className={`text-[10px] px-2 py-0.5 rounded-full font-semibold ${STAGE_COLOR[lead.etapa] ?? 'bg-surface-container text-on-surface/50'}`}>
                    {STAGE_LABELS[lead.etapa] ?? lead.etapa}
                  </span>
                  {lead.tipo_negocio && (
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-surface-container text-on-surface/50 font-medium">
                      {lead.tipo_negocio}
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-4 mt-2 text-xs text-on-surface/50 flex-wrap">
                  {lead.telefono && (
                    <span className="flex items-center gap-1"><Phone className="w-3 h-3" />{lead.telefono}</span>
                  )}
                  {lead.ciudad && (
                    <span className="flex items-center gap-1"><MapPin className="w-3 h-3" />{lead.ciudad}</span>
                  )}
                  {lead.presupuesto && (
                    <span className="font-semibold text-authority-green">
                      {Number(lead.presupuesto).toLocaleString('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 })}
                    </span>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-1 text-[10px] text-on-surface/40 flex-shrink-0">
                <Calendar className="w-3 h-3" />
                {new Date(lead.created_at).toLocaleDateString('es-CO', { day: 'numeric', month: 'short' })}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
