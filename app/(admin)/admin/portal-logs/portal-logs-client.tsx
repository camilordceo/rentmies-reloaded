'use client'

import { useState } from 'react'
import { ChevronDown, ChevronRight, Search, MessageSquare, Zap, Clock } from 'lucide-react'
import { cn } from '@/lib/utils'

export interface PortalConversacion {
  id: string
  created_at: string
  ultimo_mensaje_at: string | null
  metadata: Record<string, any>
  mensajes: Array<{
    id: string
    rol: 'user' | 'assistant'
    texto: string
    created_at: string
    metadata: Record<string, any>
  }>
}

function fmtDate(iso: string) {
  return new Date(iso).toLocaleString('es-CO', {
    timeZone: 'America/Bogota',
    day: '2-digit', month: 'short',
    hour: '2-digit', minute: '2-digit',
    hour12: false,
  })
}

function IntentBadge({ intent }: { intent: string }) {
  return (
    <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-semibold bg-authority-green/10 text-authority-green">
      {intent}
    </span>
  )
}

const DEBUG_BADGE_TONES = {
  gray: 'bg-on-surface/5 text-on-surface/60',
  green: 'bg-authority-green/10 text-authority-green',
  teal: 'bg-brand-teal/10 text-brand-teal',
  amber: 'bg-amber-100 text-amber-700',
  red: 'bg-red-100 text-red-700',
} as const

function DebugBadge({
  label,
  tone = 'gray',
}: {
  label: string
  tone?: keyof typeof DEBUG_BADGE_TONES
}) {
  return (
    <span
      className={cn(
        'inline-flex items-center px-1.5 py-0.5 rounded text-[9px] font-mono font-semibold',
        DEBUG_BADGE_TONES[tone]
      )}
    >
      {label}
    </span>
  )
}

