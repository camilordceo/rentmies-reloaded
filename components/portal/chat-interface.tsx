'use client'

import { useEffect, useRef, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ArrowLeft, Send, Bot } from 'lucide-react'
import { useChat } from '@/lib/hooks/use-chat'
import { PropertyCardInline } from './property-card-inline'
import { TypingIndicator } from './typing-indicator'
import { AgendarCitaForm } from './agendar-cita-form'

const FOLLOW_UPS = [
  '¿Y con parqueadero?',
  'Muéstrame opciones más económicas',
  '¿Hay algo similar en otra zona?',
  'Quiero ver más fotos de ese',
]

interface ChatInterfaceProps {
  empresa: { id: string; nombre: string; ciudad: string | null } | null
  initialMessage: string
  onBack: () => void
}

export function ChatInterface({ empresa, initialMessage, onBack }: ChatInterfaceProps) {
  const { messages, isLoading, sendMessage } = useChat(empresa?.id ?? null)
  const [input, setInput] = useState('')
  const [schedulingProperty, setSchedulingProperty] = useState<any | null>(null)
  const bottomRef = useRef<HTMLDivElement>(null)
  const initialized = useRef(false)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (!initialized.current && initialMessage) {
      initialized.current = true
      sendMessage(initialMessage)
    }
  }, [initialMessage, sendMessage])

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, isLoading])

  function handleSend() {
    if (!input.trim() || isLoading) return
    sendMessage(input.trim())
    setInput('')
    inputRef.current?.focus()
  }

  return (
    <div className="flex flex-col h-screen bg-[#f8f8f8]">
      {/* Header */}
      <div className="flex-shrink-0 h-14 bg-white border-b border-[#e5e5e5] flex items-center px-4 gap-3">
        <button onClick={onBack} className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-[#f0f0f0] transition-colors">
          <ArrowLeft className="w-4 h-4 text-[#6b7280]" />
        </button>
        <div className="w-7 h-7 bg-[#40d99d] rounded-lg flex items-center justify-center flex-shrink-0">
          <Bot className="w-4 h-4 text-white" />
        </div>
        <div>
          <p className="text-sm font-medium text-[#1a1a1a] leading-none">{empresa?.nombre ?? 'Rentmies'}</p>
          <p className="text-xs text-[#40d99d]">EMA · Agente IA</p>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4">
        <AnimatePresence initial={false}>
          {messages.map((msg) => (
            <motion.div
              key={msg.id}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ type: 'spring', damping: 22, stiffness: 300 }}
              className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              {msg.role === 'user' ? (
                <div className="max-w-[80%] px-4 py-3 rounded-2xl rounded-tr-sm bg-[#40d99d]/10 border border-[#40d99d]/20">
                  <p className="text-sm text-[#1a1a1a]">{msg.text}</p>
                </div>
              ) : (
                <div className="max-w-full space-y-3">
                  {msg.text && (
                    <div className="max-w-[85%] px-4 py-3 rounded-2xl rounded-tl-sm bg-white border border-[#e5e5e5] shadow-sm">
                      <p className="text-sm text-[#1a1a1a] leading-relaxed whitespace-pre-wrap">{msg.text}</p>
                    </div>
                  )}
                  {msg.properties && msg.properties.length > 0 && (
                    <div className="flex flex-wrap gap-3">
                      {msg.properties.map((p: any, i: number) => (
                        <PropertyCardInline
                          key={p.codigo ?? i}
                          property={p}
                          index={i}
                          onSchedule={setSchedulingProperty}
                        />
                      ))}
                    </div>
                  )}
                </div>
              )}
            </motion.div>
          ))}
        </AnimatePresence>

        {isLoading && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex justify-start"
          >
            <div className="px-4 py-3 bg-white border border-[#e5e5e5] rounded-2xl rounded-tl-sm shadow-sm">
              <TypingIndicator />
            </div>
          </motion.div>
        )}

        {/* Follow-up suggestions after first assistant message */}
        {messages.length >= 2 && !isLoading && (
          <div className="flex flex-wrap gap-2 justify-center py-2">
            {FOLLOW_UPS.map((s) => (
              <button
                key={s}
                onClick={() => sendMessage(s)}
                className="text-xs px-3 py-1.5 rounded-full border border-[#e5e5e5] text-[#6b7280] hover:border-[#40d99d] hover:text-[#40d99d] bg-white transition-colors"
              >
                {s}
              </button>
            ))}
          </div>
        )}

        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div className="flex-shrink-0 bg-white border-t border-[#e5e5e5] px-4 py-3">
        <div className="flex items-center gap-2 bg-[#f0f0f0] rounded-full px-4 py-2.5">
          <input
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && handleSend()}
            placeholder="Escribe tu búsqueda..."
            className="flex-1 text-sm text-[#1a1a1a] placeholder:text-[#9ca3af] bg-transparent outline-none"
          />
          <motion.button
            whileTap={{ scale: 0.9 }}
            onClick={handleSend}
            disabled={!input.trim() || isLoading}
            className="w-8 h-8 flex items-center justify-center rounded-full bg-[#40d99d] disabled:opacity-40 transition-opacity"
          >
            <Send className="w-3.5 h-3.5 text-white" />
          </motion.button>
        </div>
      </div>

      {/* Agendar cita drawer */}
      {schedulingProperty && (
        <AgendarCitaForm
          property={schedulingProperty}
          empresaId={empresa?.id ?? ''}
          onClose={() => setSchedulingProperty(null)}
        />
      )}
    </div>
  )
}
