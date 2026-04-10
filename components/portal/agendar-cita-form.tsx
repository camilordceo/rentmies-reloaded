'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Calendar, CheckCircle2 } from 'lucide-react'

interface AgendarCitaFormProps {
  property: any | null
  empresaId: string
  onClose: () => void
}

const HORARIOS = ['Mañana ☀️', 'Tarde 🌅', 'Flexible 🔄']
const FECHAS_RAPIDAS = ['Hoy', 'Mañana', 'Esta semana']

export function AgendarCitaForm({ property, empresaId, onClose }: AgendarCitaFormProps) {
  const [nombre, setNombre] = useState('')
  const [telefono, setTelefono] = useState('')
  const [fecha, setFecha] = useState('')
  const [horario, setHorario] = useState('')
  const [loading, setLoading] = useState(false)
  const [done, setDone] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!nombre || !telefono || !fecha) return
    setLoading(true)
    try {
      await fetch('/api/agendar', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          empresa_id: empresaId,
          propiedad_codigo: property?.codigo,
          nombre_contacto: nombre,
          telefono,
          fecha_preferida: `${fecha} ${horario}`.trim(),
        }),
      })
      setDone(true)
    } finally {
      setLoading(false)
    }
  }

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 z-50 flex items-end justify-center"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      >
        <div className="absolute inset-0 bg-black/40" onClick={onClose} />
        <motion.div
          className="relative w-full max-w-lg bg-white rounded-t-3xl p-6 pb-8"
          initial={{ y: '100%' }}
          animate={{ y: 0 }}
          exit={{ y: '100%' }}
          transition={{ type: 'spring', stiffness: 300, damping: 30 }}
        >
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-base font-semibold text-[#1a1a1a]">Agendar visita</h2>
            <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-[#f0f0f0] transition-colors">
              <X className="w-4 h-4 text-[#6b7280]" />
            </button>
          </div>

          {property && (
            <p className="text-xs text-[#6b7280] mb-4 pb-4 border-b border-[#e5e5e5]">
              {property.tipo ?? property.tipo_inmueble} · {property.ubicacion ?? property.ciudad} · #{property.codigo}
            </p>
          )}

          {done ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center py-6"
            >
              <CheckCircle2 className="w-12 h-12 text-[#40d99d] mx-auto mb-3" />
              <p className="font-medium text-[#1a1a1a]">¡Visita agendada!</p>
              <p className="text-sm text-[#6b7280] mt-1">Un agente te contactará por WhatsApp para confirmar.</p>
              <button onClick={onClose} className="mt-4 text-sm text-[#40d99d] hover:underline">Cerrar</button>
            </motion.div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="text-xs font-medium text-[#6b7280] mb-1 block">Nombre completo</label>
                <input
                  value={nombre}
                  onChange={(e) => setNombre(e.target.value)}
                  placeholder="Tu nombre"
                  required
                  className="w-full text-sm px-4 py-3 rounded-xl bg-[#f0f0f0] border border-transparent focus:border-[#40d99d] focus:bg-white outline-none transition-colors"
                />
              </div>
              <div>
                <label className="text-xs font-medium text-[#6b7280] mb-1 block">Teléfono WhatsApp</label>
                <input
                  value={telefono}
                  onChange={(e) => setTelefono(e.target.value)}
                  placeholder="+57 300 000 0000"
                  required
                  className="w-full text-sm px-4 py-3 rounded-xl bg-[#f0f0f0] border border-transparent focus:border-[#40d99d] focus:bg-white outline-none transition-colors"
                />
              </div>
              <div>
                <label className="text-xs font-medium text-[#6b7280] mb-2 block">¿Cuándo te gustaría visitarlo?</label>
                <div className="flex gap-2 flex-wrap">
                  {FECHAS_RAPIDAS.map((f) => (
                    <button
                      key={f}
                      type="button"
                      onClick={() => setFecha(f)}
                      className={`text-xs px-3 py-2 rounded-xl border transition-colors ${
                        fecha === f ? 'border-[#40d99d] bg-[#40d99d]/10 text-[#40d99d]' : 'border-[#e5e5e5] text-[#6b7280] hover:border-[#40d99d]'
                      }`}
                    >
                      {f}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="text-xs font-medium text-[#6b7280] mb-2 block">Horario preferido</label>
                <div className="flex gap-2">
                  {HORARIOS.map((h) => (
                    <button
                      key={h}
                      type="button"
                      onClick={() => setHorario(h)}
                      className={`flex-1 text-xs px-3 py-2 rounded-xl border transition-colors ${
                        horario === h ? 'border-[#40d99d] bg-[#40d99d]/10 text-[#40d99d]' : 'border-[#e5e5e5] text-[#6b7280] hover:border-[#40d99d]'
                      }`}
                    >
                      {h}
                    </button>
                  ))}
                </div>
              </div>
              <button
                type="submit"
                disabled={loading || !nombre || !telefono || !fecha}
                className="w-full flex items-center justify-center gap-2 py-3.5 bg-[#40d99d] text-white font-medium rounded-xl hover:bg-[#40d99d]/90 disabled:opacity-50 transition-all"
              >
                <Calendar className="w-4 h-4" />
                {loading ? 'Agendando...' : 'Confirmar visita'}
              </button>
              <p className="text-xs text-center text-[#6b7280]">
                Un agente te contactará por WhatsApp para confirmar la cita.
              </p>
            </form>
          )}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}
