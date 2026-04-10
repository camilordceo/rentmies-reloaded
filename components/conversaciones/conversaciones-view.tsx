'use client'

import { useState, useEffect, useMemo } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Search, Filter, Plus, Bot, User, Send, Phone, X, ChevronDown, Tag, Ban, MessageSquare, UserX, Trash2 } from 'lucide-react'
import { formatRelativeTime, getInitials } from '@/lib/utils'
import { cn } from '@/lib/utils'

interface Conv { id: string; whatsapp_ai: any; user_conversacion: any; ultimo_mensaje_at: string | null; activa: boolean; metadata: any }
interface Agente { id: string; nombre: string; email: string | null }
interface Etiqueta { id: string; nombre: string; color: string }
interface Mensaje { id: string; conversacion_id: string; rol: 'user' | 'assistant'; texto: string; created_at: string }

export function ConversacionesView({ initialConversations, agentes, etiquetas, empresaId }: {
  initialConversations: Conv[]; agentes: Agente[]; etiquetas: Etiqueta[]; empresaId: string
}) {
  const [mainTab, setMainTab] = useState<'conversaciones'|'etiquetas'|'bloqueados'>('conversaciones')
  const [conversations, setConversations] = useState<Conv[]>(initialConversations)
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [messages, setMessages] = useState<Mensaje[]>([])
  const [loadingMsgs, setLoadingMsgs] = useState(false)
  const [input, setInput] = useState('')
  const [search, setSearch] = useState('')
  const [showFilters, setShowFilters] = useState(false)
  const [filterAgente, setFilterAgente] = useState('')
  const [newTagName, setNewTagName] = useState('')
  const supabase = createClient()

  const selected = conversations.find(c => c.id === selectedId) || null

  // Realtime
  useEffect(() => {
    const channel = supabase.channel('conversaciones-rt')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'conversacion' }, () => {
        fetch('/api/conversaciones-list').then(r => r.json()).then(d => { if (d.data) setConversations(d.data) })
      })
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'mensaje' }, payload => {
        const msg = payload.new as Mensaje
        if (msg.conversacion_id === selectedId) setMessages(p => [...p, msg])
      })
      .subscribe()
    return () => { supabase.removeChannel(channel) }
  }, [selectedId])

  // Load messages when selecting conversation
  useEffect(() => {
    if (!selectedId) return
    setLoadingMsgs(true)
    fetch(`/api/conversations/${selectedId}/messages`).then(r => r.json()).then(d => {
      setMessages(d.data || [])
      setLoadingMsgs(false)
    })
  }, [selectedId])

  const filtered = useMemo(() => conversations.filter(c => {
    const u = c.user_conversacion
    const matchSearch = !search || u?.nombre?.toLowerCase().includes(search.toLowerCase()) || u?.telefono?.includes(search)
    const matchAgente = !filterAgente || c.whatsapp_ai?.id === filterAgente
    return matchSearch && matchAgente
  }), [conversations, search, filterAgente])

  async function sendMessage() {
    if (!input.trim() || !selected) return
    const text = input.trim(); setInput('')
    const agent = selected.whatsapp_ai
    if (!agent) return
    await fetch('/api/test/send-message', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ to: selected.user_conversacion?.telefono, channelUuid: agent.channel_uuid_callbell, text }),
    })
  }

  return (
    <div className="-m-4 lg:-m-6 h-[calc(100vh-theme(spacing.14))] flex flex-col">
      {/* Main tabs */}
      <div className="flex-shrink-0 px-4 pt-4 pb-0">
        <div className="flex items-center gap-1 bg-[#f0f0f0] rounded-xl p-1 w-fit mb-3">
          {([['conversaciones','Conversaciones',MessageSquare],['etiquetas','Etiquetas',Tag],['bloqueados','Bloqueados',Ban]] as const).map(([v,l,Icon]) => (
            <button key={v} onClick={() => setMainTab(v as any)}
              className={cn('flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all', mainTab===v ? 'bg-white text-[#1a1a1a] shadow-sm' : 'text-[#6b7280]')}>
              <Icon className="w-4 h-4" />{l}
            </button>
          ))}
        </div>
      </div>

      {mainTab === 'conversaciones' && (
        <div className="flex-1 flex min-h-0 gap-0">
          {/* Left panel */}
          <div className="w-80 flex-shrink-0 flex flex-col bg-white border-r border-[#e5e5e5]">
            <div className="p-3 border-b border-[#e5e5e5] space-y-2">
              <div className="flex items-center gap-2">
                <div className="relative flex-1">
                  <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[#6b7280]" />
                  <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Buscar nombre o teléfono..."
                    className="w-full h-8 pl-8 pr-3 text-xs border border-[#e5e5e5] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#40d99d]" />
                </div>
                <button onClick={() => setShowFilters(!showFilters)} className={cn('w-8 h-8 flex items-center justify-center border rounded-lg transition-all', showFilters ? 'border-[#40d99d] bg-[#40d99d]/10 text-[#40d99d]' : 'border-[#e5e5e5] text-[#6b7280]')}>
                  <Filter className="w-3.5 h-3.5" />
                </button>
              </div>
              {showFilters && (
                <select value={filterAgente} onChange={e => setFilterAgente(e.target.value)}
                  className="w-full h-8 px-2 text-xs border border-[#e5e5e5] rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-[#40d99d]">
                  <option value="">Todos los agentes IA</option>
                </select>
              )}
              <p className="text-[10px] text-[#6b7280] px-1">{filtered.length} conversaciones</p>
            </div>
            <div className="flex-1 overflow-y-auto">
              {filtered.map(conv => {
                const u = conv.user_conversacion
                const isSelected = conv.id === selectedId
                return (
                  <button key={conv.id} onClick={() => setSelectedId(conv.id)} className={cn('w-full text-left px-3 py-3 border-b border-[#f0f0f0] transition-all hover:bg-[#f8f8f8]', isSelected && 'bg-[#40d99d]/5 border-l-2 border-l-[#40d99d]')}>
                    <div className="flex items-start gap-2.5">
                      <div className="w-9 h-9 bg-[#40d99d]/10 rounded-full flex items-center justify-center flex-shrink-0 text-xs font-medium text-[#40d99d]">
                        {u?.nombre ? getInitials(u.nombre) : u?.telefono?.slice(-2) || '?'}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-0.5">
                          <span className="text-sm font-medium text-[#1a1a1a] truncate">{u?.nombre || `+${u?.telefono}`}</span>
                          <span className="text-[10px] text-[#6b7280] flex-shrink-0 ml-1">{conv.ultimo_mensaje_at ? formatRelativeTime(conv.ultimo_mensaje_at) : ''}</span>
                        </div>
                        <p className="text-xs text-[#6b7280] truncate">+{u?.telefono}</p>
                        <div className="flex items-center gap-1.5 mt-1">
                          <span className="inline-flex items-center gap-1 text-[10px] px-1.5 py-0.5 rounded bg-[#40d99d]/10 text-[#40d99d] font-medium">
                            <Bot className="w-2.5 h-2.5" />IA
                          </span>
                          {conv.whatsapp_ai?.nombre_agente && (
                            <span className="text-[10px] px-1.5 py-0.5 rounded bg-[#f0f0f0] text-[#6b7280]">{conv.whatsapp_ai.nombre_agente}</span>
                          )}
                        </div>
                      </div>
                    </div>
                  </button>
                )
              })}
              {filtered.length === 0 && (
                <div className="flex flex-col items-center justify-center py-16">
                  <MessageSquare className="w-8 h-8 text-[#e5e5e5] mb-2" />
                  <p className="text-sm text-[#6b7280]">Sin conversaciones</p>
                </div>
              )}
            </div>
          </div>

          {/* Center: Chat */}
          <div className="flex-1 flex flex-col bg-[#f8f8f8]">
            {selected ? (
              <>
                {/* Chat header */}
                <div className="flex-shrink-0 flex items-center gap-3 px-4 py-3 bg-white border-b border-[#e5e5e5]">
                  <div className="w-8 h-8 bg-[#40d99d]/10 rounded-full flex items-center justify-center text-xs font-medium text-[#40d99d]">
                    {selected.user_conversacion?.nombre ? getInitials(selected.user_conversacion.nombre) : '?'}
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-[#1a1a1a]">{selected.user_conversacion?.nombre || 'Contacto'}</p>
                    <p className="text-xs text-[#6b7280] flex items-center gap-1"><Phone className="w-3 h-3" />+{selected.user_conversacion?.telefono}</p>
                  </div>
                  <div className="flex items-center gap-1.5 text-xs bg-[#40d99d]/10 text-[#40d99d] px-2 py-1 rounded-full">
                    <Bot className="w-3.5 h-3.5" />{selected.whatsapp_ai?.nombre_agente || 'IA'}
                  </div>
                </div>

                {/* Messages */}
                <div className="flex-1 overflow-y-auto p-4 space-y-3">
                  {loadingMsgs ? (
                    <div className="flex items-center justify-center h-full"><p className="text-sm text-[#6b7280]">Cargando...</p></div>
                  ) : messages.map(msg => (
                    <div key={msg.id} className={`flex ${msg.rol === 'user' ? 'justify-start' : 'justify-end'}`}>
                      <div className={`max-w-[72%] rounded-2xl px-3.5 py-2.5 shadow-sm ${msg.rol === 'user' ? 'bg-white border border-[#e5e5e5] rounded-tl-sm' : 'bg-[#40d99d] text-white rounded-tr-sm'}`}>
                        <p className={`text-sm whitespace-pre-wrap ${msg.rol === 'user' ? 'text-[#1a1a1a]' : 'text-white'}`}>{msg.texto}</p>
                        <p className={`text-[10px] mt-1 ${msg.rol === 'user' ? 'text-[#6b7280]' : 'text-white/70'}`}>{formatRelativeTime(msg.created_at)}</p>
                      </div>
                    </div>
                  ))}
                  {messages.length === 0 && !loadingMsgs && (
                    <div className="flex items-center justify-center h-full"><p className="text-sm text-[#6b7280]">Sin mensajes aún</p></div>
                  )}
                </div>

                {/* Input */}
                <div className="flex-shrink-0 bg-white border-t border-[#e5e5e5] p-3">
                  <div className="flex items-end gap-2">
                    <textarea value={input} onChange={e => setInput(e.target.value)}
                      onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage() }}}
                      placeholder="Escribe tu mensaje..." rows={1}
                      className="flex-1 px-3 py-2 border border-[#e5e5e5] rounded-xl text-sm resize-none focus:outline-none focus:ring-2 focus:ring-[#40d99d] max-h-24" />
                    <button onClick={sendMessage} disabled={!input.trim()}
                      className="w-9 h-9 bg-[#40d99d] text-white rounded-xl flex items-center justify-center hover:bg-[#40d99d]/90 disabled:opacity-40 transition-all flex-shrink-0">
                      <Send className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </>
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center text-center">
                <MessageSquare className="w-12 h-12 text-[#e5e5e5] mb-3" />
                <p className="text-sm font-medium text-[#1a1a1a]">Selecciona una conversación</p>
                <p className="text-xs text-[#6b7280] mt-1">Elige una de la lista para ver el chat</p>
              </div>
            )}
          </div>

          {/* Right: Contact panel */}
          {selected && (
            <div className="w-64 flex-shrink-0 bg-white border-l border-[#e5e5e5] overflow-y-auto">
              <div className="p-4 text-center border-b border-[#e5e5e5]">
                <div className="w-14 h-14 bg-[#40d99d]/10 rounded-full flex items-center justify-center text-lg font-medium text-[#40d99d] mx-auto mb-2">
                  {selected.user_conversacion?.nombre ? getInitials(selected.user_conversacion.nombre) : '?'}
                </div>
                <p className="text-sm font-medium text-[#1a1a1a]">{selected.user_conversacion?.nombre || 'Contacto'}</p>
                <p className="text-xs text-[#6b7280]">+{selected.user_conversacion?.telefono}</p>
              </div>
              <div className="p-4 space-y-3">
                {[
                  { label: 'Agente IA', value: selected.whatsapp_ai?.nombre_agente || '—' },
                  { label: 'Canal', value: 'WhatsApp' },
                  { label: 'Estado', value: selected.activa ? 'Activa' : 'Cerrada' },
                ].map(item => (
                  <div key={item.label} className="flex items-center justify-between text-xs">
                    <span className="text-[#6b7280]">{item.label}</span>
                    <span className="font-medium text-[#1a1a1a]">{item.value}</span>
                  </div>
                ))}
                <div className="pt-2 border-t border-[#e5e5e5]">
                  <p className="text-xs font-medium text-[#1a1a1a] mb-2">Etiquetas</p>
                  {etiquetas.length === 0 ? (
                    <p className="text-xs text-[#6b7280]">Sin etiquetas</p>
                  ) : (
                    <div className="flex flex-wrap gap-1">
                      {etiquetas.slice(0, 4).map(e => (
                        <span key={e.id} className="px-2 py-0.5 rounded-full text-[10px] font-medium" style={{ background: `${e.color}20`, color: e.color }}>{e.nombre}</span>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {mainTab === 'etiquetas' && (
        <div className="flex-1 p-4">
          <div className="max-w-2xl bg-white border border-[#e5e5e5] rounded-xl shadow-sm overflow-hidden">
            <div className="p-4 border-b border-[#e5e5e5] flex items-center justify-between">
              <div>
                <h2 className="text-sm font-medium text-[#1a1a1a]">Etiquetas</h2>
                <p className="text-xs text-[#6b7280]">Organiza conversaciones con etiquetas</p>
              </div>
              <div className="flex gap-2">
                <input value={newTagName} onChange={e => setNewTagName(e.target.value)} placeholder="Nueva etiqueta..." className="h-8 px-3 text-sm border border-[#e5e5e5] rounded-lg w-36 focus:outline-none focus:ring-2 focus:ring-[#40d99d]" />
                <button onClick={() => { if(newTagName.trim()) { fetch('/api/etiquetas',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({nombre:newTagName,empresa_id:empresaId})}); setNewTagName('') }}}
                  className="h-8 px-3 bg-[#40d99d] text-white text-xs font-medium rounded-lg flex items-center gap-1"><Plus className="w-3.5 h-3.5" />Crear</button>
              </div>
            </div>
            <div className="p-4 space-y-2">
              {etiquetas.length === 0 ? (
                <div className="text-center py-10"><Tag className="w-8 h-8 text-[#e5e5e5] mx-auto mb-2" /><p className="text-sm text-[#6b7280]">No hay etiquetas</p></div>
              ) : etiquetas.map(e => (
                <div key={e.id} className="flex items-center justify-between p-3 border border-[#e5e5e5] rounded-lg hover:border-[#40d99d]/50 transition-colors">
                  <span className="text-xs px-2.5 py-1 rounded-full font-medium" style={{ background: `${e.color}20`, color: e.color }}>{e.nombre}</span>
                  <button className="text-[#6b7280] hover:text-red-500 transition-colors"><Trash2 className="w-3.5 h-3.5" /></button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {mainTab === 'bloqueados' && (
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center"><UserX className="w-10 h-10 text-[#e5e5e5] mx-auto mb-2" /><p className="text-sm text-[#6b7280]">No hay contactos bloqueados</p></div>
        </div>
      )}
    </div>
  )
}
