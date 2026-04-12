'use client'

import { useState, FormEvent } from 'react'
import { usePortalAgent } from '@/store/portal-agent-store'

export function SchedulingOverlay() {
  const property = usePortalAgent((s) => s.schedulingProperty)
  const setSchedulingProperty = usePortalAgent((s) => s.setSchedulingProperty)

  const [nombre, setNombre] = useState('')
  const [telefono, setTelefono] = useState('')
  const [fecha, setFecha] = useState('')
  const [notas, setNotas] = useState('')
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle')

  if (!property) return null

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    if (!nombre || !telefono || !fecha) return
    setStatus('loading')

    try {
      const res = await fetch('/api/agendar', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          nombre_contacto: nombre,
          telefono,
          fecha_hora: fecha,
          notas,
          codigo_inmueble: property.codigo,
          tipo_negocio: property.tipo_negocio,
        }),
      })
      if (!res.ok) throw new Error('Server error')
      setStatus('success')
    } catch {
      setStatus('error')
    }
  }

  const handleClose = () => {
    setSchedulingProperty(null)
    setStatus('idle')
    setNombre('')
    setTelefono('')
    setFecha('')
    setNotas('')
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end md:items-center justify-center bg-black/40 backdrop-blur-sm p-4">
      <div className="w-full max-w-md bg-surface rounded-2xl shadow-editorial overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-outline-variant/20">
          <div>
            <h2 className="text-sm font-semibold text-on-surface">Agendar visita</h2>
            <p className="text-xs text-on-surface/50 mt-0.5">
              {property.ubicacion ?? property.codigo}
            </p>
          </div>
          <button
            onClick={handleClose}
            className="w-8 h-8 flex items-center justify-center rounded-full text-on-surface/40 hover:text-on-surface hover:bg-surface-container transition-colors"
          >
            ✕
          </button>
        </div>

        {status === 'success' ? (
          <div className="flex flex-col items-center gap-4 px-5 py-8 text-center">
            <div className="w-12 h-12 rounded-full bg-brand-teal/15 flex items-center justify-center">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-6 h-6 text-authority-green" aria-hidden>
                <path d="M20 6L9 17l-5-5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
            <div>
              <p className="text-sm font-semibold text-on-surface">¡Cita agendada!</p>
              <p className="text-xs text-on-surface/60 mt-1">
                Te contactaremos para confirmar los detalles.
              </p>
            </div>
            <button
              onClick={handleClose}
              className="text-xs text-authority-green hover:underline"
            >
              Cerrar
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="px-5 py-4 space-y-3">
            <div className="space-y-1">
              <label className="text-xs font-medium text-on-surface/70" htmlFor="sched-nombre">
                Nombre completo
              </label>
              <input
                id="sched-nombre"
                type="text"
                required
                value={nombre}
                onChange={(e) => setNombre(e.target.value)}
                placeholder="Tu nombre"
                className="w-full px-3 py-2 text-sm rounded-lg bg-surface-container border border-outline-variant/30 text-on-surface placeholder:text-on-surface/40 outline-none focus:border-brand-teal transition-colors"
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-medium text-on-surface/70" htmlFor="sched-tel">
                Teléfono / WhatsApp
              </label>
              <input
                id="sched-tel"
                type="tel"
                required
                value={telefono}
                onChange={(e) => setTelefono(e.target.value)}
                placeholder="+57 300 000 0000"
                className="w-full px-3 py-2 text-sm rounded-lg bg-surface-container border border-outline-variant/30 text-on-surface placeholder:text-on-surface/40 outline-none focus:border-brand-teal transition-colors"
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-medium text-on-surface/70" htmlFor="sched-fecha">
                Fecha y hora preferida
              </label>
              <input
                id="sched-fecha"
                type="datetime-local"
                required
                value={fecha}
                onChange={(e) => setFecha(e.target.value)}
                min={new Date().toISOString().slice(0, 16)}
                className="w-full px-3 py-2 text-sm rounded-lg bg-surface-container border border-outline-variant/30 text-on-surface outline-none focus:border-brand-teal transition-colors"
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-medium text-on-surface/70" htmlFor="sched-notas">
                Notas (opcional)
              </label>
              <textarea
                id="sched-notas"
                value={notas}
                onChange={(e) => setNotas(e.target.value)}
                placeholder="Horarios preferidos, preguntas…"
                rows={2}
                className="w-full px-3 py-2 text-sm rounded-lg bg-surface-container border border-outline-variant/30 text-on-surface placeholder:text-on-surface/40 outline-none focus:border-brand-teal transition-colors resize-none"
              />
            </div>

            {status === 'error' && (
              <p className="text-xs text-destructive">
                No se pudo agendar. Intenta de nuevo o contáctanos por WhatsApp.
              </p>
            )}

            <button
              type="submit"
              disabled={status === 'loading'}
              className="w-full py-2.5 rounded-xl bg-authority-green text-white text-sm font-semibold hover:bg-authority-green/90 transition-colors disabled:opacity-60"
            >
              {status === 'loading' ? 'Agendando…' : 'Confirmar visita'}
            </button>
          </form>
        )}
      </div>
    </div>
  )
}
