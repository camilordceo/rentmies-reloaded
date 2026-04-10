'use client'

import { useState } from 'react'
import { Send, FlaskConical, RefreshCw } from 'lucide-react'
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

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Send real message */}
      <div className="bg-white border border-[#e5e5e5] rounded-xl p-5 shadow-sm">
        <div className="flex items-center gap-2 mb-4">
          <Send className="w-4 h-4 text-[#40d99d]" />
          <h2 className="text-sm font-medium text-[#1a1a1a]">Enviar mensaje real</h2>
        </div>

        <div className="space-y-3">
          <div>
            <label className="block text-xs font-medium text-[#6b7280] mb-1">Agente WhatsApp AI</label>
            <select
              value={selectedAgentId}
              onChange={(e) => setSelectedAgentId(e.target.value)}
              className="w-full h-9 px-3 border border-[#e5e5e5] rounded-lg text-sm text-[#1a1a1a] bg-white focus:outline-none focus:ring-2 focus:ring-[#40d99d]"
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
            <label className="block text-xs font-medium text-[#6b7280] mb-1">Teléfono destino</label>
            <input
              type="text"
              value={toPhone}
              onChange={(e) => setToPhone(e.target.value)}
              placeholder="573001234567"
              className="w-full h-9 px-3 border border-[#e5e5e5] rounded-lg text-sm font-mono text-[#1a1a1a] focus:outline-none focus:ring-2 focus:ring-[#40d99d]"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-[#6b7280] mb-1">Mensaje</label>
            <textarea
              value={messageText}
              onChange={(e) => setMessageText(e.target.value)}
              rows={3}
              placeholder="Escribe el mensaje..."
              className="w-full px-3 py-2 border border-[#e5e5e5] rounded-lg text-sm text-[#1a1a1a] focus:outline-none focus:ring-2 focus:ring-[#40d99d] resize-none"
            />
          </div>

          <button
            onClick={handleSend}
            disabled={sending || !selectedAgentId || !toPhone || !messageText}
            className="w-full flex items-center justify-center gap-2 h-9 bg-[#40d99d] text-white text-sm font-medium rounded-lg hover:bg-[#40d99d]/90 disabled:opacity-50 transition-all"
          >
            {sending ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
            {sending ? 'Enviando...' : 'Enviar via Callbell'}
          </button>

          {sendResult && (
            <pre className="p-3 bg-[#f8f8f8] border border-[#e5e5e5] rounded-lg text-xs font-mono text-[#1a1a1a] overflow-auto max-h-32">
              {sendResult}
            </pre>
          )}
        </div>
      </div>

      {/* Simulate webhook */}
      <div className="bg-white border border-[#e5e5e5] rounded-xl p-5 shadow-sm">
        <div className="flex items-center gap-2 mb-4">
          <FlaskConical className="w-4 h-4 text-[#40d99d]" />
          <h2 className="text-sm font-medium text-[#1a1a1a]">Simular webhook (sin Callbell)</h2>
        </div>

        <div className="space-y-3">
          <div>
            <label className="block text-xs font-medium text-[#6b7280] mb-1">Número del agente (to)</label>
            <select
              value={simAgentNumber}
              onChange={(e) => setSimAgentNumber(e.target.value)}
              className="w-full h-9 px-3 border border-[#e5e5e5] rounded-lg text-sm text-[#1a1a1a] bg-white focus:outline-none focus:ring-2 focus:ring-[#40d99d]"
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
              <label className="block text-xs font-medium text-[#6b7280] mb-1">Teléfono contacto (from)</label>
              <input
                type="text"
                value={simContactPhone}
                onChange={(e) => setSimContactPhone(e.target.value)}
                placeholder="573109876543"
                className="w-full h-9 px-3 border border-[#e5e5e5] rounded-lg text-sm font-mono text-[#1a1a1a] focus:outline-none focus:ring-2 focus:ring-[#40d99d]"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-[#6b7280] mb-1">Nombre contacto</label>
              <input
                type="text"
                value={simContactName}
                onChange={(e) => setSimContactName(e.target.value)}
                placeholder="Test User"
                className="w-full h-9 px-3 border border-[#e5e5e5] rounded-lg text-sm text-[#1a1a1a] focus:outline-none focus:ring-2 focus:ring-[#40d99d]"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-[#6b7280] mb-1">Mensaje del usuario</label>
            <textarea
              value={simMessage}
              onChange={(e) => setSimMessage(e.target.value)}
              rows={3}
              placeholder="Hola, me interesa un apartamento en el chicó..."
              className="w-full px-3 py-2 border border-[#e5e5e5] rounded-lg text-sm text-[#1a1a1a] focus:outline-none focus:ring-2 focus:ring-[#40d99d] resize-none"
            />
          </div>

          <button
            onClick={handleSimulate}
            disabled={simulating || !simAgentNumber || !simContactPhone || !simMessage}
            className="w-full flex items-center justify-center gap-2 h-9 bg-[#1a1a1a] text-white text-sm font-medium rounded-lg hover:bg-[#1a1a1a]/80 disabled:opacity-50 transition-all"
          >
            {simulating ? <RefreshCw className="w-4 h-4 animate-spin" /> : <FlaskConical className="w-4 h-4" />}
            {simulating ? 'Simulando... (hasta 30s)' : 'Simular procesamiento completo'}
          </button>

          {simResult && (
            <pre className="p-3 bg-[#f8f8f8] border border-[#e5e5e5] rounded-lg text-xs font-mono text-[#1a1a1a] overflow-auto max-h-32">
              {simResult}
            </pre>
          )}
        </div>
      </div>
    </div>
  )
}
