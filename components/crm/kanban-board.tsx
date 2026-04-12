'use client'

import { useState, useCallback } from 'react'
import { DragDropContext, Droppable, Draggable, DropResult } from '@hello-pangea/dnd'
import { Plus, Phone, MessageSquare, MoreVertical } from 'lucide-react'
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
                  <div className="w-2 h-2 rounded-full" style={{ background: etapa.color }} />
                  <span className="text-xs font-semibold text-on-surface">{etapa.nombre}</span>
                  <span className="text-[10px] font-bold text-on-surface/40 bg-surface-container px-1.5 py-0.5 rounded-full">
                    {etapaLeads.length}
                  </span>
                </div>
                <button className="text-on-surface/30 hover:text-on-surface transition-colors">
                  <MoreVertical className="w-4 h-4" />
                </button>
              </div>

              <Droppable droppableId={etapa.id}>
                {(provided, snapshot) => (
                  <div
                    ref={provided.innerRef}
                    {...provided.droppableProps}
                    className={`min-h-32 rounded-xl space-y-2 transition-colors p-2 ${snapshot.isDraggingOver ? 'bg-brand-teal/5' : 'bg-surface-container-low'}`}
                  >
                    {etapaLeads.map((lead, idx) => (
                      <Draggable key={lead.id} draggableId={lead.id} index={idx}>
                        {(prov, snap) => (
                          <div
                            ref={prov.innerRef}
                            {...prov.draggableProps}
                            {...prov.dragHandleProps}
                            className={`bg-surface-container-lowest rounded-xl p-3 transition-all cursor-grab active:cursor-grabbing ${snap.isDragging ? 'shadow-glow-subtle rotate-1' : 'shadow-editorial hover:shadow-glow-subtle'}`}
                          >
                            <div className="flex items-start justify-between mb-2">
                              <p className="text-sm font-semibold text-on-surface leading-tight">{lead.nombre}</p>
                              <button className="text-on-surface/30 hover:text-on-surface ml-2 flex-shrink-0 transition-colors">
                                <MoreVertical className="w-3.5 h-3.5" />
                              </button>
                            </div>

                            {lead.telefono && (
                              <p className="text-xs text-on-surface/50 flex items-center gap-1 mb-2">
                                <Phone className="w-3 h-3" />{lead.telefono}
                              </p>
                            )}

                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-1.5">
                                {lead.etiquetas?.slice(0, 1).map(tag => (
                                  <span key={tag} className="text-[10px] px-1.5 py-0.5 rounded-full bg-brand-teal/10 text-brand-teal font-semibold">{tag}</span>
                                ))}
                                {!lead.etiquetas?.length && (
                                  <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-surface-container text-on-surface/40">Sin etiqueta</span>
                                )}
                              </div>
                              <div className="flex items-center gap-1">
                                <button className="w-6 h-6 rounded-lg bg-brand-teal/10 text-brand-teal flex items-center justify-center hover:bg-brand-teal/20 transition-colors">
                                  <MessageSquare className="w-3 h-3" />
                                </button>
                                <button className="w-6 h-6 rounded-lg bg-surface-container text-on-surface/50 flex items-center justify-center hover:bg-surface-container-high transition-colors">
                                  <Phone className="w-3 h-3" />
                                </button>
                              </div>
                            </div>

                            {lead.agente && (
                              <p className="text-[10px] text-on-surface/40 mt-2 truncate">Asignado: {lead.agente.nombre}</p>
                            )}
                            {lead.numero_citas > 0 && (
                              <p className="text-[10px] text-on-surface/40">
                                Citas: {lead.numero_citas}{lead.proxima_cita ? ` · ${new Date(lead.proxima_cita).toLocaleDateString('es-CO', { weekday: 'short', day: 'numeric', month: 'numeric' })}` : ''}
                              </p>
                            )}
                          </div>
                        )}
                      </Draggable>
                    ))}
                    {provided.placeholder}
                    {etapaLeads.length === 0 && (
                      <div className="py-8 text-center text-xs text-on-surface/30">Sin leads</div>
                    )}
                  </div>
                )}
              </Droppable>
            </div>
          )
        })}

        {/* Add column */}
        <div className="flex-shrink-0 w-72">
          <div className="h-12 rounded-xl flex items-center justify-center text-xs text-on-surface/30 bg-surface-container hover:bg-surface-container-high hover:text-brand-teal transition-all cursor-pointer">
            <Plus className="w-4 h-4 mr-1" />Nueva etapa
          </div>
        </div>
      </div>
    </DragDropContext>
  )
}
