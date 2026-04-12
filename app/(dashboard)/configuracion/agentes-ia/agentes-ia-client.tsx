'use client'

import { useState, useRef } from 'react'
import { toast } from 'sonner'
import { Plus, Bot, Mic, MessageSquare, Facebook, Trash2, ChevronDown, ChevronUp, ToggleLeft, ToggleRight, Upload, Loader2, CheckCircle2 } from 'lucide-react'
import type { AgenteIA } from '@/lib/types/database'

interface AgentesIAClientProps {
  agentes: AgenteIA[]
  empresaId: string
}

const CANAL_LABELS = { whatsapp: 'WhatsApp IA', voz: 'Voz IA', web_chat: 'Web Chat IA', facebook_messenger: 'Facebook Messenger' }
const CANAL_ICONS = { whatsapp: MessageSquare, voz: Mic, web_chat: Bot, facebook_messenger: Facebook }

function AgenteCard({ agente, onUpdate, onDelete }: { agente: AgenteIA; onUpdate: (a: AgenteIA) => void; onDelete: (id: string) => void }) {
  const [expanded, setExpanded] = useState(false)
  const [instrucciones, setInstrucciones] = useState(agente.instrucciones || '')
  const [saving, setSaving] = useState(false)
  const [toggling, setToggling] = useState(false)
  const Icon = CANAL_ICONS[agente.canal] || Bot

  async function saveInstrucciones() {
    setSaving(true)
    const res = await fetch(`/api/agentes-ia/${agente.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ instrucciones }),
    })
    const { data } = await res.json()
    setSaving(false)
    if (data) { onUpdate(data); toast.success('Instrucciones guardadas') }
    else toast.error('Error al guardar')
  }

  async function toggleActivo() {
    setToggling(true)
    const res = await fetch(`/api/agentes-ia/${agente.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ activo: !agente.activo }),
    })
    const { data } = await res.json()
    setToggling(false)
    if (data) onUpdate(data)
  }

  async function handleDelete() {
    if (!confirm(`¿Eliminar agente "${agente.nombre}"?`)) return
    const res = await fetch(`/api/agentes-ia/${agente.id}`, { method: 'DELETE' })
    if (res.ok) { onDelete(agente.id); toast.success('Agente eliminado') }
    else toast.error('Error al eliminar')
  }

  return (
    <div className={`bg-white border rounded-xl shadow-sm overflow-hidden transition-all ${agente.activo ? 'border-[#e5e5e5]' : 'border-[#f0f0f0] opacity-60'}`}>
      <div className="flex items-center gap-3 p-4">
        <div className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 ${agente.canal === 'whatsapp' ? 'bg-[#40d99d]/10 text-[#40d99d]' : agente.canal === 'voz' ? 'bg-purple-50 text-purple-500' : 'bg-blue-50 text-blue-500'}`}>
          <Icon className="w-4 h-4" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <p className="text-sm font-medium text-[#1a1a1a] truncate">{agente.nombre}</p>
            <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-[#f0f0f0] text-[#6b7280] font-medium flex-shrink-0">
              {CANAL_LABELS[agente.canal]}
            </span>
          </div>
          <p className="text-xs text-[#6b7280] mt-0.5 truncate">
            {agente.canal === 'whatsapp' && agente.numero_whatsapp ? agente.numero_whatsapp : ''}
            {agente.canal === 'voz' && agente.elevenlabs_agent_id ? `Agent: ${agente.elevenlabs_agent_id.slice(0, 12)}…` : ''}
            {!agente.numero_whatsapp && !agente.elevenlabs_agent_id ? 'Sin configurar' : ''}
          </p>
        </div>
        <div className="flex items-center gap-1.5">
          <button onClick={toggleActivo} disabled={toggling} className="text-[#6b7280] hover:text-[#1a1a1a]">
            {agente.activo ? <ToggleRight className="w-5 h-5 text-[#40d99d]" /> : <ToggleLeft className="w-5 h-5" />}
          </button>
          <button onClick={handleDelete} className="text-[#6b7280] hover:text-red-500 transition-colors">
            <Trash2 className="w-4 h-4" />
          </button>
          <button onClick={() => setExpanded(e => !e)} className="text-[#6b7280] hover:text-[#1a1a1a] ml-1">
            {expanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {expanded && (
        <div className="border-t border-[#f0f0f0] p-4 space-y-4">
          {/* Stats row */}
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-[#f8f8f8] rounded-lg p-3 text-center">
              <p className="text-lg font-medium text-[#1a1a1a]">{agente.estadisticas?.mensajes_enviados ?? 0}</p>
              <p className="text-[10px] text-[#6b7280]">Mensajes enviados</p>
            </div>
            <div className="bg-[#f8f8f8] rounded-lg p-3 text-center">
              <p className="text-lg font-medium text-[#1a1a1a]">{agente.estadisticas?.llamadas_realizadas ?? 0}</p>
              <p className="text-[10px] text-[#6b7280]">Llamadas realizadas</p>
            </div>
          </div>

          {/* Instructions */}
          <div>
            <label className="text-xs font-medium text-[#6b7280] block mb-1.5">Instrucciones del agente</label>
            <textarea
              value={instrucciones}
              onChange={e => setInstrucciones(e.target.value)}
              rows={6}
              placeholder="Eres un agente inmobiliario de Rentmies. Tu objetivo es ayudar a los clientes a encontrar el inmueble ideal..."
              className="w-full px-3 py-2 border border-[#e5e5e5] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#40d99d] resize-none"
            />
            <button
              onClick={saveInstrucciones}
              disabled={saving}
              className="mt-2 flex items-center gap-1.5 px-3 py-2 bg-[#40d99d] text-white text-xs font-medium rounded-lg hover:bg-[#40d99d]/90 disabled:opacity-50 transition-all"
            >
              {saving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <CheckCircle2 className="w-3.5 h-3.5" />}
              {saving ? 'Guardando...' : 'Guardar instrucciones'}
            </button>
          </div>

          {/* IDs info */}
          {(agente.assistant_id || agente.elevenlabs_agent_id) && (
            <div className="bg-[#f8f8f8] rounded-lg p-3 space-y-1">
              <p className="text-[10px] font-medium text-[#6b7280] uppercase tracking-wide">IDs externos</p>
              {agente.assistant_id && (
                <p className="text-xs text-[#6b7280] font-mono">Azure: {agente.assistant_id}</p>
              )}
              {agente.elevenlabs_agent_id && (
                <p className="text-xs text-[#6b7280] font-mono">ElevenLabs: {agente.elevenlabs_agent_id}</p>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  )
}

function NuevoAgenteModal({ onClose, onCreated, empresaId }: { onClose: () => void; onCreated: (a: AgenteIA) => void; empresaId: string }) {
  const [step, setStep] = useState<'canal' | 'config'>('canal')
  const [canal, setCanal] = useState<'whatsapp' | 'voz'>('whatsapp')
  const [form, setForm] = useState({ nombre: '', instrucciones: '', numero_whatsapp: '', channel_uuid_callbell: '' })
  const [creating, setCreating] = useState(false)
  const audioRef = useRef<HTMLInputElement>(null)
  const [audioFile, setAudioFile] = useState<File | null>(null)

  async function handleCreate() {
    if (!form.nombre) return toast.error('Nombre requerido')
    setCreating(true)
    try {
      // For WhatsApp: create Azure assistant first via API
      let assistant_id: string | undefined
      if (canal === 'whatsapp' && form.instrucciones) {
        const res = await fetch('/api/agentes-ia/crear-assistant', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ nombre: form.nombre, instrucciones: form.instrucciones }),
        })
        if (res.ok) {
          const { assistant_id: id } = await res.json()
          assistant_id = id
        }
      }

      // For voz: clone voice + create ElevenLabs agent
      let elevenlabs_agent_id: string | undefined
      let elevenlabs_voice_id: string | undefined
      if (canal === 'voz' && audioFile) {
        const formData = new FormData()
        formData.append('audio', audioFile)
        formData.append('nombre', form.nombre)
        formData.append('instrucciones', form.instrucciones)
        const res = await fetch('/api/agentes-ia/crear-voz', { method: 'POST', body: formData })
        if (res.ok) {
          const r = await res.json()
          elevenlabs_agent_id = r.agent_id
          elevenlabs_voice_id = r.voice_id
        }
      }

      const res = await fetch('/api/agentes-ia', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          nombre: form.nombre,
          canal,
          instrucciones: form.instrucciones,
          empresa_id: empresaId,
          assistant_id,
          channel_uuid_callbell: form.channel_uuid_callbell || null,
          numero_whatsapp: form.numero_whatsapp || null,
          elevenlabs_agent_id,
          elevenlabs_voice_id,
        }),
      })
      const { data } = await res.json()
      if (data) { onCreated(data); toast.success('Agente creado'); onClose() }
      else toast.error('Error al crear')
    } finally {
      setCreating(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-white rounded-2xl p-6 max-w-md w-full shadow-xl" onClick={e => e.stopPropagation()}>
        <h3 className="text-base font-medium text-[#1a1a1a] mb-4">Nuevo Agente IA</h3>

        {step === 'canal' ? (
          <div className="space-y-3">
            <p className="text-sm text-[#6b7280] mb-3">¿Qué tipo de agente quieres crear?</p>
            {(['whatsapp', 'voz'] as const).map(c => {
              const Icon = CANAL_ICONS[c]
              return (
                <button key={c} onClick={() => { setCanal(c); setStep('config') }}
                  className={`w-full flex items-center gap-3 p-4 border-2 rounded-xl text-left transition-all hover:border-[#40d99d] ${canal === c ? 'border-[#40d99d] bg-[#40d99d]/5' : 'border-[#e5e5e5]'}`}>
                  <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${c === 'whatsapp' ? 'bg-[#40d99d]/10 text-[#40d99d]' : 'bg-purple-50 text-purple-500'}`}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-[#1a1a1a]">{CANAL_LABELS[c]}</p>
                    <p className="text-xs text-[#6b7280]">{c === 'whatsapp' ? 'Responde mensajes en WhatsApp con Azure OpenAI' : 'Agente de voz con ElevenLabs Conversational AI'}</p>
                  </div>
                </button>
              )
            })}
          </div>
        ) : (
          <div className="space-y-3">
            <button onClick={() => setStep('canal')} className="text-xs text-[#6b7280] hover:text-[#1a1a1a] mb-1">← Cambiar tipo</button>
            <div>
              <label className="text-xs text-[#6b7280] block mb-1">Nombre del agente *</label>
              <input value={form.nombre} onChange={e => setForm(p => ({ ...p, nombre: e.target.value }))}
                placeholder="Valentina — Agente Arriendo"
                className="w-full h-10 px-3 border border-[#e5e5e5] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#40d99d]" />
            </div>
            {canal === 'whatsapp' && (
              <>
                <div>
                  <label className="text-xs text-[#6b7280] block mb-1">Número WhatsApp</label>
                  <input value={form.numero_whatsapp} onChange={e => setForm(p => ({ ...p, numero_whatsapp: e.target.value }))}
                    placeholder="+57 300 000 0000"
                    className="w-full h-10 px-3 border border-[#e5e5e5] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#40d99d]" />
                </div>
                <div>
                  <label className="text-xs text-[#6b7280] block mb-1">UUID Canal Callbell</label>
                  <input value={form.channel_uuid_callbell} onChange={e => setForm(p => ({ ...p, channel_uuid_callbell: e.target.value }))}
                    placeholder="xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"
                    className="w-full h-10 px-3 border border-[#e5e5e5] rounded-lg text-sm font-mono focus:outline-none focus:ring-2 focus:ring-[#40d99d]" />
                </div>
              </>
            )}
            {canal === 'voz' && (
              <div>
                <label className="text-xs text-[#6b7280] block mb-1">Muestra de voz (MP3/WAV, mín. 30s)</label>
                <button onClick={() => audioRef.current?.click()}
                  className="w-full h-10 border border-dashed border-[#e5e5e5] rounded-lg text-xs text-[#6b7280] flex items-center justify-center gap-2 hover:border-[#40d99d] hover:text-[#40d99d] transition-all">
                  <Upload className="w-3.5 h-3.5" />
                  {audioFile ? audioFile.name : 'Subir audio de voz'}
                </button>
                <input ref={audioRef} type="file" accept="audio/*" className="hidden" onChange={e => setAudioFile(e.target.files?.[0] || null)} />
              </div>
            )}
            <div>
              <label className="text-xs text-[#6b7280] block mb-1">Instrucciones</label>
              <textarea value={form.instrucciones} onChange={e => setForm(p => ({ ...p, instrucciones: e.target.value }))}
                rows={4} placeholder="Eres un agente inmobiliario de [empresa]. Tu objetivo es..."
                className="w-full px-3 py-2 border border-[#e5e5e5] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#40d99d] resize-none" />
            </div>
            <div className="flex gap-2 pt-1">
              <button onClick={handleCreate} disabled={creating || !form.nombre}
                className="flex-1 py-2.5 bg-[#40d99d] text-white text-sm font-medium rounded-xl hover:bg-[#40d99d]/90 disabled:opacity-50 flex items-center justify-center gap-2 transition-all">
                {creating && <Loader2 className="w-4 h-4 animate-spin" />}
                {creating ? 'Creando...' : 'Crear agente'}
              </button>
              <button onClick={onClose} className="px-4 py-2.5 text-sm text-[#6b7280] hover:text-[#1a1a1a]">Cancelar</button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export function AgentesIAClient({ agentes: initialAgentes, empresaId }: AgentesIAClientProps) {
  const [agentes, setAgentes] = useState<AgenteIA[]>(initialAgentes)
  const [showModal, setShowModal] = useState(false)

  function handleUpdate(updated: AgenteIA) {
    setAgentes(p => p.map(a => a.id === updated.id ? updated : a))
  }

  function handleDelete(id: string) {
    setAgentes(p => p.filter(a => a.id !== id))
  }

  const whatsappAgentes = agentes.filter(a => a.canal === 'whatsapp')
  const vozAgentes = agentes.filter(a => a.canal === 'voz')

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-medium text-[#1a1a1a]">Agentes IA</h1>
          <p className="text-sm text-[#6b7280] mt-0.5">Configura tus agentes de WhatsApp y voz</p>
        </div>
        <button onClick={() => setShowModal(true)}
          className="flex items-center gap-2 px-4 py-2 bg-[#40d99d] text-white text-sm font-medium rounded-lg hover:bg-[#40d99d]/90 transition-all">
          <Plus className="w-4 h-4" />Nuevo agente
        </button>
      </div>

      {agentes.length === 0 ? (
        <div className="bg-white border border-dashed border-[#e5e5e5] rounded-2xl p-12 text-center">
          <Bot className="w-10 h-10 text-[#e5e5e5] mx-auto mb-3" />
          <p className="text-sm font-medium text-[#1a1a1a] mb-1">Sin agentes configurados</p>
          <p className="text-xs text-[#6b7280] mb-4">Crea tu primer agente IA de WhatsApp o voz.</p>
          <button onClick={() => setShowModal(true)}
            className="inline-flex items-center gap-2 px-4 py-2 bg-[#40d99d] text-white text-sm font-medium rounded-lg hover:bg-[#40d99d]/90 transition-all">
            <Plus className="w-4 h-4" />Crear agente
          </button>
        </div>
      ) : (
        <>
          {whatsappAgentes.length > 0 && (
            <div className="space-y-3">
              <h2 className="text-xs font-medium text-[#6b7280] uppercase tracking-wide flex items-center gap-2">
                <MessageSquare className="w-3.5 h-3.5" />WhatsApp IA ({whatsappAgentes.length})
              </h2>
              {whatsappAgentes.map(a => (
                <AgenteCard key={a.id} agente={a} onUpdate={handleUpdate} onDelete={handleDelete} />
              ))}
            </div>
          )}
          {vozAgentes.length > 0 && (
            <div className="space-y-3">
              <h2 className="text-xs font-medium text-[#6b7280] uppercase tracking-wide flex items-center gap-2">
                <Mic className="w-3.5 h-3.5" />Voz IA ({vozAgentes.length})
              </h2>
              {vozAgentes.map(a => (
                <AgenteCard key={a.id} agente={a} onUpdate={handleUpdate} onDelete={handleDelete} />
              ))}
            </div>
          )}
        </>
      )}

      {showModal && (
        <NuevoAgenteModal
          onClose={() => setShowModal(false)}
          onCreated={a => setAgentes(p => [...p, a])}
          empresaId={empresaId}
        />
      )}
    </div>
  )
}
