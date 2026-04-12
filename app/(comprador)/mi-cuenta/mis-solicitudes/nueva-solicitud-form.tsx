'use client'

import { useState } from 'react'
import { Plus, X, CheckCircle2 } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

const TIPOS = [
  { value: 'peticion', label: 'Petición' },
  { value: 'queja', label: 'Queja' },
  { value: 'reclamo', label: 'Reclamo' },
  { value: 'sugerencia', label: 'Sugerencia' },
  { value: 'otro', label: 'Otro' },
]

interface Props {
  compradorId: string
  empresaId: string
}

export default function NuevaSolicitudForm({ compradorId, empresaId }: Props) {
  const [open, setOpen] = useState(false)
  const [tipo, setTipo] = useState('peticion')
  const [asunto, setAsunto] = useState('')
  const [descripcion, setDescripcion] = useState('')
  const [loading, setLoading] = useState(false)
  const [done, setDone] = useState(false)
  const [error, setError] = useState('')

  async function submit() {
    if (!asunto.trim() || !descripcion.trim()) { setError('Completa todos los campos.'); return }
    setLoading(true); setError('')
    const supabase = createClient()
    const { error: err } = await supabase.from('solicitudes').insert({
      comprador_id: compradorId,
      empresa_id: empresaId,
      tipo, asunto: asunto.trim(), descripcion: descripcion.trim(),
    })
    setLoading(false)
    if (err) { setError('Error al enviar. Intenta de nuevo.'); return }
    setDone(true)
    setTimeout(() => { setOpen(false); setDone(false); setAsunto(''); setDescripcion(''); location.reload() }, 1500)
  }

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="flex items-center gap-1.5 text-sm font-semibold px-4 py-2 bg-authority-green text-white rounded-lg hover:bg-authority-green/90 transition-all"
      >
        <Plus className="w-3.5 h-3.5" />Nueva solicitud
      </button>
    )
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-on-surface/40 backdrop-blur-sm p-4">
      <div className="bg-surface-container-lowest rounded-2xl w-full max-w-md p-6 space-y-5 shadow-editorial">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-[11px] font-bold uppercase tracking-[0.15em] text-authority-green">NUEVA SOLICITUD</p>
            <h3 className="text-lg font-bold text-on-surface">PQRS</h3>
          </div>
          <button
            onClick={() => setOpen(false)}
            className="text-on-surface/40 hover:text-on-surface transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {done ? (
          <div className="py-8 text-center space-y-3">
            <div className="w-14 h-14 rounded-xl bg-brand-teal/10 flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-7 h-7 text-brand-teal" />
            </div>
            <p className="text-sm font-semibold text-on-surface">Solicitud enviada</p>
          </div>
        ) : (
          <>
            <div className="space-y-4">
              <div>
                <label className="text-xs font-medium text-on-surface/50 mb-2 block">Tipo de solicitud</label>
                <div className="flex flex-wrap gap-2">
                  {TIPOS.map(t => (
                    <button
                      key={t.value}
                      onClick={() => setTipo(t.value)}
                      className={`text-xs px-3 py-1.5 rounded-full font-medium transition-all ${
                        tipo === t.value
                          ? 'bg-brand-teal text-white'
                          : 'bg-surface-container text-on-surface/60 hover:text-on-surface'
                      }`}
                    >
                      {t.label}
                    </button>
                  ))}
                </div>
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-on-surface/50">Asunto</label>
                <input
                  value={asunto}
                  onChange={e => setAsunto(e.target.value)}
                  placeholder="Breve descripción del tema"
                  className="w-full h-10 px-3 bg-surface-container rounded-lg text-sm text-on-surface placeholder:text-on-surface/35 outline-none focus:ring-2 focus:ring-brand-teal/30 transition-all"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-on-surface/50">Descripción</label>
                <textarea
                  value={descripcion}
                  onChange={e => setDescripcion(e.target.value)}
                  rows={4}
                  placeholder="Detalla tu solicitud..."
                  className="w-full px-3 py-2.5 bg-surface-container rounded-lg text-sm text-on-surface placeholder:text-on-surface/35 outline-none focus:ring-2 focus:ring-brand-teal/30 transition-all resize-none"
                />
              </div>
            </div>
            {error && (
              <div className="px-3 py-2 bg-red-50 rounded-lg">
                <p className="text-xs text-red-600">{error}</p>
              </div>
            )}
            <button
              onClick={submit}
              disabled={loading}
              className="w-full py-3 bg-authority-green text-white text-sm font-semibold rounded-xl hover:bg-authority-green/90 transition-all disabled:opacity-50"
            >
              {loading ? 'Enviando...' : 'Enviar solicitud'}
            </button>
          </>
        )}
      </div>
    </div>
  )
}
