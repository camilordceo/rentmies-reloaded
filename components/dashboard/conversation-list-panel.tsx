'use client'

import { useState, useMemo } from 'react'
import { Search, Filter, Bot, User, Instagram, X, MessageSquare } from 'lucide-react'
import { formatRelativeTime, getWindowStatus, cn } from '@/lib/utils'
import type { ConversationWithContact, Contact } from '@/lib/types'

interface ConversationListPanelProps {
  conversations: ConversationWithContact[]
  contacts: Contact[]
  selectedId: string | null
  onSelect: (id: string) => void
}

export function ConversationListPanel({
  conversations,
  contacts,
  selectedId,
  onSelect,
}: ConversationListPanelProps) {
  const [search, setSearch] = useState('')
  const [channelFilter, setChannelFilter] = useState('all')
  const [showFilters, setShowFilters] = useState(false)

  const filtered = useMemo(() => {
    return conversations.filter((c) => {
      const contact = c.contacts
      const name = contact?.nombre ?? ''
      const phone = contact?.phone ?? ''
      const lastMsg = c.last_message ?? ''

      const q = search.toLowerCase()
      const matchesSearch =
        !q ||
        name.toLowerCase().includes(q) ||
        phone.includes(q) ||
        lastMsg.toLowerCase().includes(q)

      const matchesChannel = channelFilter === 'all' || c.channel === channelFilter

      return matchesSearch && matchesChannel
    })
  }, [conversations, search, channelFilter])

  return (
    <div className="flex flex-col bg-surface-container-lowest rounded-xl shadow-editorial overflow-hidden h-full">
      {/* Header */}
      <div className="p-3 space-y-2 flex-shrink-0">
        <div className="flex items-center gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-on-surface/40" />
            <input
              type="text"
              placeholder="Buscar..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full h-9 pl-9 pr-3 text-sm bg-surface-container rounded-lg text-on-surface placeholder:text-on-surface/35 outline-none focus:ring-2 focus:ring-brand-teal/30 transition-all"
            />
            {search && (
              <button onClick={() => setSearch('')} className="absolute right-3 top-1/2 -translate-y-1/2">
                <X className="w-3.5 h-3.5 text-on-surface/40" />
              </button>
            )}
          </div>
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={cn(
              'h-9 w-9 rounded-lg flex items-center justify-center transition-all flex-shrink-0',
              showFilters
                ? 'bg-brand-teal/10 text-brand-teal'
                : 'bg-surface-container text-on-surface/40 hover:text-on-surface'
            )}
          >
            <Filter className="w-4 h-4" />
          </button>
        </div>

        {showFilters && (
          <div className="flex gap-1 bg-surface-container rounded-xl p-1">
            {['all', 'whatsapp', 'instagram'].map((ch) => (
              <button
                key={ch}
                onClick={() => setChannelFilter(ch)}
                className={cn(
                  'flex-1 px-2 py-1.5 text-xs font-medium rounded-lg transition-all capitalize',
                  channelFilter === ch
                    ? 'bg-surface-container-lowest text-on-surface shadow-editorial'
                    : 'text-on-surface/50 hover:text-on-surface'
                )}
              >
                {ch === 'all' ? 'Todos' : ch}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Count */}
      <div className="px-3 pb-2 flex-shrink-0">
        <span className="text-[10px] font-bold uppercase tracking-widest text-on-surface/40">
          {filtered.length} conversación{filtered.length !== 1 ? 'es' : ''}
        </span>
      </div>

      {/* List */}
      <div className="flex-1 overflow-y-auto">
        {filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full py-16">
            <MessageSquare className="w-10 h-10 text-on-surface/15 mb-3" />
            <p className="text-sm text-on-surface/40">No hay conversaciones</p>
          </div>
        ) : (
          <div className="p-1.5 space-y-0.5">
            {filtered.map((conv) => (
              <ConversationRow
                key={conv.id}
                conversation={conv}
                isSelected={selectedId === conv.id}
                onSelect={() => onSelect(conv.id)}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

function ConversationRow({
  conversation: conv,
  isSelected,
  onSelect,
}: {
  conversation: ConversationWithContact
  isSelected: boolean
  onSelect: () => void
}) {
  const contact = conv.contacts
  const name = contact?.nombre ?? 'Desconocido'
  const initials = name.split(' ').map((n: string) => n[0]).slice(0, 2).join('').toUpperCase()
  const ws = getWindowStatus(conv.last_client_response_at)

  return (
    <div
      onClick={onSelect}
      className={cn(
        'p-3 rounded-xl cursor-pointer transition-all',
        isSelected
          ? 'bg-brand-teal/5'
          : conv.appointment_date
          ? 'bg-brand-teal/5 hover:bg-brand-teal/10'
          : 'hover:bg-surface-container'
      )}
    >
      <div className="flex items-start gap-3">
        {/* Avatar */}
        <div className="relative flex-shrink-0">
          <div className={cn(
            'w-10 h-10 rounded-full flex items-center justify-center text-sm font-semibold transition-colors',
            isSelected ? 'bg-brand-teal/20 text-brand-teal' : 'bg-surface-container text-on-surface/60'
          )}>
            {initials}
          </div>
          {/* Channel badge */}
          <div className="absolute -bottom-0.5 -right-0.5">
            {conv.channel === 'whatsapp' ? (
              <div className="w-4 h-4 rounded-full bg-[#25D366] flex items-center justify-center">
                <svg viewBox="0 0 24 24" fill="white" className="w-2.5 h-2.5">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" />
                </svg>
              </div>
            ) : (
              <div className="w-4 h-4 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
                <Instagram className="w-2 h-2 text-white" />
              </div>
            )}
          </div>
          {/* Window dot */}
          {ws.dotColor && (
            <span className={`absolute -top-0.5 -left-0.5 w-3 h-3 rounded-full border-2 border-surface-container-lowest ${ws.dotColor}`} />
          )}
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-1 mb-0.5">
            <p className="font-semibold text-sm text-on-surface truncate">{name}</p>
            <div className="flex items-center gap-1.5 flex-shrink-0">
              {(conv.unread ?? 0) > 0 && (
                <span className="w-5 h-5 bg-brand-teal text-white text-[10px] rounded-full flex items-center justify-center font-semibold">
                  {conv.unread}
                </span>
              )}
              <span className="text-[11px] text-on-surface/40">
                {conv.last_message_at ? formatRelativeTime(conv.last_message_at) : ''}
              </span>
            </div>
          </div>

          <p className="text-xs text-on-surface/40 truncate mb-1.5">{conv.last_message ?? 'Sin mensajes'}</p>

          <div className="flex items-center gap-1.5">
            <span className={cn(
              'inline-flex items-center gap-1 text-[10px] px-1.5 py-0.5 rounded font-semibold',
              conv.mode === 'ia'
                ? 'bg-brand-teal/10 text-brand-teal'
                : 'bg-surface-container text-on-surface/50'
            )}>
              {conv.mode === 'ia' ? <Bot className="w-2.5 h-2.5" /> : <User className="w-2.5 h-2.5" />}
              {conv.mode === 'ia' ? 'IA' : 'Manual'}
            </span>

            {ws.label && (
              <span className={cn(
                'inline-flex items-center text-[10px] px-1.5 py-0.5 rounded font-semibold',
                ws.dotColor === 'bg-amber-500'
                  ? 'bg-amber-50 text-amber-600'
                  : 'bg-blue-50 text-blue-600'
              )}>
                {ws.label}
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
