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
      <div className="flex items-center gap-3 bg-white border border-[#e5e5e5] rounded-xl p-4">
        <button onClick={() => setActivo(!activo)}
          className={`relative w-10 h-6 rounded-full transition-colors ${activo ? 'bg-[#40d99d]' : 'bg-[#e5e5e5]'}`}>
          <span className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow transition-transform ${activo ? 'translate-x-5' : 'translate-x-1'}`} />
        </button>
        <div>
          <p className="text-sm font-medium text-[#1a1a1a]">Asignación Automática</p>
          <p className="text-xs text-[#6b7280]">Asigna automáticamente leads entrantes a agentes</p>
        </div>
        <span className={`ml-auto px-2 py-0.5 rounded-full text-xs font-medium ${activo ? 'bg-[#40d99d]/10 text-[#40d99d]' : 'bg-[#f0f0f0] text-[#6b7280]'}`}>
          {activo ? 'Activa' : 'Inactiva'}
        </span>
      </div>

      {/* Sub-tabs */}
      <div className="flex items-center gap-1 bg-[#f0f0f0] rounded-lg p-1 w-fit">
        {[['por_dia','Por día'],['crm','CRM'],['carga_manual','Carga manual'],['consultar','Consultar']].map(([k,l]) => (
          <button key={k} onClick={() => setSubTab(k)}
            className={`px-3 py-1.5 text-xs font-medium rounded-md transition-all ${subTab===k?'bg-white text-[#1a1a1a] shadow-sm':'text-[#6b7280]'}`}>{l}</button>
        ))}
      </div>

      {subTab === 'por_dia' && (
        <div className="space-y-4">
          <p className="text-sm text-[#6b7280]">Asigna un agente responsable para cada día de la semana.</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {DIAS_SEMANA.map(({ key, label }) => (
              <div key={key} className="space-y-1.5">
                <label className="text-xs font-medium text-[#1a1a1a]">{label}</label>
                <select value={asignacion[key] || ''} onChange={e => setAsignacion(p => ({ ...p, [key]: e.target.value }))}
                  className="w-full h-9 px-3 border border-[#e5e5e5] rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[#40d99d]">
                  <option value="">Seleccione Agente</option>
                  {agentes.map(a => <option key={a.id} value={a.id}>{a.nombre}</option>)}
                </select>
              </div>
            ))}
          </div>
          <button onClick={handleSave} disabled={saving}
            className="flex items-center gap-2 px-4 py-2 bg-[#40d99d] text-white text-sm font-medium rounded-lg hover:bg-[#40d99d]/90 disabled:opacity-50">
            <Save className="w-4 h-4" />{saving ? 'Guardando...' : 'Aplicar cambios'}
          </button>
        </div>
      )}
      {subTab !== 'por_dia' && (
        <div className="py-12 text-center text-sm text-[#6b7280]">Configuración de {subTab} próximamente</div>
      )}
    </div>
  )
}
