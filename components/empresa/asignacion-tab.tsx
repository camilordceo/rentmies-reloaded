'use client'

import { useState } from 'react'
import { Save } from 'lucide-react'
import type { Agente } from '@/lib/types/database'
import { DIAS_SEMANA } from '@/lib/constants'

export function AsignacionTab({ agentes, empresaId }: { agentes: Agente[]; empresaId: string }) {
  const [activo, setActivo] = useState(false)
  const [subTab, setSubTab] = useState('por_dia')
  const [asignacion, setAsignacion] = useState<Record<string, string>>({})
  const [saving, setSaving] = useState(false)

  async function handleSave() {
    setSaving(true)
    await fetch('/api/asignacion-automatica', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ empresa_id: empresaId, metodo: subTab, activo, configuracion: asignacion }),
    })
    setSaving(false)
  }

  return (
    <div className="max-w-2xl space-y-6">
      {/* Toggle */}
      <div className="flex items-center gap-4 bg-surface-container rounded-xl p-4">
        <button
          onClick={() => setActivo(!activo)}
          className={`relative w-10 h-6 rounded-full transition-colors flex-shrink-0 ${activo ? 'bg-brand-teal' : 'bg-surface-container-highest'}`}
        >
          <span className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow transition-transform ${activo ? 'translate-x-5' : 'translate-x-1'}`} />
        </button>
        <div className="flex-1">
          <p className="text-sm font-semibold text-on-surface">Asignación Automática</p>
          <p className="text-xs text-on-surface/50">Asigna automáticamente leads entrantes a agentes</p>
        </div>
        <span className={`px-2.5 py-1 rounded-full text-xs font-semibold transition-all ${activo ? 'bg-brand-teal/10 text-brand-teal' : 'bg-surface-container-highest text-on-surface/50'}`}>
          {activo ? 'Activa' : 'Inactiva'}
        </span>
      </div>

      {/* Sub-tabs */}
      <div className="flex items-center gap-1 bg-surface-container rounded-xl p-1 w-fit">
        {[['por_dia', 'Por día'], ['crm', 'CRM'], ['carga_manual', 'Carga manual'], ['consultar', 'Consultar']].map(([k, l]) => (
          <button
            key={k}
            onClick={() => setSubTab(k)}
            className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-all ${subTab === k ? 'bg-surface-container-lowest text-on-surface shadow-editorial' : 'text-on-surface/50 hover:text-on-surface'}`}
          >
            {l}
          </button>
        ))}
      </div>

      {subTab === 'por_dia' && (
        <div className="space-y-4">
          <p className="text-sm text-on-surface/60">Asigna un agente responsable para cada día de la semana.</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {DIAS_SEMANA.map(({ key, label }) => (
              <div key={key} className="space-y-1.5">
                <label className="text-xs font-medium text-on-surface/50">{label}</label>
                <select
                  value={asignacion[key] || ''}
                  onChange={e => setAsignacion(p => ({ ...p, [key]: e.target.value }))}
                  className="w-full h-10 px-3 bg-surface-container rounded-lg text-sm text-on-surface outline-none focus:ring-2 focus:ring-brand-teal/30 transition-all"
                >
                  <option value="">Seleccione Agente</option>
                  {agentes.map(a => <option key={a.id} value={a.id}>{a.nombre}</option>)}
                </select>
              </div>
            ))}
          </div>
          <button
            onClick={handleSave}
            disabled={saving}
            className="flex items-center gap-2 px-4 py-2 bg-authority-green text-white text-sm font-semibold rounded-lg hover:bg-authority-green/90 disabled:opacity-50 transition-all"
          >
            <Save className="w-3.5 h-3.5" />{saving ? 'Guardando...' : 'Aplicar cambios'}
          </button>
        </div>
      )}
      {subTab !== 'por_dia' && (
        <div className="py-12 text-center">
          <p className="text-sm text-on-surface/40">Configuración de {subTab} próximamente</p>
        </div>
      )}
    </div>
  )
}
