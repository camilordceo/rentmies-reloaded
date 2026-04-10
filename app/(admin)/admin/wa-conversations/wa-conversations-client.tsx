'use client'

import { useState, useMemo } from 'react'
import { Search, MessageSquare } from 'lucide-react'
import { ConversationListWA } from '@/components/whatsapp-conversations/conversation-list-wa'
import { ChatViewWA } from '@/components/whatsapp-conversations/chat-view-wa'
import type { ConversacionWithDetails, WhatsappAI } from '@/lib/types'

interface WaConversationsClientProps {
  conversations: ConversacionWithDetails[]
  agents: WhatsappAI[]
}

export function WaConversationsClient({ conversations, agents }: WaConversationsClientProps) {
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [search, setSearch] = useState('')
  const [filterAgent, setFilterAgent] = useState('')

  const filtered = useMemo(() => {
    return conversations.filter((c) => {
      const user = c.user_conversacion
      const matchSearch =
        !search ||
        user?.nombre?.toLowerCase().includes(search.toLowerCase()) ||
        user?.telefono?.includes(search)
      const matchAgent = !filterAgent || c.whatsapp_ai_id === filterAgent
      return matchSearch && matchAgent
    })
  }, [conversations, search, filterAgent])

  const selectedConv = conversations.find((c) => c.id === selectedId) || null

  return (
    <div className="flex h-[calc(100vh-theme(spacing.28))] -m-4 lg:-m-6 rounded-xl overflow-hidden border border-[#e5e5e5]">
      {/* Left panel */}
      <div className="w-80 flex-shrink-0 flex flex-col bg-white border-r border-[#e5e5e5]">
        {/* Header */}
        <div className="p-4 border-b border-[#e5e5e5]">
          <h1 className="text-base font-medium text-[#1a1a1a] mb-3">Conversaciones WhatsApp</h1>
          <div className="relative mb-2">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[#6b7280]" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Buscar por nombre o teléfono..."
              className="w-full h-8 pl-8 pr-3 border border-[#e5e5e5] rounded-lg text-xs text-[#1a1a1a] focus:outline-none focus:ring-2 focus:ring-[#40d99d]"
            />
          </div>
          <select
            value={filterAgent}
            onChange={(e) => setFilterAgent(e.target.value)}
            className="w-full h-8 px-2 border border-[#e5e5e5] rounded-lg text-xs text-[#1a1a1a] bg-white focus:outline-none focus:ring-2 focus:ring-[#40d99d]"
          >
            <option value="">Todos los agentes</option>
            {agents.map((a) => (
              <option key={a.id} value={a.id}>
                {a.nombre_agente || `+${a.numero_whatsapp}`}
              </option>
            ))}
          </select>
        </div>

        {/* List */}
        <div className="flex-1 overflow-y-auto">
          <ConversationListWA
            conversations={filtered}
            selectedId={selectedId || undefined}
            onSelect={setSelectedId}
          />
        </div>
      </div>

      {/* Right panel */}
      <div className="flex-1 flex flex-col bg-[#f8f8f8]">
        {selectedConv ? (
          <ChatViewWA conversation={selectedConv} />
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-center p-8">
            <div className="w-14 h-14 bg-[#f0f0f0] rounded-2xl flex items-center justify-center mb-3">
              <MessageSquare className="w-7 h-7 text-[#6b7280]" />
            </div>
            <p className="text-sm font-medium text-[#1a1a1a] mb-1">Selecciona una conversación</p>
            <p className="text-xs text-[#6b7280]">Elige una conversación de la lista para ver el chat</p>
          </div>
        )}
      </div>
    </div>
  )
}
