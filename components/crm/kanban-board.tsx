'use client'

import { useState, useCallback } from 'react'
import { DragDropContext, Droppable, Draggable, DropResult } from '@hello-pangea/dnd'
import { Plus, Phone, MessageSquare, MoreVertical, Users } from 'lucide-react'
import { formatRelativeTime } from '@/lib/utils'
import type { Lead, PipelineEtapa, Agente } from '@/lib/types/database'

interface LeadWithEtapa extends Lead { etapa?: PipelineEtapa | null; agente?: Agente | null }

interface KanbanBoardProps {
  etapas: PipelineEtapa[]
  leads: LeadWithEtapa[]
  onLeadMove: (leadId: string, newEtapaId: string) => Promise<void>
  onNewLead: () => void
}

export function KanbanBoard({ etapas, leads, onLeadMove, onNewLead }: KanbanBoardProps) {
  const [localLeads, setLocalLeads] = useState(leads)

  const getLeadsForEtapa = useCallback((etapaId: string) =>
    localLeads.filter(l => l.etapa_id === etapaId).sort((a, b) =>
      new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime()
    ), [localLeads])

  async function onDragEnd(result: DropResult) {
    if (!result.destination) return
    const { draggableId, destination } = result
    const newEtapaId = destination.droppableId
    const lead = localLeads.find(l => l.id === draggableId)
    if (!lead || lead.etapa_id === newEtapaId) return

    setLocalLeads(p => p.map(l => l.id === draggableId ? { ...l, etapa_id: newEtapaId } : l))
    await onLeadMove(draggableId, newEtapaId)
  }

  return (
    <DragDropContext onDragEnd={onDragEnd}>
      <div className="flex gap-3 overflow-x-auto pb-4 min-h-0">
        {etapas.map(etapa => {
          const etapaLeads = getLeadsForEtapa(etapa.id)
          return (
            <div key={etapa.id} className="flex-shrink-0 w-72">
              {/* Column header */}
              <div className="flex items-center justify-between mb-3 px-1">
                <div className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-full" style={{ background: etapa.color }} />
                  <span className="text-sm font-medium text-[#1a1a1a]">{etapa.nombre}</span>
                  <span className="text-xs text-[#6b7280] bg-[#f0f0f0] px-1.5 py-0.5 rounded-full">{etapaLeads.length}</span>
                </div>
                <button className="text-[#6b7280] hover:text-[#1a1a1a] transition-colors">
                  <MoreVertical className="w-4 h-4" />
                </button>
              </div>

              <Droppable droppableId={etapa.id}>
                {(provided, snapshot) => (
                  <div ref={provided.innerRef} {...provided.droppableProps}
                    className={`min-h-32 rounded-xl space-y-2 transition-colors ${snapshot.isDraggingOver ? 'bg-[#40d99d]/5' : 'bg-[#f8f8f8]'} p-2`}>
                    {etapaLeads.map((lead, idx) => (
                      <Draggable key={lead.id} draggableId={lead.id} index={idx}>
                        {(prov, snap) => (
                          <div ref={prov.innerRef} {...prov.draggableProps} {...prov.dragHandleProps}
                            className={`bg-white border rounded-xl p-3 shadow-sm transition-all cursor-grab active:cursor-grabbing ${snap.isDragging ? 'shadow-md border-[#40d99d] rotate-1' : 'border-[#e5e5e5] hover:border-[#40d99d]/50'}`}>
                            <div className="flex items-start justify-between mb-2">
                              <p className="text-sm font-medium text-[#1a1a1a] leading-tight">{lead.nombre}</p>
                              <button className="text-[#6b7280] hover:text-[#1a1a1a] ml-2 flex-shrink-0"><MoreVertical className="w-3.5 h-3.5" /></button>
                            </div>
                            {lead.telefono && (
                              <p className="text-xs text-[#6b7280] flex items-center gap-1 mb-2"><Phone className="w-3 h-3" />{lead.telefono}</p>
                            )}
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-1.5">
                                {lead.etiquetas?.slice(0,1).map(tag => (
                                  <span key={tag} className="text-[10px] px-1.5 py-0.5 rounded-full bg-[#40d99d]/10 text-[#40d99d] font-medium">{tag}</span>
                                ))}
                                {!lead.etiquetas?.length && (
                                  <span className="text-[10px] px-1.5 py-0.5 rounded-full border border-[#e5e5e5] text-[#6b7280]">Sin Etiqueta</span>
                                )}
                              </div>
                              <div className="flex items-center gap-1">
                                <button className="w-6 h-6 rounded-lg bg-[#40d99d]/10 text-[#40d99d] flex items-center justify-center hover:bg-[#40d99d]/20 transition-colors">
                                  <MessageSquare className="w-3 h-3" />
                                </button>
                                <button className="w-6 h-6 rounded-lg bg-[#f0f0f0] text-[#6b7280] flex items-center justify-center hover:bg-[#e5e5e5] transition-colors">
                                  <Phone className="w-3 h-3" />
                                </button>
                              </div>
                            </div>
                            {lead.agente && (
                              <p className="text-[10px] text-[#6b7280] mt-2 truncate">Asignado: {lead.agente.nombre}</p>
                            )}
                            {lead.numero_citas > 0 && (
                              <p className="text-[10px] text-[#6b7280]">Citas: {lead.numero_citas}{lead.proxima_cita ? ` · ${new Date(lead.proxima_cita).toLocaleDateString('es-CO', {weekday:'short',day:'numeric',month:'numeric'})}` : ''}</p>
                            )}
                          </div>
                        )}
                      </Draggable>
                    ))}
                    {provided.placeholder}
                    {etapaLeads.length === 0 && (
                      <div className="py-6 text-center text-xs text-[#6b7280]">Sin leads</div>
                    )}
                  </div>
                )}
              </Droppable>
            </div>
          )
        })}

        {/* Add column placeholder */}
        <div className="flex-shrink-0 w-72">
          <div className="h-12 border-2 border-dashed border-[#e5e5e5] rounded-xl flex items-center justify-center text-xs text-[#6b7280] hover:border-[#40d99d] hover:text-[#40d99d] transition-all cursor-pointer">
            <Plus className="w-4 h-4 mr-1" />Nueva etapa
          </div>
        </div>
      </div>
    </DragDropContext>
  )
}
