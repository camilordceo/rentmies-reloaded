'use client'

import { useState } from 'react'
import { Users, Plus, Filter } from 'lucide-react'
import { KanbanBoard } from '@/components/crm/kanban-board'
import type { Pipeline, PipelineEtapa, Lead, Agente } from '@/lib/types/database'

interface CRMClientProps {
  pipelines: Pipeline[]
  initialEtapas: PipelineEtapa[]
  initialLeads: Lead[]
  agentes: Pick<Agente, 'id' | 'nombre'>[]
  empresaId: string
}

export function CRMClient({ pipelines, initialEtapas, initialLeads, agentes, empresaId }: CRMClientProps) {
  const [selectedPipelineId, setSelectedPipelineId] = useState(pipelines[0]?.id || '')
  const [etapas] = useState<PipelineEtapa[]>(initialEtapas)
  const [leads, setLeads] = useState(initialLeads)
  const [showNewLead, setShowNewLead] = useState(false)
  const [newLead, setNewLead] = useState({ nombre: '', telefono: '', agente_asignado_id: '' })
  const [saving, setSaving] = useState(false)

  const selectedPipeline = pipelines.find(p => p.id === selectedPipelineId)

  async function handleLeadMove(leadId: string, newEtapaId: string) {
    await fetch(`/api/leads/${leadId}`, {
      method: 'PATCH', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ etapa_id: newEtapaId }),
    })
    setLeads(p => p.map(l => l.id === leadId ? { ...l, etapa_id: newEtapaId } : l))
  }

  async function handleCreateLead() {
    if (!newLead.nombre || !etapas[0]) return
    setSaving(true)
    const res = await fetch('/api/leads', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...newLead, empresa_id: empresaId, pipeline_id: selectedPipelineId, etapa_id: etapas[0].id }),
    })
    const { data } = await res.json()
    if (data) { setLeads(p => [data, ...p]); setShowNewLead(false); setNewLead({ nombre: '', telefono: '', agente_asignado_id: '' }) }
    setSaving(false)
  }

  if (pipelines.length === 0) return (
    <div className="flex flex-col items-center justify-center h-64 text-center">
      <div className="w-12 h-12 rounded-xl bg-surface-container flex items-center justify-center mb-4">
        <Users className="w-6 h-6 text-on-surface/30" />
      </div>
      <h3 className="text-base font-semibold text-on-surface mb-1">No hay pipelines configurados</h3>
      <p className="text-sm text-on-surface/50">Contacta al administrador para crear tu primer pipeline.</p>
    </div>
  )

  return (
    <div className="flex flex-col h-[calc(100vh-theme(spacing.28))] -m-4 lg:-m-6">
      {/* Header */}
      <div className="flex-shrink-0 flex items-center justify-between px-4 lg:px-6 py-4 bg-surface">
        <div className="flex items-center gap-3">
          <div>
            <p className="text-[11px] font-bold uppercase tracking-[0.15em] text-authority-green">AI CRM</p>
            <h1 className="text-xl font-bold tracking-tight text-on-surface leading-tight">Pipeline de Ventas</h1>
          </div>
          {pipelines.length > 1 && (
            <select
              value={selectedPipelineId}
              onChange={e => setSelectedPipelineId(e.target.value)}
              className="h-8 px-3 text-xs bg-surface-container rounded-lg text-on-surface outline-none focus:ring-2 focus:ring-brand-teal/30"
            >
              {pipelines.map(p => <option key={p.id} value={p.id}>{p.nombre}</option>)}
            </select>
          )}
        </div>
        <div className="flex items-center gap-2">
          <button className="flex items-center gap-1.5 px-3 py-2 text-xs text-on-surface/50 bg-surface-container rounded-lg hover:bg-surface-container-high transition-all">
            <Filter className="w-3.5 h-3.5" />Filtros
          </button>
          <button
            onClick={() => setShowNewLead(true)}
            className="flex items-center gap-1.5 px-3 py-2 bg-authority-green text-white text-xs font-semibold rounded-lg hover:bg-authority-green/90 transition-all"
          >
            <Plus className="w-3.5 h-3.5" />Nuevo Lead
          </button>
        </div>
      </div>

      {selectedPipeline && (
        <div className="flex-shrink-0 px-4 lg:px-6 py-2 bg-surface-container-low">
          <p className="text-xs text-on-surface/50">
            Pipeline: <span className="font-semibold text-on-surface">{selectedPipeline.nombre}</span>
            <span className="ml-3">· {leads.length} leads totales</span>
          </p>
        </div>
      )}

      {/* New lead modal */}
      {showNewLead && (
        <div className="fixed inset-0 bg-on-surface/40 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={() => setShowNewLead(false)}>
          <div className="bg-surface-container-lowest rounded-2xl p-6 max-w-sm w-full shadow-editorial" onClick={e => e.stopPropagation()}>
            <p className="text-[11px] font-bold uppercase tracking-[0.15em] text-authority-green mb-1">NUEVO CONTACTO</p>
            <h3 className="text-lg font-bold text-on-surface mb-5">Crear Lead</h3>
            <div className="space-y-3">
              {[['nombre', 'Nombre completo *', 'text'], ['telefono', 'Teléfono', 'tel']].map(([k, p, t]) => (
                <input
                  key={k}
                  type={t}
                  placeholder={p}
                  value={(newLead as any)[k]}
                  onChange={e => setNewLead(prev => ({ ...prev, [k]: e.target.value }))}
                  className="w-full h-10 px-3 bg-surface-container rounded-lg text-sm text-on-surface placeholder:text-on-surface/35 outline-none focus:ring-2 focus:ring-brand-teal/30 transition-all"
                />
              ))}
              <select
                value={newLead.agente_asignado_id}
                onChange={e => setNewLead(p => ({ ...p, agente_asignado_id: e.target.value }))}
                className="w-full h-10 px-3 bg-surface-container rounded-lg text-sm text-on-surface outline-none focus:ring-2 focus:ring-brand-teal/30 transition-all"
              >
                <option value="">Sin agente asignado</option>
                {agentes.map(a => <option key={a.id} value={a.id}>{a.nombre}</option>)}
              </select>
            </div>
            <div className="flex gap-2 mt-5">
              <button
                onClick={handleCreateLead}
                disabled={saving || !newLead.nombre}
                className="flex-1 py-2.5 bg-authority-green text-white text-sm font-semibold rounded-xl hover:bg-authority-green/90 disabled:opacity-50 transition-all"
              >
                {saving ? 'Creando...' : 'Crear Lead'}
              </button>
              <button
                onClick={() => setShowNewLead(false)}
                className="px-4 py-2.5 text-sm text-on-surface/50 hover:text-on-surface transition-colors"
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Kanban */}
      <div className="flex-1 overflow-x-auto p-4 lg:p-6 min-h-0">
        {etapas.length > 0 ? (
          <KanbanBoard etapas={etapas} leads={leads} onLeadMove={handleLeadMove} onNewLead={() => setShowNewLead(true)} />
        ) : (
          <div className="flex items-center justify-center h-full text-sm text-on-surface/40">
            Este pipeline no tiene etapas configuradas
          </div>
        )}
      </div>
    </div>
  )
}
