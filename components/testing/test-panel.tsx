'use client'

import { useState } from 'react'
import { Send, FlaskConical, RefreshCw, Sparkles } from 'lucide-react'
import type { WhatsappAI } from '@/lib/types'

interface TestPanelProps {
  agents: WhatsappAI[]
}

export function TestPanel({ agents }: TestPanelProps) {
  // Send mode
  const [selectedAgentId, setSelectedAgentId] = useState('')
  const [toPhone, setToPhone] = useState('')
  const [messageText, setMessageText] = useState('')
  const [sendResult, setSendResult] = useState<string | null>(null)
  const [sending, setSending] = useState(false)

  // Simulate mode
  const [simAgentNumber, setSimAgentNumber] = useState('')
  const [simContactPhone, setSimContactPhone] = useState('')
  const [simContactName, setSimContactName] = useState('')
  const [simMessage, setSimMessage] = useState('')
  const [simResult, setSimResult] = useState<string | null>(null)
  const [simulating, setSimulating] = useState(false)

  const selectedAgent = agents.find((a) => a.id === selectedAgentId)

  async function handleSend() {
    if (!selectedAgent || !toPhone || !messageText) return
    setSending(true)
    setSendResult(null)
    try {
      const res = await fetch('/api/test/send-message', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          to: toPhone,
          channelUuid: selectedAgent.channel_uuid_callbell,
          text: messageText,
          mode: 'send',
        }),
      })
      const data = await res.json()
      setSendResult(JSON.stringify(data, null, 2))
    } catch (err) {
      setSendResult(`Error: ${err instanceof Error ? err.message : String(err)}`)
    } finally {
      setSending(false)
    }
  }

  async function handleSimulate() {
    if (!simAgentNumber || !simContactPhone || !simMessage) return
    setSimulating(true)
    setSimResult(null)
    try {
      const res = await fetch('/api/test/send-message', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          mode: 'simulate',
          agentNumber: simAgentNumber,
          contactPhone: simContactPhone,
          contactName: simContactName || 'Test User',
          text: simMessage,
        }),
      })
      const data = await res.json()
      setSimResult(JSON.stringify(data, null, 2))
    } catch (err) {
      setSimResult(`Error: ${err instanceof Error ? err.message : String(err)}`)
    } finally {
      setSimulating(false)
    }
  }

  const inputClass = 'w-full h-9 px-3 bg-surface-container rounded-lg text-sm text-on-surface placeholder:text-on-surface/35 outline-none focus:ring-2 focus:ring-brand-teal/30 transition-all'
  const labelClass = 'block text-xs font-semibold text-on-surface/50 mb-1.5'

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Send real message */}
      <div className="bg-surface-container-lowest rounded-xl p-5 shadow-editorial">
        <div className="flex items-center gap-2 mb-5">
          <div className="w-8 h-8 bg-brand-teal/10 rounded-lg flex items-center justify-center">
            <Send className="w-4 h-4 text-brand-teal" />
          </div>
          <div>
            <p className="text-[10px] font-bold uppercase tracking-widest text-brand-teal">En vivo</p>
            <h2 className="text-sm font-bold text-on-surface">Enviar mensaje real</h2>
          </div>
        </div>

        <div className="space-y-3">
          <div>
            <label className={labelClass}>Agente WhatsApp AI</label>
            <select
              value={selectedAgentId}
              onChange={(e) => setSelectedAgentId(e.target.value)}
              className={inputClass}
            >
              <option value="">Seleccionar agente...</option>
              {agents.map((a) => (
                <option key={a.id} value={a.id}>
                  {a.nombre_agente || 'Sin nombre'} (+{a.numero_whatsapp})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className={labelClass}>Teléfono destino</label>
            <input
              type="text"
              value={toPhone}
              onChange={(e) => setToPhone(e.target.value)}
              placeholder="573001234567"
              className={inputClass + ' font-mono'}
            />
          </div>

          <div>
            <label className={labelClass}>Mensaje</label>
            <textarea
              value={messageText}
              onChange={(e) => setMessageText(e.target.value)}
              rows={3}
              placeholder="Escribe el mensaje..."
              className="w-full px-3 py-2 bg-surface-container rounded-lg text-sm text-on-surface placeholder:text-on-surface/35 outline-none focus:ring-2 focus:ring-brand-teal/30 transition-all resize-none"
            />
          </div>

          <button
            onClick={handleSend}
            disabled={sending || !selectedAgentId || !toPhone || !messageText}
            className="w-full flex items-center justify-center gap-2 h-9 bg-brand-teal text-white text-sm font-semibold rounded-lg hover:bg-brand-teal/90 disabled:opacity-50 transition-all"
          >
            {sending ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
            {sending ? 'Enviando...' : 'Enviar via Callbell'}
          </button>

          {sendResult && (
            <pre className="p-3 bg-surface-container rounded-xl text-xs font-mono text-on-surface/70 overflow-auto max-h-32">
              {sendResult}
            </pre>
          )}
        </div>
      </div>

      {/* Simulate webhook */}
      <div className="bg-surface-container-lowest rounded-xl p-5 shadow-editorial">
        <div className="flex items-center gap-2 mb-5">
          <div className="w-8 h-8 bg-authority-green/10 rounded-lg flex items-center justify-center">
            <FlaskConical className="w-4 h-4 text-authority-green" />
          </div>
          <div>
            <p className="text-[10px] font-bold uppercase tracking-widest text-authority-green">Sandbox</p>
            <h2 className="text-sm font-bold text-on-surface">Simular webhook</h2>
          </div>
        </div>

        <div className="space-y-3">
          <div>
            <label className={labelClass}>Número del agente (to)</label>
            <select
              value={simAgentNumber}
              onChange={(e) => setSimAgentNumber(e.target.value)}
              className={inputClass}
            >
              <option value="">Seleccionar agente...</option>
              {agents.map((a) => (
                <option key={a.id} value={a.numero_whatsapp}>
                  {a.nombre_agente || 'Sin nombre'} (+{a.numero_whatsapp})
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className={labelClass}>Teléfono contacto (from)</label>
              <input
                type="text"
                value={simContactPhone}
                onChange={(e) => setSimContactPhone(e.target.value)}
                placeholder="573109876543"
                className={inputClass + ' font-mono'}
              />
            </div>
            <div>
              <label className={labelClass}>Nombre contacto</label>
              <input
                type="text"
                value={simContactName}
                onChange={(e) => setSimContactName(e.target.value)}
                placeholder="Test User"
                className={inputClass}
              />
            </div>
          </div>

          <div>
            <label className={labelClass}>Mensaje del usuario</label>
            <textarea
              value={simMessage}
              onChange={(e) => setSimMessage(e.target.value)}
              rows={3}
              placeholder="Hola, me interesa un apartamento en el chicó..."
              className="w-full px-3 py-2 bg-surface-container rounded-lg text-sm text-on-surface placeholder:text-on-surface/35 outline-none focus:ring-2 focus:ring-brand-teal/30 transition-all resize-none"
            />
          </div>

          <button
            onClick={handleSimulate}
            disabled={simulating || !simAgentNumber || !simContactPhone || !simMessage}
            className="w-full flex items-center justify-center gap-2 h-9 bg-authority-green text-white text-sm font-semibold rounded-lg hover:bg-authority-green/90 disabled:opacity-50 transition-all"
          >
            {simulating ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
            {simulating ? 'Simulando... (hasta 30s)' : 'Simular procesamiento completo'}
          </button>

          {simResult && (
            <pre className="p-3 bg-surface-container rounded-xl text-xs font-mono text-on-surface/70 overflow-auto max-h-32">
              {simResult}
            </pre>
          )}
        </div>
      </div>
    </div>
  )
}
