export const dynamic = 'force-dynamic'

import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { MessageSquare } from 'lucide-react'
import NuevaSolicitudForm from './nueva-solicitud-form'

const TIPO_LABEL: Record<string, string> = {
  peticion: 'Petición', queja: 'Queja', reclamo: 'Reclamo', sugerencia: 'Sugerencia', otro: 'Otro',
}

const ESTADO_MAP: Record<string, { label: string; color: string }> = {
  abierta:    { label: 'Abierta',    color: 'bg-amber-50 text-amber-700' },
  en_proceso: { label: 'En proceso', color: 'bg-blue-50 text-blue-700' },
  resuelta:   { label: 'Resuelta',   color: 'bg-brand-teal/10 text-brand-teal' },
  cerrada:    { label: 'Cerrada',    color: 'bg-surface-container text-on-surface/50' },
}

export default async function MisSolicitudesPage() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase.from('profiles').select('rol').eq('id', user.id).single()
  if (profile?.rol !== 'comprador') redirect('/dashboard')

  const db = createAdminClient()
  const { data: comprador } = await db.from('compradores').select('id, empresa_id').eq('profile_id', user.id).single()
  if (!comprador) redirect('/mi-cuenta')

  const { data: solicitudes } = await db
    .from('solicitudes')
    .select('id, tipo, asunto, descripcion, estado, respuesta, created_at, updated_at')
    .eq('comprador_id', comprador.id)
    .order('created_at', { ascending: false })

  const activas = solicitudes?.filter(s => ['abierta', 'en_proceso'].includes(s.estado)) ?? []
  const cerradas = solicitudes?.filter(s => ['resuelta', 'cerrada'].includes(s.estado)) ?? []

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Eyebrow + title */}
      <div className="flex items-start justify-between">
        <div>
          <p className="text-[11px] font-bold uppercase tracking-[0.15em] text-authority-green mb-1">PQRS</p>
          <h1 className="text-3xl font-bold tracking-tight text-on-surface">Solicitudes</h1>
          <p className="text-on-surface/50 text-sm mt-1">{activas.length} activas</p>
        </div>
        <NuevaSolicitudForm compradorId={comprador.id} empresaId={comprador.empresa_id ?? ''} />
      </div>

      {!solicitudes?.length && (
        <div className="bg-surface-container-lowest rounded-xl p-12 text-center shadow-editorial">
          <div className="w-12 h-12 rounded-xl bg-surface-container flex items-center justify-center mx-auto mb-4">
            <MessageSquare className="w-6 h-6 text-on-surface/30" />
          </div>
          <p className="text-sm font-semibold text-on-surface mb-1">No tienes solicitudes todavía</p>
          <p className="text-xs text-on-surface/50">Usa el botón &quot;Nueva solicitud&quot; para crear una.</p>
        </div>
      )}

      {/* Activas */}
      {activas.length > 0 && (
        <div className="space-y-3">
          <p className="text-[10px] font-bold uppercase tracking-widest text-on-surface/40">ACTIVAS</p>
          {activas.map(s => {
            const estado = ESTADO_MAP[s.estado] ?? ESTADO_MAP.abierta
            return (
              <div key={s.id} className="bg-surface-container-lowest rounded-xl p-5 shadow-editorial">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 flex-wrap mb-2">
                      <span className="text-[10px] text-on-surface/50 bg-surface-container px-2.5 py-1 rounded-full font-medium">
                        {TIPO_LABEL[s.tipo] ?? s.tipo}
                      </span>
                      <span className={`text-[10px] px-2.5 py-1 rounded-full font-semibold ${estado.color}`}>
                        {estado.label}
                      </span>
                    </div>
                    <p className="text-sm font-semibold text-on-surface">{s.asunto}</p>
                    <p className="text-xs text-on-surface/50 mt-1 line-clamp-2">{s.descripcion}</p>
                    {s.respuesta && (
                      <div className="mt-3 p-3 bg-brand-teal/5 rounded-xl">
                        <p className="text-[10px] font-bold uppercase tracking-wide text-brand-teal mb-1">Respuesta del equipo</p>
                        <p className="text-xs text-on-surface/70">{s.respuesta}</p>
                      </div>
                    )}
                  </div>
                  <p className="text-[10px] text-on-surface/40 flex-shrink-0">
                    {new Date(s.created_at).toLocaleDateString('es-CO', { day: 'numeric', month: 'short' })}
                  </p>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* Historial */}
      {cerradas.length > 0 && (
        <div className="space-y-3">
          <p className="text-[10px] font-bold uppercase tracking-widest text-on-surface/40">HISTORIAL</p>
          {cerradas.map(s => {
            const estado = ESTADO_MAP[s.estado] ?? ESTADO_MAP.cerrada
            return (
              <div key={s.id} className="bg-surface-container rounded-xl p-4 opacity-70">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="text-sm font-semibold text-on-surface">{s.asunto}</p>
                    <p className="text-xs text-on-surface/50">
                      {TIPO_LABEL[s.tipo]} · {new Date(s.created_at).toLocaleDateString('es-CO', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </p>
                  </div>
                  <span className={`text-[10px] px-2.5 py-1 rounded-full font-semibold flex-shrink-0 ${estado.color}`}>
                    {estado.label}
                  </span>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
