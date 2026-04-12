'use client'

import { useState } from 'react'
import { Plus, Trash2, UserCheck } from 'lucide-react'
import type { Agente } from '@/lib/types/database'

export function AgentesTab({ agentes: initial, empresaId }: { agentes: Agente[]; empresaId: string }) {
  const [agentes, setAgentes] = useState<Agente[]>(initial)
  const [adding, setAdding] = useState(false)
  const [form, setForm] = useState({ nombre: '', email: '', telefono: '' })
  const [saving, setSaving] = useState(false)

  async function handleAdd() {
    if (!form.nombre) return
    setSaving(true)
    const res = await fetch('/api/agentes', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...form, empresa_id: empresaId }),
    })
    const { data } = await res.json()
    if (data) { setAgentes(p => [data, ...p]); setForm({ nombre: '', email: '', telefono: '' }); setAdding(false) }
    setSaving(false)
  }

  async function toggleActivo(id: string, activo: boolean) {
    await fetch(`/api/agentes/${id}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ activo: !activo }) })
    setAgentes(p => p.map(a => a.id === id ? { ...a, activo: !activo } : a))
  }

  async function handleDelete(id: string) {
    await fetch(`/api/agentes/${id}`, { method: 'DELETE' })
    setAgentes(p => p.filter(a => a.id !== id))
  }

  return (
    <div className="max-w-2xl space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-xs text-on-surface/50">{agentes.length} agente{agentes.length !== 1 ? 's' : ''} registrados</p>
        <button
          onClick={() => setAdding(true)}
          className="flex items-center gap-2 px-4 py-2 bg-authority-green text-white text-sm font-semibold rounded-lg hover:bg-authority-green/90 transition-all"
        >
          <Plus className="w-3.5 h-3.5" /> Agregar Agente
        </button>
      </div>

      {adding && (
        <div className="bg-surface-container rounded-xl p-5 space-y-3">
          {[['nombre', 'Nombre completo'], ['email', 'Email'], ['telefono', 'Teléfono']].map(([k, p]) => (
            <input
              key={k}
              placeholder={p}
              value={(form as Record<string, string>)[k]}
              onChange={e => setForm(f => ({ ...f, [k]: e.target.value }))}
              className="w-full h-10 px-3 bg-surface-container-lowest rounded-lg text-sm text-on-surface placeholder:text-on-surface/35 outline-none focus:ring-2 focus:ring-brand-teal/30 transition-all"
            />
          ))}
          <div className="flex gap-2 pt-1">
            <button
              onClick={handleAdd}
              disabled={saving}
              className="px-4 py-2 bg-authority-green text-white text-sm font-semibold rounded-lg disabled:opacity-50 transition-all"
            >
              {saving ? 'Guardando...' : 'Guardar'}
            </button>
            <button
              onClick={() => setAdding(false)}
              className="px-4 py-2 text-sm text-on-surface/50 hover:text-on-surface transition-colors"
            >
              Cancelar
            </button>
          </div>
        </div>
      )}

      <div className="space-y-2">
        {agentes.map(a => (
          <div key={a.id} className="flex items-center gap-3 bg-surface-container-lowest rounded-xl p-4 shadow-editorial">
            <div className="w-9 h-9 bg-brand-teal/10 rounded-full flex items-center justify-center flex-shrink-0">
              <UserCheck className="w-4 h-4 text-brand-teal" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-on-surface">{a.nombre}</p>
              <p className="text-xs text-on-surface/50">{a.email || a.telefono || 'Sin contacto'}</p>
            </div>
            <button
              onClick={() => toggleActivo(a.id, a.activo)}
              className={`px-2.5 py-1 rounded-full text-xs font-semibold transition-all ${a.activo ? 'bg-brand-teal/10 text-brand-teal' : 'bg-surface-container text-on-surface/50'}`}
            >
              {a.activo ? 'Activo' : 'Inactivo'}
            </button>
            <button
              onClick={() => handleDelete(a.id)}
              className="text-on-surface/30 hover:text-red-500 transition-colors"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        ))}
        {agentes.length === 0 && !adding && (
          <div className="py-12 text-center">
            <p className="text-sm text-on-surface/40">No hay agentes. Agrega el primero.</p>
          </div>
        )}
      </div>
    </div>
  )
}
