'use client'

import { formatDistanceToNow } from 'date-fns'
import { es } from 'date-fns/locale'
import { MessageSquare, User } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { ConversacionWithDetails } from '@/lib/types'

interface ConversationListWAProps {
  conversations: ConversacionWithDetails[]
  selectedId?: string
  onSelect: (id: string) => void
}

export function ConversationListWA({ conversations, selectedId, onSelect }: ConversationListWAProps) {
  if (conversations.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-center p-8">
        <MessageSquare className="w-10 h-10 text-on-surface/15 mb-3" />
        <p className="text-sm text-on-surface/40">No hay conversaciones</p>
      </div>
    )
  }

  return (
    <div>
      {conversations.map((conv) => {
        const user = conv.user_conversacion
        const agent = conv.whatsapp_ai
        const isActive = conv.id === selectedId

        return (
          <button
            key={conv.id}
            onClick={() => onSelect(conv.id)}
            className={cn(
              'w-full text-left px-4 py-3.5 transition-all border-t border-outline-variant/10 first:border-t-0',
              isActive
                ? 'bg-brand-teal/5'
                : 'hover:bg-surface-container-lowest/50'
            )}
          >
            <div className="flex items-start gap-3">
              <div className={cn(
                'w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5 transition-colors',
                isActive ? 'bg-brand-teal/20' : 'bg-surface-container-lowest'
              )}>
                <User className={cn('w-4 h-4', isActive ? 'text-brand-teal' : 'text-on-surface/40')} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-0.5">
                  <span className={cn(
                    'text-sm font-medium truncate',
                    isActive ? 'text-on-surface' : 'text-on-surface/80'
                  )}>
                    {user?.nombre || `+${user?.telefono}`}
                  </span>
                  {conv.ultimo_mensaje_at && (
                    <span className="text-[10px] text-on-surface/40 ml-2 flex-shrink-0">
                      {formatDistanceToNow(new Date(conv.ultimo_mensaje_at), {
                        addSuffix: true,
                        locale: es,
                      })}
                    </span>
                  )}
                </div>
                <p className="text-xs text-on-surface/40 truncate">
                  {agent?.nombre_agente || 'Agente'} · +{user?.telefono}
                </p>
              </div>
              {isActive && (
                <div className="w-1.5 h-1.5 rounded-full bg-brand-teal flex-shrink-0 mt-2" />
              )}
            </div>
          </button>
        )
      })}
    </div>
  )
}
