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
        <div key={f.key}>
          <label className="block text-sm font-medium text-[#1a1a1a] mb-1.5">{f.label}</label>
          <input
            type={f.type}
            value={form[f.key]}
            onChange={(e) => setForm((p) => ({ ...p, [f.key]: e.target.value }))}
            placeholder={f.placeholder}
            className="w-full h-10 px-3 border border-[#e5e5e5] rounded-lg text-sm text-[#1a1a1a] focus:outline-none focus:ring-2 focus:ring-[#40d99d] focus:border-transparent"
          />
        </div>
      ))}
      <button
        onClick={handleSave}
        disabled={saving}
        className="flex items-center gap-2 px-4 py-2 bg-[#40d99d] text-white text-sm font-medium rounded-lg hover:bg-[#40d99d]/90 disabled:opacity-50 transition-all"
      >
        <Save className="w-4 h-4" />
        {saving ? 'Guardando...' : saved ? '¡Guardado!' : 'Guardar Cambios'}
      </button>
    </div>
  )
}
