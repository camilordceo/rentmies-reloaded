'use client'

import { useEffect, useRef, useState } from 'react'
import { formatDistanceToNow } from 'date-fns'
import { es } from 'date-fns/locale'
import { User, Sparkles, Phone } from 'lucide-react'
import type { Mensaje, ConversacionWithDetails } from '@/lib/types'

interface ChatViewWAProps {
  conversation: ConversacionWithDetails
}

export function ChatViewWA({ conversation }: ChatViewWAProps) {
  const [messages, setMessages] = useState<Mensaje[]>([])
  const [loading, setLoading] = useState(true)
  const bottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    setLoading(true)
    fetch(`/api/conversations/${conversation.id}/messages`)
      .then((r) => r.json())
      .then((data) => setMessages(data.data || []))
      .finally(() => setLoading(false))
  }, [conversation.id])

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const user = conversation.user_conversacion
  const agent = conversation.whatsapp_ai

  return (
    <div className="flex flex-col h-full">
      {/* Chat header */}
      <div className="flex items-center gap-3 px-5 py-3.5 bg-surface-container-lowest flex-shrink-0">
        <div className="w-9 h-9 rounded-full bg-surface-container flex items-center justify-center">
          <User className="w-4 h-4 text-on-surface/40" />
        </div>
        <div className="flex-1">
          <p className="text-sm font-semibold text-on-surface">{user?.nombre || 'Contacto'}</p>
          <div className="flex items-center gap-3 text-xs text-on-surface/40">
            <span className="flex items-center gap-1">
              <Phone className="w-3 h-3" />
              +{user?.telefono}
            </span>
            <span>·</span>
            <span className="flex items-center gap-1">
              <Sparkles className="w-3 h-3 text-brand-teal" />
              {agent?.nombre_agente || 'Agente'}
            </span>
          </div>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-5 py-4 space-y-3 bg-surface">
        {loading ? (
          <div className="flex items-center justify-center h-full">
            <p className="text-sm text-on-surface/40">Cargando mensajes...</p>
          </div>
        ) : messages.length === 0 ? (
          <div className="flex items-center justify-center h-full">
            <p className="text-sm text-on-surface/40">Sin mensajes aún</p>
          </div>
        ) : (
          messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex ${msg.rol === 'user' ? 'justify-start' : 'justify-end'}`}
            >
              <div
                className={`max-w-[75%] rounded-2xl px-3.5 py-2.5 shadow-editorial ${
                  msg.rol === 'user'
                    ? 'bg-surface-container-lowest rounded-tl-sm'
                    : 'bg-brand-teal text-white rounded-tr-sm'
                }`}
              >
                <p className={`text-sm whitespace-pre-wrap ${msg.rol === 'user' ? 'text-on-surface' : 'text-white'}`}>
                  {msg.texto}
                </p>
                <p
                  className={`text-[10px] mt-1 ${
                    msg.rol === 'user' ? 'text-on-surface/40' : 'text-white/70'
                  }`}
                >
                  {msg.created_at
                    ? formatDistanceToNow(new Date(msg.created_at), { addSuffix: true, locale: es })
                    : ''}
                </p>
              </div>
            </div>
          ))
        )}
        <div ref={bottomRef} />
      </div>
    </div>
  )
}
