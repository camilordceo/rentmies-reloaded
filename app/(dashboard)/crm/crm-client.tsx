'use client'

import { useState } from 'react'
import { Users, Plus, ChevronDown, Filter } from 'lucide-react'
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
      <Users className="w-12 h-12 text-[#e5e5e5] mb-3" />
      <h3 className="text-base font-medium text-[#1a1a1a] mb-1">No hay pipelines configurados</h3>
      <p className="text-sm text-[#6b7280]">Contacta al administrador para crear tu primer pipeline.</p>
    </div>
  )

  return (
    <div className="flex flex-col h-[calc(100vh-theme(spacing.28))] -m-4 lg:-m-6">
      {/* Header */}
      <div className="flex-shrink-0 flex items-center justify-between px-4 lg:px-6 py-4 bg-white border-b border-[#e5e5e5]">
        <div className="flex items-center gap-3">
          <h1 className="text-lg font-medium text-[#1a1a1a]">AI CRM</h1>
          {pipelines.length > 1 && (
            <select value={selectedPipelineId} onChange={e => setSelectedPipelineId(e.target.value)}
              className="h-8 px-3 text-sm border border-[#e5e5e5] rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-[#40d99d]">
              {pipelines.map(p => <option key={p.id} value={p.id}>{p.nombre}</option>)}
            </select>
          )}
        </div>
        <div className="flex items-center gap-2">
          <button className="flex items-center gap-1.5 px-3 py-2 text-xs text-[#6b7280] border border-[#e5e5e5] rounded-lg hover:bg-[#f8f8f8] transition-all">
            <Filter className="w-3.5 h-3.5" />Filtros
          </button>
          <button onClick={() => setShowNewLead(true)}
            className="flex items-center gap-1.5 px-3 py-2 bg-[#40d99d] text-white text-xs font-medium rounded-lg hover:bg-[#40d99d]/90 transition-all">
            <Plus className="w-3.5 h-3.5" />Nuevo Lead
          </button>
        </div>
      </div>

      {selectedPipeline && (
        <p className="flex-shrink-0 px-4 lg:px-6 py-2 text-xs text-[#6b7280] bg-[#f8f8f8] border-b border-[#e5e5e5]">
          Pipeline: <span className="font-medium text-[#1a1a1a]">{selectedPipeline.nombre}</span>
          <span className="ml-3 text-[#6b7280]">· {leads.length} leads totales</span>
        </p>
      )}

      {/* New lead modal */}
      {showNewLead && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={() => setShowNewLead(false)}>
          <div className="bg-white rounded-2xl p-6 max-w-sm w-full shadow-xl" onClick={e => e.stopPropagation()}>
            <h3 className="text-base font-medium text-[#1a1a1a] mb-4">Nuevo Lead</h3>
            <div className="space-y-3">
              {[['nombre','Nombre completo *','text'],['telefono','Teléfono','tel']].map(([k,p,t]) => (
                <input key={k} type={t} placeholder={p} value={(newLead as any)[k]} onChange={e => setNewLead(prev => ({...prev,[k]:e.target.value}))}
                  className="w-full h-10 px-3 border border-[#e5e5e5] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#40d99d]" />
              ))}
              <select value={newLead.agente_asignado_id} onChange={e => setNewLead(p => ({...p,agente_asignado_id:e.target.value}))}
                className="w-full h-10 px-3 border border-[#e5e5e5] rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[#40d99d]">
                <option value="">Sin agente asignado</option>
                {agentes.map(a => <option key={a.id} value={a.id}>{a.nombre}</option>)}
              </select>
            </div>
            <div className="flex gap-2 mt-4">
              <button onClick={handleCreateLead} disabled={saving || !newLead.nombre}
                className="flex-1 py-2.5 bg-[#40d99d] text-white text-sm font-medium rounded-xl hover:bg-[#40d99d]/90 disabled:opacity-50 transition-all">
                {saving ? 'Creando...' : 'Crear Lead'}
              </button>
              <button onClick={() => setShowNewLead(false)} className="px-4 py-2.5 text-sm text-[#6b7280] hover:text-[#1a1a1a]">Cancelar</button>
            </div>
          </div>
        </div>
      )}

      {/* Kanban */}
      <div className="flex-1 overflow-x-auto p-4 lg:p-6 min-h-0">
        {etapas.length > 0 ? (
          <KanbanBoard etapas={etapas} leads={leads} onLeadMove={handleLeadMove} onNewLead={() => setShowNewLead(true)} />
        ) : (
          <div className="flex items-center justify-center h-full text-sm text-[#6b7280]">Este pipeline no tiene etapas configuradas</div>
        )}
      </div>
    </div>
  )
}
