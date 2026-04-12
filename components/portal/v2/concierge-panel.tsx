'use client'

import { useEffect, useRef } from 'react'
import { usePortalAgent } from '@/store/portal-agent-store'
import { FloatingCommandBar } from './floating-command-bar'
import type { AgentMessage, PropertyItem } from '@/store/portal-agent-store'

interface ConciergePanelProps {
  onSend: (text: string) => void
}

function TypingDots() {
  return (
    <div className="flex gap-1 items-center px-3 py-2">
      {[0, 1, 2].map((i) => (
        <div
          key={i}
          className="w-1.5 h-1.5 rounded-full bg-on-surface/30 animate-pulse"
          style={{ animationDelay: `${i * 0.15}s` }}
        />
      ))}
    </div>
  )
}

function PropertyPill({ prop }: { prop: PropertyItem }) {
  const focusProperty = usePortalAgent((s) => s.focusProperty)
  const highlightProperty = usePortalAgent((s) => s.highlightProperty)

  return (
    <button
      onClick={() => focusProperty(prop)}
      onMouseEnter={() => highlightProperty(prop.codigo)}
      onMouseLeave={() => highlightProperty(null)}
      className="text-left flex items-center gap-2 rounded-lg bg-surface-container px-3 py-2 text-xs hover:bg-surface-container-high transition-colors w-full"
    >
      <span className="w-1.5 h-1.5 rounded-full bg-brand-teal shrink-0" />
      <span className="text-on-surface font-medium truncate">
        {prop.ubicacion ?? prop.ciudad ?? prop.codigo}
      </span>
      {prop.precio != null && (
        <span className="ml-auto text-on-surface/50 shrink-0">
          ${(prop.precio / 1_000_000).toFixed(0)}M
        </span>
      )}
    </button>
  )
}

function MessageBubble({ msg }: { msg: AgentMessage }) {
  const isUser = msg.role === 'user'

  return (
    <div className={['flex', isUser ? 'justify-end' : 'justify-start'].join(' ')}>
      <div
        className={[
          'max-w-[85%] rounded-2xl px-3.5 py-2.5 text-sm leading-relaxed',
          isUser
            ? 'bg-authority-green text-white rounded-br-sm'
            : 'bg-surface-container text-on-surface rounded-bl-sm',
        ].join(' ')}
      >
        {msg.text}

        {/* Inline property pills for assistant messages */}
        {!isUser && msg.properties && msg.properties.length > 0 && (
          <div className="mt-2 space-y-1">
            {msg.properties.slice(0, 4).map((p) => (
              <PropertyPill key={p.codigo} prop={p} />
            ))}
            {msg.properties.length > 4 && (
              <p className="text-[11px] text-on-surface/40 px-1">
                +{msg.properties.length - 4} más en el mapa
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

export function ConciergePanel({ onSend }: ConciergePanelProps) {
  const messages = usePortalAgent((s) => s.messages)
  const isProcessing = usePortalAgent((s) => s.isProcessing)
  const isPanelCollapsed = usePortalAgent((s) => s.isPanelCollapsed)
  const togglePanel = usePortalAgent((s) => s.togglePanel)
  const scrollRef = useRef<HTMLDivElement>(null)

  // Auto-scroll to bottom on new messages
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [messages, isProcessing])

  return (
    <aside
      className={[
        'flex flex-col bg-surface border-l border-outline-variant/30 transition-all duration-300',
        'w-full md:w-80 lg:w-96 shrink-0',
        isPanelCollapsed ? 'md:w-12' : '',
      ].join(' ')}
    >
      {/* Panel header */}
      <div className="flex items-center justify-between px-4 h-12 border-b border-outline-variant/20 shrink-0">
        {!isPanelCollapsed && (
          <span className="text-xs font-semibold text-on-surface/70 uppercase tracking-wider">
            Concierge
          </span>
        )}
        <button
          onClick={togglePanel}
          className="ml-auto w-7 h-7 flex items-center justify-center rounded-lg text-on-surface/40 hover:text-on-surface hover:bg-surface-container transition-colors text-xs"
          aria-label={isPanelCollapsed ? 'Expandir panel' : 'Colapsar panel'}
        >
          {isPanelCollapsed ? '»' : '«'}
        </button>
      </div>

      {!isPanelCollapsed && (
        <>
          {/* Messages */}
          <div
            ref={scrollRef}
            className="flex-1 overflow-y-auto hide-scrollbar px-3 py-4 space-y-3"
          >
            {messages.length === 0 && (
              <div className="flex flex-col items-center justify-center h-full gap-3 text-center py-8">
                <div className="w-10 h-10 rounded-full bg-brand-teal/10 flex items-center justify-center">
                  <span className="text-brand-teal text-lg">✦</span>
                </div>
                <p className="text-xs text-on-surface/50 max-w-[180px] leading-relaxed">
                  Cuéntame qué estás buscando y encontraré las mejores opciones.
                </p>
              </div>
            )}

            {messages.map((msg) => (
              <MessageBubble key={msg.id} msg={msg} />
            ))}

            {isProcessing && (
              <div className="flex justify-start">
                <div className="bg-surface-container rounded-2xl rounded-bl-sm">
                  <TypingDots />
                </div>
              </div>
            )}
          </div>

          {/* Command bar */}
          <FloatingCommandBar onSend={onSend} />
        </>
      )}
    </aside>
  )
}
