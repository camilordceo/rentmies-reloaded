'use client'

import { useState, useEffect, useMemo, useRef } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Search, Filter, Plus, Bot, Send, Phone, Tag, Ban, MessageSquare, UserX, Trash2, Sparkles, Mic } from 'lucide-react'
import { formatRelativeTime, getInitials } from '@/lib/utils'
import { cn } from '@/lib/utils'

interface Conv { id: string; whatsapp_ai: any; user_conversacion: any; ultimo_mensaje_at: string | null; activa: boolean; metadata: any }
interface Agente { id: string; nombre: string; email: string | null }
interface Etiqueta { id: string; nombre: string; color: string }
interface Mensaje { id: string; conversacion_id: string; rol: 'user' | 'assistant'; texto: string; created_at: string }

export function ConversacionesView({ initialConversations, agentes, etiquetas, empresaId }: {
  initialConversations: Conv[]; agentes: Agente[]; etiquetas: Etiqueta[]; empresaId: string
}) {
  const [mainTab, setMainTab] = useState<'conversaciones' | 'etiquetas' | 'bloqueados'>('conversaciones')
  const [conversations, setConversations] = useState<Conv[]>(initialConversations)
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [messages, setMessages] = useState<Mensaje[]>([])
  const [loadingMsgs, setLoadingMsgs] = useState(false)
  const [input, setInput] = useState('')
  const [search, setSearch] = useState('')
  const [showFilters, setShowFilters] = useState(false)
  const [filterAgente, setFilterAgente] = useState('')
  const [newTagName, setNewTagName] = useState('')
  const messagesEndRef = useRef<HTMLDivElement>(null)
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

  // Load messages
  useEffect(() => {
    if (!selectedId) return
    setLoadingMsgs(true)
    fetch(`/api/conversations/${selectedId}/messages`).then(r => r.json()).then(d => {
      setMessages(d.data || [])
      setLoadingMsgs(false)
    })
  }, [selectedId])

  // Auto-scroll
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

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
    <div className="-m-4 lg:-m-6 h-[calc(100vh-theme(spacing.14))] flex flex-col bg-surface">
      {/* Main tabs */}
      <div className="flex-shrink-0 px-4 pt-4 pb-0">
        <div className="flex items-center gap-1 bg-surface-container rounded-xl p-1 w-fit mb-3">
          {([
            ['conversaciones', 'Conversaciones', MessageSquare],
            ['etiquetas', 'Etiquetas', Tag],
            ['bloqueados', 'Bloqueados', Ban],
          ] as const).map(([v, l, Icon]) => (
            <button key={v} onClick={() => setMainTab(v as typeof mainTab)}
              className={cn(
                'flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all',
                mainTab === v
                  ? 'bg-surface-container-lowest text-on-surface shadow-editorial'
                  : 'text-on-surface/50 hover:text-on-surface'
              )}>
              <Icon className="w-4 h-4" />{l}
            </button>
          ))}
        </div>
      </div>

      {mainTab === 'conversaciones' && (
        <div className="flex-1 flex min-h-0 gap-0">
          {/* ── Left: Conversation List ─────────────────────────── */}
          <div className="w-80 flex-shrink-0 flex flex-col bg-surface">
            {/* Search */}
            <div className="p-3 space-y-2">
              <div className="flex items-center gap-2">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-on-surface/40" />
                  <input
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                    placeholder="Buscar..."
                    className="w-full h-9 pl-9 pr-3 text-xs bg-surface-container rounded-lg text-on-surface placeholder:text-on-surface/35 outline-none focus:ring-2 focus:ring-brand-teal/30"
                  />
                </div>
                <button
                  onClick={() => setShowFilters(!showFilters)}
                  className={cn(
                    'w-9 h-9 flex items-center justify-center rounded-lg transition-all',
                    showFilters ? 'bg-brand-teal/10 text-brand-teal' : 'bg-surface-container text-on-surface/40 hover:text-on-surface'
                  )}>
                  <Filter className="w-3.5 h-3.5" />
                </button>
              </div>
              {showFilters && (
                <select
                  value={filterAgente}
                  onChange={e => setFilterAgente(e.target.value)}
                  className="w-full h-8 px-2 text-xs bg-surface-container rounded-lg text-on-surface outline-none focus:ring-2 focus:ring-brand-teal/30">
                  <option value="">Todos los agentes IA</option>
                  {agentes.map(a => <option key={a.id} value={a.id}>{a.nombre}</option>)}
                </select>
              )}
              <p className="text-[10px] text-on-surface/30 px-1">{filtered.length} conversaciones</p>
            </div>

            {/* List */}
            <div className="flex-1 overflow-y-auto hide-scrollbar px-2 space-y-1">
              {filtered.map(conv => {
                const u = conv.user_conversacion
                const isSelected = conv.id === selectedId
                return (
                  <button
                    key={conv.id}
                    onClick={() => setSelectedId(conv.id)}
                    className={cn(
                      'w-full text-left p-3 rounded-xl transition-all',
                      isSelected
                        ? 'bg-surface-container-lowest shadow-glow-subtle ring-1 ring-brand-teal/30'
                        : 'hover:bg-surface-container'
                    )}
                  >
                    <div className="flex items-start gap-2.5">
                      <div className="w-9 h-9 bg-brand-teal/10 rounded-full flex items-center justify-center flex-shrink-0 text-xs font-semibold text-brand-teal">
                        {u?.nombre ? getInitials(u.nombre) : u?.telefono?.slice(-2) || '?'}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-0.5">
                          <span className="text-sm font-semibold text-on-surface truncate">{u?.nombre || `+${u?.telefono}`}</span>
                          <span className="text-[10px] text-on-surface/40 flex-shrink-0 ml-1">
                            {conv.ultimo_mensaje_at ? formatRelativeTime(conv.ultimo_mensaje_at) : ''}
                          </span>
                        </div>
                        <p className="text-xs text-on-surface/50 truncate">+{u?.telefono}</p>
                        <div className="flex items-center gap-1.5 mt-1.5">
                          <span className="inline-flex items-center gap-1 text-[10px] px-1.5 py-0.5 rounded-md bg-brand-teal/10 text-brand-teal font-medium">
                            <Bot className="w-2.5 h-2.5" />IA
                          </span>
                          {conv.whatsapp_ai?.nombre_agente && (
                            <span className="text-[10px] px-1.5 py-0.5 rounded-md bg-surface-container text-on-surface/50">
                              {conv.whatsapp_ai.nombre_agente}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </button>
                )
              })}
              {filtered.length === 0 && (
                <div className="flex flex-col items-center justify-center py-16">
                  <MessageSquare className="w-8 h-8 text-on-surface/10 mb-2" />
                  <p className="text-sm text-on-surface/40">Sin conversaciones</p>
                </div>
              )}
            </div>
          </div>

          {/* ── Center: Thread ──────────────────────────────────── */}
          <div className="flex-1 flex flex-col bg-surface-container/30 min-w-0">
            {selected ? (
              <>
                {/* Thread header */}
                <div className="flex-shrink-0 flex items-center gap-3 px-4 py-3 bg-surface/80 backdrop-blur-xl">
                  <div className="w-8 h-8 bg-brand-teal/10 rounded-full flex items-center justify-center text-xs font-semibold text-brand-teal">
                    {selected.user_conversacion?.nombre ? getInitials(selected.user_conversacion.nombre) : '?'}
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-semibold text-on-surface">{selected.user_conversacion?.nombre || 'Contacto'}</p>
                    <p className="text-xs text-on-surface/50 flex items-center gap-1">
                      <Phone className="w-3 h-3" />+{selected.user_conversacion?.telefono}
                    </p>
                  </div>
                  <div className="flex items-center gap-1.5 text-xs bg-brand-teal/10 text-brand-teal px-2.5 py-1 rounded-full font-medium">
                    <Bot className="w-3.5 h-3.5" />{selected.whatsapp_ai?.nombre_agente || 'IA'}
                  </div>
                </div>

                {/* Messages */}
                <div className="flex-1 overflow-y-auto hide-scrollbar p-4 space-y-3">
                  {loadingMsgs ? (
                    <div className="flex items-center justify-center h-full">
                      <div className="flex gap-1.5">
                        {[0, 1, 2].map(i => (
                          <div key={i} className="w-2 h-2 rounded-full bg-brand-teal animate-pulse" style={{ animationDelay: `${i * 0.15}s` }} />
                        ))}
                      </div>
                    </div>
                  ) : (
                    <>
                      {messages.map(msg => (
                        <div key={msg.id} className={`flex ${msg.rol === 'user' ? 'justify-start' : 'justify-end'}`}>
                          {msg.rol === 'user' ? (
                            <div className="max-w-[72%] bg-surface-container-lowest rounded-xl p-4 shadow-editorial">
                              <p className="text-sm text-on-surface whitespace-pre-wrap">{msg.texto}</p>
                              <p className="text-[10px] text-on-surface/40 mt-1.5">{formatRelativeTime(msg.created_at)}</p>
                            </div>
                          ) : (
                            <div className="max-w-[72%] space-y-2">
                              <div className="bg-brand-teal/8 rounded-xl p-4 border-l-2 border-brand-teal">
                                <div className="flex items-center gap-1.5 mb-2">
                                  <Bot className="w-3 h-3 text-brand-teal" />
                                  <span className="text-[10px] font-bold uppercase tracking-widest text-brand-teal">EMA</span>
                                </div>
                                <p className="text-sm text-on-surface whitespace-pre-wrap">{msg.texto}</p>
                                <p className="text-[10px] text-on-surface/40 mt-1.5">{formatRelativeTime(msg.created_at)}</p>
                              </div>
                              {/* Action chips after AI message */}
                              <div className="flex gap-2 flex-wrap">
                                {['Ver lead', 'Agendar tour', 'Ajustar respuesta'].map(chip => (
                                  <button key={chip} className="text-[11px] px-3 py-1 rounded-full bg-surface-container text-on-surface/60 hover:bg-surface-container-high hover:text-on-surface transition-colors">
                                    {chip}
                                  </button>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      ))}
                      {messages.length === 0 && !loadingMsgs && (
                        <div className="flex items-center justify-center h-full">
                          <p className="text-sm text-on-surface/40">Sin mensajes aún</p>
                        </div>
                      )}
                      <div ref={messagesEndRef} />
                    </>
                  )}
                </div>

                {/* Input bar */}
                <div className="flex-shrink-0 p-3">
                  <div className="flex items-end gap-2 bg-on-surface/95 backdrop-blur-2xl rounded-full px-4 py-2.5">
                    <textarea
                      value={input}
                      onChange={e => setInput(e.target.value)}
                      onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage() } }}
                      placeholder="Escribe tu mensaje..."
                      rows={1}
                      className="flex-1 bg-transparent text-sm text-white placeholder:text-white/40 resize-none outline-none max-h-24 hide-scrollbar"
                    />
                    <Mic className="w-4 h-4 text-white/40 hover:text-brand-teal cursor-pointer transition-colors flex-shrink-0" />
                    <button
                      onClick={sendMessage}
                      disabled={!input.trim()}
                      className="w-8 h-8 bg-brand-teal text-white rounded-full flex items-center justify-center hover:bg-brand-teal/90 disabled:opacity-30 transition-all flex-shrink-0"
                    >
                      <Send className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </>
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center text-center gap-4">
                <div className="w-16 h-16 rounded-full bg-brand-teal/10 flex items-center justify-center">
                  <Sparkles className="w-7 h-7 text-brand-teal" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-on-surface">Selecciona una conversación</p>
                  <p className="text-xs text-on-surface/40 mt-1">EMA está monitoreando todas las conversaciones activas</p>
                </div>
              </div>
            )}
          </div>

          {/* ── Right: Context Panel ────────────────────────────── */}
          {selected && (
            <div className="w-72 flex-shrink-0 bg-surface flex flex-col overflow-y-auto hide-scrollbar">
              {/* Contact card */}
              <div className="p-5 text-center">
                <div className="w-14 h-14 bg-brand-teal/10 rounded-full flex items-center justify-center text-lg font-semibold text-brand-teal mx-auto mb-3">
                  {selected.user_conversacion?.nombre ? getInitials(selected.user_conversacion.nombre) : '?'}
                </div>
                <p className="text-sm font-semibold text-on-surface">{selected.user_conversacion?.nombre || 'Contacto'}</p>
                <p className="text-xs text-on-surface/50 mt-0.5">+{selected.user_conversacion?.telefono}</p>
              </div>

              {/* Conversation info */}
              <div className="px-4 space-y-2 mb-5">
                {[
                  { label: 'Agente IA', value: selected.whatsapp_ai?.nombre_agente || '—' },
                  { label: 'Canal', value: 'WhatsApp' },
                  { label: 'Estado', value: selected.activa ? 'Activa' : 'Cerrada' },
                ].map(item => (
                  <div key={item.label} className="flex items-center justify-between text-xs py-1.5">
                    <span className="text-on-surface/40">{item.label}</span>
                    <span className="font-medium text-on-surface">{item.value}</span>
                  </div>
                ))}
              </div>

              {/* One-tap Actions */}
              <div className="px-4 mb-5">
                <p className="text-[10px] font-bold uppercase tracking-widest text-on-surface/30 mb-3">ACCIONES</p>
                <div className="space-y-2">
                  {['Redactar contrato', 'Agendar visita', 'Verificar fondos'].map(action => (
                    <button key={action}
                      className="w-full text-left text-xs px-3 py-2.5 rounded-lg bg-surface-container hover:bg-surface-container-high text-on-surface/70 hover:text-on-surface transition-all">
                      {action}
                    </button>
                  ))}
                </div>
              </div>

              {/* EMA market alert */}
              <div className="mx-4 bg-surface-container-low rounded-xl p-4 mb-4">
                <div className="flex items-center gap-2 mb-2">
                  <Sparkles className="w-3.5 h-3.5 text-brand-teal" />
                  <span className="text-[10px] font-bold uppercase tracking-widest text-brand-teal">ALERTA DE MERCADO</span>
                </div>
                <p className="text-xs text-on-surface/60 leading-relaxed">
                  Este lead ha visto 4 propiedades similares. Precio competitivo de referencia: $1.8M–$2.1M.
                </p>
              </div>

              {/* Tags */}
              {etiquetas.length > 0 && (
                <div className="px-4 mb-4">
                  <p className="text-[10px] font-bold uppercase tracking-widest text-on-surface/30 mb-2">ETIQUETAS</p>
                  <div className="flex flex-wrap gap-1.5">
                    {etiquetas.slice(0, 4).map(e => (
                      <span key={e.id} className="px-2 py-0.5 rounded-full text-[10px] font-medium"
                        style={{ background: `${e.color}20`, color: e.color }}>
                        {e.nombre}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* ── Etiquetas tab ─────────────────────────────────────────── */}
      {mainTab === 'etiquetas' && (
        <div className="flex-1 p-4">
          <div className="max-w-2xl bg-surface-container-lowest rounded-xl shadow-editorial overflow-hidden">
            <div className="p-5 flex items-center justify-between mb-1">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-widest text-on-surface/40 mb-1">GESTIÓN</p>
                <h2 className="text-sm font-semibold text-on-surface">Etiquetas</h2>
              </div>
              <div className="flex gap-2">
                <input
                  value={newTagName}
                  onChange={e => setNewTagName(e.target.value)}
                  placeholder="Nueva etiqueta..."
                  className="h-8 px-3 text-sm bg-surface-container rounded-lg text-on-surface placeholder:text-on-surface/35 outline-none focus:ring-2 focus:ring-brand-teal/30 w-36"
                />
                <button
                  onClick={() => {
                    if (newTagName.trim()) {
                      fetch('/api/etiquetas', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ nombre: newTagName, empresa_id: empresaId }) })
                      setNewTagName('')
                    }
                  }}
                  className="h-8 px-3 bg-authority-green text-white text-xs font-semibold rounded-lg flex items-center gap-1">
                  <Plus className="w-3.5 h-3.5" />Crear
                </button>
              </div>
            </div>
            <div className="p-4 space-y-2">
              {etiquetas.length === 0 ? (
                <div className="text-center py-10">
                  <Tag className="w-8 h-8 text-on-surface/10 mx-auto mb-2" />
                  <p className="text-sm text-on-surface/40">No hay etiquetas</p>
                </div>
              ) : etiquetas.map(e => (
                <div key={e.id} className="flex items-center justify-between p-3 rounded-xl bg-surface-container hover:bg-surface-container-high transition-colors">
                  <span className="text-xs px-2.5 py-1 rounded-full font-medium" style={{ background: `${e.color}20`, color: e.color }}>{e.nombre}</span>
                  <button className="text-on-surface/30 hover:text-red-500 transition-colors"><Trash2 className="w-3.5 h-3.5" /></button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ── Bloqueados tab ────────────────────────────────────────── */}
      {mainTab === 'bloqueados' && (
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <UserX className="w-10 h-10 text-on-surface/10 mx-auto mb-2" />
            <p className="text-sm text-on-surface/40">No hay contactos bloqueados</p>
          </div>
        </div>
      )}
    </div>
  )
}
