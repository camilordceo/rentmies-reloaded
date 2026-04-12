export const dynamic = 'force-dynamic'

import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { Calendar, Clock, MapPin } from 'lucide-react'

const ESTADO_COLOR: Record<string, string> = {
  pendiente: 'bg-amber-50 text-amber-700',
  confirmada: 'bg-brand-teal/10 text-brand-teal',
  cancelada: 'bg-red-50 text-red-700',
  realizada: 'bg-surface-container text-on-surface/50',
}

export default async function MisCitasCompradorPage() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase.from('profiles').select('rol').eq('id', user.id).single()
  if (profile?.rol !== 'comprador') redirect('/dashboard')

  const db = createAdminClient()
  const { data: comprador } = await db.from('compradores').select('id').eq('profile_id', user.id).single()
  if (!comprador) redirect('/mi-cuenta')

  const { data: citas } = await db
    .from('citas')
    .select('id, fecha, hora, direccion, tipo, estado, notas, propiedad_id')
    .eq('comprador_id', comprador.id)
    .order('fecha', { ascending: false })

  const upcoming = citas?.filter(c => !['realizada', 'cancelada'].includes(c.estado ?? '')) ?? []
  const past = citas?.filter(c => ['realizada', 'cancelada'].includes(c.estado ?? '')) ?? []

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Eyebrow + title */}
      <div>
        <p className="text-[11px] font-bold uppercase tracking-[0.15em] text-authority-green mb-1">AGENDA</p>
        <h1 className="text-3xl font-bold tracking-tight text-on-surface">Mis Citas</h1>
        <p className="text-on-surface/50 text-sm mt-1">{upcoming.length} próximas · {past.length} pasadas</p>
      </div>

      {!citas?.length && (
        <div className="bg-surface-container-lowest rounded-xl p-12 text-center shadow-editorial">
          <div className="w-12 h-12 rounded-xl bg-surface-container flex items-center justify-center mx-auto mb-4">
            <Calendar className="w-6 h-6 text-on-surface/30" />
          </div>
          <p className="text-sm font-semibold text-on-surface mb-1">No tienes citas programadas</p>
          <p className="text-xs text-on-surface/50">Pide una visita desde el portal de inmuebles.</p>
        </div>
      )}

      {upcoming.length > 0 && (
        <div className="space-y-3">
          <p className="text-[10px] font-bold uppercase tracking-widest text-on-surface/40">PRÓXIMAS</p>
          {upcoming.map(c => (
            <div key={c.id} className="bg-surface-container-lowest rounded-xl p-4 shadow-editorial">
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1">
                  <div className="flex items-center gap-3 text-xs flex-wrap">
                    <span className="flex items-center gap-1.5 font-semibold text-on-surface">
                      <Calendar className="w-3.5 h-3.5 text-brand-teal" />
                      {new Date(c.fecha).toLocaleDateString('es-CO', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
                    </span>
                    {c.hora && (
                      <span className="flex items-center gap-1 text-on-surface/50">
                        <Clock className="w-3 h-3" />{c.hora}
                      </span>
                    )}
                  </div>
                  {c.direccion && (
                    <p className="flex items-center gap-1 mt-2 text-xs text-on-surface/50">
                      <MapPin className="w-3 h-3" />{c.direccion}
                    </p>
                  )}
                  {c.notas && <p className="mt-2 text-xs text-on-surface/50 line-clamp-2">{c.notas}</p>}
                </div>
                <span className={`text-[10px] px-2.5 py-1 rounded-full font-semibold flex-shrink-0 ${ESTADO_COLOR[c.estado ?? 'pendiente']}`}>
                  {c.estado}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}

      {past.length > 0 && (
        <div className="space-y-3">
          <p className="text-[10px] font-bold uppercase tracking-widest text-on-surface/40">HISTORIAL</p>
          {past.map(c => (
            <div key={c.id} className="bg-surface-container rounded-xl p-4 opacity-70">
              <div className="flex items-center justify-between gap-3">
                <span className="flex items-center gap-1 text-xs text-on-surface/50">
                  <Calendar className="w-3 h-3" />
                  {new Date(c.fecha).toLocaleDateString('es-CO', { day: 'numeric', month: 'short', year: 'numeric' })}
                  {c.hora ? ` · ${c.hora}` : ''}
                </span>
                <span className={`text-[10px] px-2.5 py-1 rounded-full font-semibold ${ESTADO_COLOR[c.estado ?? 'realizada']}`}>
                  {c.estado}
                </span>
              </div>
              {c.direccion && <p className="mt-1 text-xs text-on-surface/40">{c.direccion}</p>}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
