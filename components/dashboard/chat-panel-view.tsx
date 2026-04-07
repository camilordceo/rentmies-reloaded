'use client'

import { useState, useRef, useEffect } from 'react'
import {
  Send, Bot, User, ChevronLeft, ChevronRight,
  Paperclip, Mic, Play, Pause, FileText, Download,
  AlertTriangle, Sparkles,
} from 'lucide-react'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'
import { getWindowStatus } from '@/lib/utils'
import type { ConversationWithContact, Message } from '@/lib/types'

interface ChatPanelViewProps {
  conversation: ConversationWithContact
  messages: Message[]
  loading: boolean
  onSendMessage: (text: string) => void
  onToggleMode: (convId: string, currentMode: string) => void
  onBack: () => void
  onShowContact: () => void
}

export function ChatPanelView({
  conversation: conv,
  messages,
  loading,
  onSendMessage,
  onToggleMode,
  onBack,
  onShowContact,
}: ChatPanelViewProps) {
  const [input, setInput] = useState('')
  const [playingId, setPlayingId] = useState<string | null>(null)
  const scrollRef = useRef<HTMLDivElement>(null)

  const ws = getWindowStatus(conv.last_client_response_at)
  const isWindowClosed = ws.status === 'closed'

  const contact = conv.contacts
  const name = contact?.nombre ?? 'Desconocido'
  const initials = name.split(' ').map((n: string) => n[0]).slice(0, 2).join('').toUpperCase()

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [messages])

  const handleSend = () => {
    if (!input.trim()) return
    onSendMessage(input.trim())
    setInput('')
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  return (
    <div className="flex flex-col bg-white rounded-xl border border-[#e5e5e5] shadow-sm h-full overflow-hidden">
      {/* Header */}
      <div className="p-3 border-b border-[#e5e5e5] flex-shrink-0">
        <div className="flex items-center gap-3">
          <button
            className="md:hidden p-1.5 hover:bg-[#f0f0f0] rounded-lg transition-colors"
            onClick={onBack}
          >
            <ChevronLeft className="w-5 h-5 text-[#6b7280]" />
          </button>

          <div className="w-9 h-9 rounded-full bg-[#f0f0f0] flex items-center justify-center text-sm font-medium text-[#1a1a1a] flex-shrink-0">
            {initials}
          </div>

          <div className="flex-1 min-w-0">
            <p className="font-medium text-sm text-[#1a1a1a] truncate">{name}</p>
            <p className="text-xs text-[#6b7280]">{contact?.phone ?? ''}</p>
          </div>

          {/* Mode toggle */}
          <div className="flex items-center gap-2 flex-shrink-0">
            <span className="text-xs text-[#6b7280] hidden sm:block">
              {conv.mode === 'ia' ? 'IA' : 'Manual'}
            </span>
            <button
              onClick={() => onToggleMode(conv.id, conv.mode)}
              className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${
                conv.mode === 'manual' ? 'bg-[#40d99d]' : 'bg-[#e5e5e5]'
              }`}
            >
              <span
                className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white transition-transform ${
                  conv.mode === 'manual' ? 'translate-x-4' : 'translate-x-1'
                }`}
              />
            </button>
            {conv.mode === 'ia' ? (
              <Bot className="w-4 h-4 text-[#40d99d]" />
            ) : (
              <User className="w-4 h-4 text-[#1a1a1a]" />
            )}
          </div>

          {/* Contact panel toggle */}
          <button
            className="lg:hidden p-1.5 hover:bg-[#f0f0f0] rounded-lg transition-colors"
            onClick={onShowContact}
          >
            <ChevronRight className="w-5 h-5 text-[#6b7280]" />
          </button>
        </div>
      </div>

      {/* Window banner */}
      {ws.status !== 'open' && (
        <div className={`px-4 py-2.5 flex-shrink-0 border-b ${
          ws.status === 'warning'
            ? 'bg-amber-50 border-amber-200'
            : 'bg-blue-50 border-blue-200'
        }`}>
          <div className="flex items-start gap-2">
            <AlertTriangle className={`w-4 h-4 mt-0.5 flex-shrink-0 ${
              ws.status === 'warning' ? 'text-amber-600' : 'text-blue-600'
            }`} />
            <div>
              <p className={`text-xs font-medium ${
                ws.status === 'warning' ? 'text-amber-700' : 'text-blue-700'
              }`}>
                {ws.label}
              </p>
              {ws.bannerDesc && (
                <p className="text-xs text-blue-600 mt-0.5">{ws.bannerDesc}</p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Messages */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-3">
        {loading ? (
          <div className="space-y-3">
            {[...Array(4)].map((_, i) => (
              <div key={i} className={`flex ${i % 2 === 0 ? 'justify-start' : 'justify-end'}`}>
                <div className={`h-10 rounded-2xl bg-[#f0f0f0] animate-pulse ${i % 2 === 0 ? 'w-48' : 'w-36'}`} />
              </div>
            ))}
          </div>
        ) : messages.length === 0 ? (
          <div className="h-full flex items-center justify-center">
            <p className="text-sm text-[#6b7280]">No hay mensajes aún</p>
          </div>
        ) : (
          messages.map((msg) => (
            <MessageBubble
              key={msg.id}
              message={msg}
              isPlaying={playingId === msg.id}
              onToggleAudio={(id) => setPlayingId((prev) => (prev === id ? null : id))}
            />
          ))
        )}
      </div>

      {/* Input */}
      <div className="p-3 border-t border-[#e5e5e5] flex-shrink-0">
        {isWindowClosed ? (
          <div className="text-center py-3">
            <p className="text-xs text-[#6b7280] mb-2">Ventana de 24h cerrada</p>
            <button className="inline-flex items-center gap-1.5 bg-[#40d99d] text-white text-xs px-4 py-2 rounded-lg hover:bg-[#4fffb4] transition-colors">
              <Sparkles className="w-3.5 h-3.5" />
              Usar plantilla
            </button>
          </div>
        ) : (
          <div className="flex items-end gap-2">
            <div className="flex items-center gap-1 flex-shrink-0">
              <button className="p-1.5 hover:bg-[#f0f0f0] rounded-lg text-[#6b7280] hover:text-[#1a1a1a] transition-colors">
                <Paperclip className="w-4 h-4" />
              </button>
              <button className="p-1.5 hover:bg-[#f0f0f0] rounded-lg text-[#6b7280] hover:text-[#1a1a1a] transition-colors">
                <Mic className="w-4 h-4" />
              </button>
            </div>

            <textarea
              placeholder={conv.mode === 'ia' ? 'IA está respondiendo...' : 'Escribe un mensaje...'}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              disabled={conv.mode === 'ia'}
              rows={1}
              className="flex-1 min-h-[40px] max-h-[120px] resize-none text-sm px-3 py-2 rounded-lg border border-[#e5e5e5] bg-[#f8f8f8] text-[#1a1a1a] placeholder:text-[#6b7280] focus:outline-none focus:border-[#40d99d] focus:ring-1 focus:ring-[#40d99d] disabled:opacity-60 transition-colors"
            />

            <button
              onClick={handleSend}
              disabled={!input.trim() || conv.mode === 'ia'}
              className="h-9 w-9 flex items-center justify-center bg-[#40d99d] text-white rounded-lg hover:bg-[#4fffb4] disabled:opacity-40 disabled:cursor-not-allowed transition-colors flex-shrink-0"
            >
              <Send className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

function MessageBubble({
  message: msg,
  isPlaying,
  onToggleAudio,
}: {
  message: Message
  isPlaying: boolean
  onToggleAudio: (id: string) => void
}) {
  const isIncoming = msg.sender === 'customer'

  return (
    <div className={`flex ${isIncoming ? 'justify-start' : 'justify-end'}`}>
      <div className={`max-w-[75%] flex flex-col gap-1 ${isIncoming ? '' : 'items-end'}`}>
        {(msg.sender === 'ia' || msg.sender === 'agent') && (
          <div className={`flex items-center gap-1 ${isIncoming ? '' : 'justify-end'}`}>
            {msg.sender === 'ia' ? (
              <><Bot className="w-3 h-3 text-[#40d99d]" /><span className="text-[10px] text-[#40d99d] font-medium">IA</span></>
            ) : (
              <><User className="w-3 h-3 text-[#1a1a1a]" /><span className="text-[10px] text-[#1a1a1a] font-medium">Agente</span></>
            )}
          </div>
        )}

        <div className={`rounded-2xl px-3.5 py-2.5 ${
          isIncoming
            ? 'bg-[#f0f0f0] text-[#1a1a1a] rounded-tl-sm'
            : msg.sender === 'ia'
            ? 'bg-[#40d99d]/15 text-[#1a1a1a] rounded-tr-sm'
            : 'bg-[#1a1a1a] text-white rounded-tr-sm'
        }`}>
          {msg.type === 'text' && (
            <p className="text-sm whitespace-pre-wrap leading-relaxed">{msg.text}</p>
          )}

          {msg.type === 'audio' && (
            <div className="flex items-center gap-2.5">
              <button
                onClick={() => onToggleAudio(msg.id)}
                className="w-7 h-7 rounded-full bg-[#40d99d] text-white flex items-center justify-center flex-shrink-0"
              >
                {isPlaying ? <Pause className="w-3 h-3" /> : <Play className="w-3 h-3 ml-0.5" />}
              </button>
              <div className="flex gap-px items-end h-6">
                {Array.from({ length: 20 }).map((_, i) => (
                  <div
                    key={i}
                    className="w-0.5 rounded-full bg-[#40d99d]/50"
                    style={{ height: `${Math.random() * 16 + 4}px` }}
                  />
                ))}
              </div>
              <span className="text-xs opacity-70">{msg.duration}</span>
            </div>
          )}

          {msg.type === 'document' && (
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-lg bg-[#40d99d]/20 flex items-center justify-center flex-shrink-0">
                <FileText className="w-5 h-5" />
              </div>
              <div className="min-w-0">
                <p className="text-xs font-medium truncate">{msg.file_name}</p>
                <p className="text-[11px] opacity-60">{msg.file_size}</p>
              </div>
              <button className="p-1.5 rounded-md hover:bg-[#40d99d]/10 flex-shrink-0">
                <Download className="w-3.5 h-3.5" />
              </button>
            </div>
          )}
        </div>

        <span className={`text-[10px] text-[#6b7280] px-1 ${isIncoming ? '' : 'text-right'}`}>
          {format(new Date(msg.created_at), 'HH:mm', { locale: es })}
        </span>
      </div>
    </div>
  )
}
