'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Save, Trash2, X, Info } from 'lucide-react'
import type { AgenteIA, Empresa } from '@/lib/types'

interface AgentFormProps {
  agent?: AgenteIA
  empresas: Empresa[]
  mode: 'create' | 'edit'
}

export function AgentForm({ agent, empresas, mode }: AgentFormProps) {
  const router = useRouter()
  const [saving, setSaving] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [confirmDelete, setConfirmDelete] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [form, setForm] = useState({
    empresa_id: agent?.empresa_id || '',
    empresa_nombre: agent?.empresa_nombre || '',
    assistant_id: agent?.assistant_id || '',
    channel_uuid_callbell: agent?.channel_uuid_callbell || '',
    numero_whatsapp: agent?.numero_whatsapp || '',
    nombre: agent?.nombre || '',
    activo: agent?.activo ?? true,
    metadata: agent?.metadata ? JSON.stringify(agent.metadata, null, 2) : '{}',
  })

  const [jsonError, setJsonError] = useState<string | null>(null)

  function handleEmpresaChange(empresaId: string) {
    const emp = empresas.find((e) => e.id === empresaId)
    setForm((f) => ({
      ...f,
      empresa_id: empresaId,
      empresa_nombre: emp?.nombre || '',
    }))
  }

  function handleJsonChange(value: string) {
    setForm((f) => ({ ...f, metadata: value }))
    try {
      JSON.parse(value)
      setJsonError(null)
    } catch {
      setJsonError('JSON inválido')
    }
  }

  async function handleSave() {
    if (jsonError) return
    setSaving(true)
    setError(null)

    let parsedMetadata = {}
    try {
      parsedMetadata = JSON.parse(form.metadata)
    } catch {
      setError('Configuración tiene JSON inválido')
      setSaving(false)
      return
    }

    const payload = { ...form, metadata: parsedMetadata }

    try {
      const url = mode === 'create' ? '/api/agents' : `/api/agents/${agent!.id}`
      const method = mode === 'create' ? 'POST' : 'PATCH'

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })

      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Error guardando')

      router.push('/admin/agents')
      router.refresh()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error desconocido')
    } finally {
      setSaving(false)
    }
  }

  async function handleDelete() {
    if (!confirmDelete) {
      setConfirmDelete(true)
      return
    }
    setDeleting(true)
    try {
      await fetch(`/api/agents/${agent!.id}`, { method: 'DELETE' })
      router.push('/admin/agents')
      router.refresh()
    } catch {
      setError('Error eliminando agente')
    } finally {
      setDeleting(false)
    }
  }

  const inputClass = 'w-full h-10 px-3 bg-surface-container rounded-lg text-sm text-on-surface placeholder:text-on-surface/35 outline-none focus:ring-2 focus:ring-brand-teal/30 transition-all'
  const labelClass = 'text-xs font-medium text-on-surface/50 block mb-1.5'

  return (
    <div className="space-y-6">
      {error && (
        <div className="flex items-center gap-2 p-3 bg-red-50 rounded-xl text-sm text-red-700">
          <X className="w-4 h-4 flex-shrink-0" />
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Empresa */}
        <div>
          <label className={labelClass}>Empresa</label>
          <select
            value={form.empresa_id}
            onChange={(e) => handleEmpresaChange(e.target.value)}
            className={inputClass}
          >
            <option value="">Seleccionar empresa...</option>
            {empresas.map((emp) => (
              <option key={emp.id} value={emp.id}>{emp.nombre}</option>
            ))}
          </select>
        </div>

        {/* Nombre agente */}
        <div>
          <label className={labelClass}>Nombre del agente AI</label>
          <input
            type="text"
            value={form.nombre}
            onChange={(e) => setForm((f) => ({ ...f, nombre: e.target.value }))}
            placeholder="ej: Isabella"
            className={inputClass}
          />
        </div>

        {/* Assistant ID */}
        <div>
          <label className={labelClass + ' flex items-center gap-1.5'}>
            Assistant ID
            <span title="ID del asistente en Rentmies Responses API (ej: asst_TXTkbu...)">
              <Info className="w-3.5 h-3.5 text-on-surface/30" />
            </span>
          </label>
          <input
            type="text"
            value={form.assistant_id}
            onChange={(e) => setForm((f) => ({ ...f, assistant_id: e.target.value }))}
            placeholder="asst_TXTkbuUHbo1xG53AQg2kBeqM"
            className={inputClass + ' font-mono'}
          />
        </div>

        {/* Channel UUID */}
        <div>
          <label className={labelClass + ' flex items-center gap-1.5'}>
            Channel UUID Callbell
            <span title="UUID del canal de WhatsApp en Callbell">
              <Info className="w-3.5 h-3.5 text-on-surface/30" />
            </span>
          </label>
          <input
            type="text"
            value={form.channel_uuid_callbell}
            onChange={(e) => setForm((f) => ({ ...f, channel_uuid_callbell: e.target.value }))}
            placeholder="27743866072a4dc2a3c7dffff840ba2f"
            className={inputClass + ' font-mono'}
          />
        </div>

        {/* Número WhatsApp */}
        <div>
          <label className={labelClass}>Número WhatsApp</label>
          <input
            type="text"
            value={form.numero_whatsapp}
            onChange={(e) => setForm((f) => ({ ...f, numero_whatsapp: e.target.value.replace(/[^\d]/g, '') }))}
            placeholder="573001234567 (solo dígitos, sin +)"
            className={inputClass + ' font-mono'}
          />
          <p className="text-xs text-on-surface/40 mt-1">Formato: código país + número, sin + ni espacios</p>
        </div>

        {/* Activo toggle */}
        <div className="flex items-center gap-3 pt-2">
          <button
            type="button"
            onClick={() => setForm((f) => ({ ...f, activo: !f.activo }))}
            className={`relative w-10 h-6 rounded-full transition-colors flex-shrink-0 ${form.activo ? 'bg-brand-teal' : 'bg-surface-container-highest'}`}
          >
            <span className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow transition-transform ${form.activo ? 'translate-x-5' : 'translate-x-1'}`} />
          </button>
          <label className="text-sm font-semibold text-on-surface">
            {form.activo ? 'Agente activo' : 'Agente inactivo'}
          </label>
        </div>
      </div>

      {/* JSON config */}
      <div>
        <label className={labelClass}>
          Configuración <span className="text-on-surface/30 font-normal">(JSON)</span>
        </label>
        <textarea
          value={form.metadata}
          onChange={(e) => handleJsonChange(e.target.value)}
          rows={4}
          className={`w-full px-3 py-2.5 bg-surface-container rounded-xl text-sm font-mono text-on-surface outline-none resize-none transition-all ${jsonError ? 'ring-2 ring-red-300' : 'focus:ring-2 focus:ring-brand-teal/30'}`}
        />
        {jsonError && <p className="text-xs text-red-600 mt-1">{jsonError}</p>}
      </div>

      {/* Action buttons */}
      <div className="flex items-center justify-between pt-2">
        <div className="flex items-center gap-2">
          <button
            onClick={handleSave}
            disabled={saving || !!jsonError}
            className="flex items-center gap-2 px-4 py-2 bg-authority-green text-white text-sm font-semibold rounded-lg hover:bg-authority-green/90 disabled:opacity-50 transition-all"
          >
            <Save className="w-3.5 h-3.5" />
            {saving ? 'Guardando...' : 'Guardar'}
          </button>
          <button
            onClick={() => router.back()}
            className="px-4 py-2 text-sm text-on-surface/50 hover:text-on-surface transition-colors"
          >
            Cancelar
          </button>
        </div>

        {mode === 'edit' && (
          <button
            onClick={handleDelete}
            disabled={deleting}
            className={`flex items-center gap-2 px-4 py-2 text-sm font-semibold rounded-lg transition-all ${
              confirmDelete
                ? 'bg-red-600 text-white hover:bg-red-700'
                : 'text-red-600 hover:bg-red-50 bg-red-50/50'
            }`}
          >
            <Trash2 className="w-3.5 h-3.5" />
            {deleting ? 'Eliminando...' : confirmDelete ? 'Confirmar eliminación' : 'Eliminar agente'}
          </button>
        )}
      </div>
    </div>
  )
}
