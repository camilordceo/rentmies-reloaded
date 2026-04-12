export const dynamic = 'force-dynamic'

import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { Calendar, Clock, MapPin, User, Sparkles } from 'lucide-react'

const ESTADO_COLOR: Record<string, string> = {
  pendiente: 'bg-amber-50 text-amber-700',
  confirmada: 'bg-brand-teal/10 text-brand-teal',
  cancelada: 'bg-red-50 text-red-700',
  realizada: 'bg-surface-container text-on-surface/50',
}

export default async function MisCitasAgentePage() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase.from('profiles').select('rol').eq('id', user.id).single()
  if (profile?.rol !== 'agente') redirect('/dashboard')

  const db = createAdminClient()
  const { data: citas } = await db
    .from('citas')
    .select('id, fecha, hora, direccion, tipo, estado, nombre_cliente, telefono_cliente, notas, propiedad_id')
    .eq('agente_id', user.id)
    .order('fecha', { ascending: true })

  const upcoming = citas?.filter(c => c.estado !== 'realizada' && c.estado !== 'cancelada') ?? []
  const past = citas?.filter(c => c.estado === 'realizada' || c.estado === 'cancelada') ?? []

  type CitaRow = NonNullable<typeof citas>[number]
  const CitaCard = ({ cita }: { cita: CitaRow }) => (
    <div className="bg-surface-container-lowest rounded-xl p-4 shadow-editorial">
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1">
          <div className="flex items-center gap-2 flex-wrap mb-2">
            <p className="text-sm font-semibold text-on-surface">{cita.nombre_cliente ?? 'Cliente'}</p>
            <span className={`text-[10px] px-2.5 py-1 rounded-full font-semibold ${ESTADO_COLOR[cita.estado] ?? 'bg-surface-container text-on-surface/50'}`}>
              {cita.estado}
            </span>
          </div>
          <div className="flex items-center gap-4 text-xs text-on-surface/50 flex-wrap">
            <span className="flex items-center gap-1">
              <Calendar className="w-3 h-3" />
              {new Date(cita.fecha).toLocaleDateString('es-CO', { weekday: 'short', day: 'numeric', month: 'short' })}
            </span>
            {cita.hora && <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{cita.hora}</span>}
            {cita.direccion && <span className="flex items-center gap-1"><MapPin className="w-3 h-3" />{cita.direccion}</span>}
            {cita.telefono_cliente && <span className="flex items-center gap-1"><User className="w-3 h-3" />{cita.telefono_cliente}</span>}
          </div>
          {cita.notas && <p className="mt-2 text-xs text-on-surface/50 line-clamp-2">{cita.notas}</p>}
        </div>
      </div>
    </div>
  )

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Eyebrow + title */}
      <div>
        <p className="text-[11px] font-bold uppercase tracking-[0.15em] text-authority-green mb-1">AGENDA</p>
        <h1 className="text-3xl font-bold tracking-tight text-on-surface">Mis Citas</h1>
        <p className="text-on-surface/50 text-sm mt-1">{upcoming.length} próximas · {past.length} pasadas</p>
      </div>

      {/* EMA tip */}
      <div className="bg-surface-container-low rounded-xl p-4">
        <div className="flex items-center gap-2 mb-1">
          <Sparkles className="w-3.5 h-3.5 text-brand-teal" />
          <span className="text-[10px] font-bold uppercase tracking-widest text-brand-teal">CONSEJO DE EMA</span>
        </div>
        <p className="text-xs text-on-surface/60 italic">
          Confirma las citas con 24h de anticipación para reducir inasistencias en un 40%.
        </p>
      </div>

      {!citas?.length && (
        <div className="bg-surface-container-lowest rounded-xl p-12 text-center shadow-editorial">
          <div className="w-12 h-12 rounded-xl bg-surface-container flex items-center justify-center mx-auto mb-4">
            <Calendar className="w-6 h-6 text-on-surface/30" />
          </div>
          <p className="text-sm text-on-surface/50">No tienes citas programadas.</p>
        </div>
      )}

      {upcoming.length > 0 && (
        <div className="space-y-3">
          <p className="text-[10px] font-bold uppercase tracking-widest text-on-surface/40">PRÓXIMAS</p>
          {upcoming.map(c => <CitaCard key={c.id} cita={c} />)}
        </div>
      )}

      {past.length > 0 && (
        <div className="space-y-3">
          <p className="text-[10px] font-bold uppercase tracking-widest text-on-surface/40">HISTORIAL</p>
          {past.map(c => <CitaCard key={c.id} cita={c} />)}
        </div>
      )}
    </div>
  )
}
