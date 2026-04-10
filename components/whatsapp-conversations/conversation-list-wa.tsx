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
        <MessageSquare className="w-10 h-10 text-[#e5e5e5] mb-3" />
        <p className="text-sm text-[#6b7280]">No hay conversaciones</p>
      </div>
    )
  }

  return (
    <div className="divide-y divide-[#e5e5e5]">
      {conversations.map((conv) => {
        const user = conv.user_conversacion
        const agent = conv.whatsapp_ai
        const isActive = conv.id === selectedId

        return (
          <button
            key={conv.id}
            onClick={() => onSelect(conv.id)}
            className={cn(
              'w-full text-left px-4 py-3.5 transition-all hover:bg-[#f8f8f8]',
              isActive && 'bg-[#40d99d]/5 border-l-2 border-[#40d99d]'
            )}
          >
            <div className="flex items-start gap-3">
              <div className="w-9 h-9 rounded-full bg-[#f0f0f0] flex items-center justify-center flex-shrink-0 mt-0.5">
                <User className="w-4 h-4 text-[#6b7280]" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-0.5">
                  <span className="text-sm font-medium text-[#1a1a1a] truncate">
                    {user?.nombre || `+${user?.telefono}`}
                  </span>
                  {conv.ultimo_mensaje_at && (
                    <span className="text-xs text-[#6b7280] ml-2 flex-shrink-0">
                      {formatDistanceToNow(new Date(conv.ultimo_mensaje_at), {
                        addSuffix: true,
                        locale: es,
                      })}
                    </span>
                  )}
                </div>
                <p className="text-xs text-[#6b7280] truncate">
                  {agent?.nombre_agente || 'Agente'} · +{user?.telefono}
                </p>
              </div>
            </div>
          </button>
        )
      })}
    </div>
  )
}
