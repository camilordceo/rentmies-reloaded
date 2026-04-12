'use client'

import { useState } from 'react'
import { Save } from 'lucide-react'
import type { Empresa } from '@/lib/types/database'

interface InfoEmpresaTabProps {
  empresa: Empresa
}

export function InfoEmpresaTab({ empresa }: InfoEmpresaTabProps) {
  const [form, setForm] = useState({
    nombre: empresa.nombre,
    nit: (empresa.configuracion as Record<string, string>)?.nit ?? '',
    telefono: (empresa.configuracion as Record<string, string>)?.telefono ?? '',
    email: (empresa.configuracion as Record<string, string>)?.email ?? '',
    sitio_web: (empresa.configuracion as Record<string, string>)?.sitio_web ?? '',
  })
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  async function handleSave() {
    setSaving(true)
    try {
      await fetch(`/api/empresa`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          nombre: form.nombre,
          configuracion: {
            ...(empresa.configuracion as object),
            nit: form.nit,
            telefono: form.telefono,
            email: form.email,
            sitio_web: form.sitio_web,
          },
        }),
      })
      setSaved(true)
      setTimeout(() => setSaved(false), 2000)
    } finally {
      setSaving(false)
    }
  }

  const fields = [
    { key: 'nombre', label: 'Nombre de la Empresa', placeholder: 'Engel & Völkers Bogotá', type: 'text' },
    { key: 'nit', label: 'NIT', placeholder: '900.123.456-7', type: 'text' },
    { key: 'telefono', label: 'Teléfono Móvil', placeholder: '573001234567', type: 'tel' },
    { key: 'email', label: 'Email Corporativo', placeholder: 'info@inmobiliaria.co', type: 'email' },
    { key: 'sitio_web', label: 'Sitio Web', placeholder: 'https://inmobiliaria.co', type: 'url' },
  ] as const

  return (
    <div className="max-w-xl space-y-4">
      {fields.map((f) => (
        <div key={f.key} className="space-y-1.5">
          <label className="text-xs font-medium text-on-surface/50">{f.label}</label>
          <input
            type={f.type}
            value={form[f.key]}
            onChange={(e) => setForm((p) => ({ ...p, [f.key]: e.target.value }))}
            placeholder={f.placeholder}
            className="w-full h-10 px-3 bg-surface-container rounded-lg text-sm text-on-surface placeholder:text-on-surface/35 outline-none focus:ring-2 focus:ring-brand-teal/30 transition-all"
          />
        </div>
      ))}
      <button
        onClick={handleSave}
        disabled={saving}
        className="flex items-center gap-2 px-4 py-2 bg-authority-green text-white text-sm font-semibold rounded-lg hover:bg-authority-green/90 disabled:opacity-50 transition-all"
      >
        <Save className="w-3.5 h-3.5" />
        {saving ? 'Guardando...' : saved ? 'Guardado' : 'Guardar Cambios'}
      </button>
    </div>
  )
}
