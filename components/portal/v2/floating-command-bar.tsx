'use client'

import { useState, useRef, KeyboardEvent } from 'react'
import { useVoice } from '@/lib/hooks/use-voice'
import { usePortalAgent } from '@/store/portal-agent-store'

interface FloatingCommandBarProps {
  onSend: (text: string) => void
}

const WAVEFORM_DELAYS = ['0s', '0.1s', '0.2s', '0.3s', '0.4s']

export function FloatingCommandBar({ onSend }: FloatingCommandBarProps) {
  const [input, setInput] = useState('')
  const inputRef = useRef<HTMLTextAreaElement>(null)
  const isProcessing = usePortalAgent((s) => s.isProcessing)
  const transcript = usePortalAgent((s) => s.transcript)
  const setVoiceState = usePortalAgent((s) => s.setVoiceState)

  const handleSubmit = () => {
    const text = input.trim()
    if (!text || isProcessing) return
    setInput('')
    onSend(text)
    // Auto-resize reset
    if (inputRef.current) inputRef.current.style.height = 'auto'
  }

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSubmit()
    }
  }

  const { voiceState, isSupported, startListening, stopListening } = useVoice((text) => {
    setInput(text)
    setVoiceState('idle')
    // Auto-send after voice
    onSend(text)
  })

  const isListening = voiceState === 'listening'
  const displayValue = isListening ? transcript : input

  return (
    <div className="px-4 pb-4 pt-2 bg-surface/95 backdrop-blur-sm border-t border-outline-variant/30">
      <div
        className={[
          'flex items-end gap-2 rounded-2xl px-4 py-3 transition-all duration-200',
          'bg-surface-container-low border border-outline-variant/30',
          isListening ? 'border-brand-teal shadow-glow-subtle' : '',
        ].join(' ')}
      >
        {/* Waveform or textarea */}
        {isListening ? (
          <div className="flex-1 flex items-center gap-1 h-6">
            {WAVEFORM_DELAYS.map((delay, i) => (
              <div
                key={i}
                className="waveform-bar w-1 bg-brand-teal rounded-full"
                style={{ animationDelay: delay }}
              />
            ))}
            <span className="ml-2 text-sm text-on-surface/50 italic">
              {transcript || 'Escuchando…'}
            </span>
          </div>
        ) : (
          <textarea
            ref={inputRef}
            value={displayValue}
            onChange={(e) => {
              setInput(e.target.value)
              e.target.style.height = 'auto'
              e.target.style.height = `${Math.min(e.target.scrollHeight, 120)}px`
            }}
            onKeyDown={handleKeyDown}
            placeholder="¿Qué tipo de inmueble buscas?"
            rows={1}
            disabled={isProcessing}
            className={[
              'flex-1 resize-none bg-transparent text-sm text-on-surface placeholder:text-on-surface/40',
              'outline-none leading-relaxed max-h-[120px] hide-scrollbar',
              isProcessing ? 'opacity-50' : '',
            ].join(' ')}
          />
        )}

        {/* Voice button */}
        {isSupported && (
          <button
            onClick={isListening ? stopListening : startListening}
            disabled={isProcessing}
            className={[
              'shrink-0 w-8 h-8 rounded-full flex items-center justify-center transition-all',
              isListening
                ? 'bg-brand-teal text-white animate-pulse-glow'
                : 'text-on-surface/40 hover:text-on-surface hover:bg-surface-container',
            ].join(' ')}
            aria-label={isListening ? 'Detener' : 'Hablar'}
          >
            <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4" aria-hidden>
              <path d="M12 2a3 3 0 0 1 3 3v6a3 3 0 0 1-6 0V5a3 3 0 0 1 3-3zm-1 15.93V20H9v2h6v-2h-2v-2.07A7.003 7.003 0 0 0 19 11h-2a5 5 0 0 1-10 0H5a7.003 7.003 0 0 0 6 6.93z" />
            </svg>
          </button>
        )}

        {/* Send button */}
        <button
          onClick={handleSubmit}
          disabled={!input.trim() || isProcessing || isListening}
          className={[
            'shrink-0 w-8 h-8 rounded-full flex items-center justify-center transition-all',
            input.trim() && !isProcessing && !isListening
              ? 'bg-authority-green text-white hover:bg-authority-green/90 shadow-glow-subtle'
              : 'bg-surface-container text-on-surface/30',
          ].join(' ')}
          aria-label="Enviar"
        >
          <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4" aria-hidden>
            <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z" />
          </svg>
        </button>
      </div>

      {/* Processing indicator */}
      {isProcessing && (
        <div className="flex items-center gap-2 px-2 mt-2">
          <div className="flex gap-1">
            {[0, 1, 2].map((i) => (
              <div
                key={i}
                className="w-1 h-1 rounded-full bg-brand-teal animate-pulse"
                style={{ animationDelay: `${i * 0.15}s` }}
              />
            ))}
          </div>
          <span className="text-[11px] text-on-surface/40">El agente está buscando…</span>
        </div>
      )}
    </div>
  )
}