function ConversacionRow({ conv }: { conv: PortalConversacion }) {
  const [open, setOpen] = useState(false)

  const userMsgs = conv.mensajes.filter(m => m.rol === 'user')
  const allIntents: string[] = []
  for (const m of conv.mensajes) {
    const ints = m.metadata?.intents ?? []
    for (const i of ints) if (!allIntents.includes(i)) allIntents.push(i)
  }

  const lastMsg = conv.mensajes[conv.mensajes.length - 1]

  return (
    <div className="border border-outline-variant rounded-xl overflow-hidden bg-surface-container-lowest shadow-editorial">
      {/* Header row */}
      <button
        onClick={() => setOpen(o => !o)}
        className="w-full flex items-start gap-3 p-4 hover:bg-surface-container/50 transition-colors text-left"
      >
        <span className="mt-0.5 text-on-surface/40">
          {open ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
        </span>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-xs font-mono text-on-surface/40">{conv.id.slice(0, 8)}</span>
            <span className="text-[10px] font-bold uppercase tracking-widest text-on-surface/30">
              {conv.metadata?.session_id?.slice(0, 12) ?? '—'}
            </span>
            {allIntents.map(i => <IntentBadge key={i} intent={i} />)}
          </div>

          {lastMsg && (
            <p className="text-sm text-on-surface/70 mt-1 truncate">
              <span className={cn('font-semibold mr-1', lastMsg.rol === 'user' ? 'text-authority-green' : 'text-on-surface/40')}>
                {lastMsg.rol === 'user' ? 'Usuario:' : 'EMA:'}
              </span>
              {lastMsg.texto}
            </p>
          )}
        </div>

        <div className="shrink-0 text-right">
          <p className="text-[10px] text-on-surface/40">{fmtDate(conv.created_at)}</p>
          <p className="text-[10px] font-bold text-on-surface/50 mt-0.5">
            {userMsgs.length} msg{userMsgs.length !== 1 ? 's' : ''}
          </p>
        </div>
      </button>

      {/* Expanded messages */}
      {open && (
        <div className="border-t border-outline-variant bg-surface-container/30 p-4 space-y-3">
          {conv.mensajes.length === 0 && (
            <p className="text-xs text-on-surface/40 italic">Sin mensajes registrados</p>
          )}
          {conv.mensajes.map(m => {
            const intents: string[] = m.metadata?.intents ?? []
            const dbg = m.metadata?.debug as
              | undefined
              | {
                  used_path?: string
                  extracted_codes?: string[]
                  tool_results?: number
                  fallback_results?: number
                  inventory_total?: number | null
                  search_filters?: Record<string, unknown> | null
                  tool_calls?: string[]
                }
            return (
              <div key={m.id} className={cn('flex flex-col gap-1', m.rol === 'assistant' ? 'items-end' : 'items-start')}>
                <div className={cn('flex gap-2 w-full', m.rol === 'assistant' && 'flex-row-reverse')}>
                  <div className={cn(
                    'max-w-[80%] rounded-xl px-3 py-2 text-sm',
                    m.rol === 'user'
                      ? 'bg-authority-green text-white rounded-bl-sm'
                      : 'bg-surface-container-highest text-on-surface rounded-br-sm'
                  )}>
                    <p className="leading-relaxed">{m.texto}</p>
                    <div className="flex items-center gap-1 mt-1 flex-wrap">
                      {intents.map(i => (
                        <span key={i} className={cn(
                          'text-[9px] font-bold uppercase px-1 rounded',
                          m.rol === 'user' ? 'bg-white/20 text-white' : 'bg-authority-green/10 text-authority-green'
                        )}>{i}</span>
                      ))}
                      <span className={cn(
                        'text-[9px] ml-auto',
                        m.rol === 'user' ? 'text-white/50' : 'text-on-surface/30'
                      )}>{fmtDate(m.created_at)}</span>
                    </div>
                  </div>
                </div>

                {dbg && m.rol === 'assistant' && (
                  <div className="flex flex-wrap gap-1 mt-0.5 max-w-[80%]">
                    <DebugBadge label={`path: ${dbg.used_path ?? '?'}`} tone={
                      dbg.used_path === 'tool' ? 'green' :
                      dbg.used_path === 'fallback' ? 'amber' : 'gray'
                    } />
                    <DebugBadge label={`tool: ${dbg.tool_results ?? 0}`} />
                    <DebugBadge label={`fallback: ${dbg.fallback_results ?? 0}`} />
                    {(dbg.extracted_codes?.length ?? 0) > 0 && (
                      <DebugBadge
                        label={`códigos: ${dbg.extracted_codes!.join(', ')}`}
                        tone="teal"
                      />
                    )}
                    {dbg.inventory_total !== null && dbg.inventory_total !== undefined && (
                      <DebugBadge
                        label={`inv: ${dbg.inventory_total}`}
                        tone={dbg.inventory_total === 0 ? 'red' : 'gray'}
                      />
                    )}
                    {dbg.search_filters && Object.keys(dbg.search_filters).length > 0 && (
                      <DebugBadge
                        label={`filtros: ${Object.keys(dbg.search_filters).join(', ')}`}
                        tone="teal"
                      />
                    )}
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

export function PortalLogsClient({
  conversations,
  stats,
}: {
  conversations: PortalConversacion[]
  stats: { totalSessions: number; totalMessages: number; todaySessions: number; topIntents: Array<{ intent: string; count: number }> }
}) {
  const [search, setSearch] = useState('')

  const filtered = search.trim()
    ? conversations.filter(c => {
        const q = search.toLowerCase()
        return (
          c.id.includes(q) ||
          c.mensajes.some(m => m.texto.toLowerCase().includes(q)) ||
          c.mensajes.some(m => (m.metadata?.intents ?? []).some((i: string) => i.toLowerCase().includes(q)))
        )
      })
    : conversations

  return (
    <div className="space-y-6">
      {/* Stats strip */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'SESIONES TOTALES', value: stats.totalSessions, icon: MessageSquare, color: 'text-authority-green', bg: 'bg-authority-green/10' },
          { label: 'SESIONES HOY', value: stats.todaySessions, icon: Clock, color: 'text-brand-teal', bg: 'bg-brand-teal/10' },
          { label: 'MENSAJES TOTALES', value: stats.totalMessages, icon: Zap, color: 'text-purple-600', bg: 'bg-purple-50' },
          { label: 'INTENCIÓN #1', value: stats.topIntents[0]?.intent ?? '—', icon: Search, color: 'text-amber-600', bg: 'bg-amber-50' },
        ].map(s => (
          <div key={s.label} className="bg-surface-container-lowest rounded-xl p-4 shadow-editorial">
            <div className={`w-8 h-8 rounded-lg ${s.bg} flex items-center justify-center mb-3`}>
              <s.icon className={`w-4 h-4 ${s.color}`} />
            </div>
            <p className="text-2xl font-bold text-on-surface">{s.value}</p>
            <p className="text-[10px] font-bold uppercase tracking-widest text-on-surface/40 mt-1">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Top intents */}
      {stats.topIntents.length > 0 && (
        <div className="bg-surface-container-lowest rounded-xl p-4 shadow-editorial">
          <p className="text-[10px] font-bold uppercase tracking-widest text-on-surface/40 mb-3">INTENCIONES MÁS FRECUENTES</p>
          <div className="flex flex-wrap gap-2">
            {stats.topIntents.map(({ intent, count }) => (
              <span key={intent} className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-authority-green/10 text-authority-green text-xs font-semibold">
                {intent}
                <span className="bg-authority-green/20 rounded px-1 text-[10px]">{count}</span>
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-on-surface/30" />
        <input
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Buscar en conversaciones, intenciones..."
          className="w-full pl-9 pr-4 py-2.5 bg-surface-container rounded-xl border border-outline-variant text-sm placeholder:text-on-surface/30 focus:outline-none focus:ring-2 focus:ring-authority-green/30"
        />
      </div>

      {/* Conversation list */}
      <div className="space-y-3">
        {filtered.length === 0 && (
          <div className="text-center py-12 text-on-surface/40 text-sm">
            {search ? 'No hay resultados para esa búsqueda' : 'No hay conversaciones del portal aún'}
          </div>
        )}
        {filtered.map(conv => <ConversacionRow key={conv.id} conv={conv} />)}
      </div>
    </div>
  )
}
