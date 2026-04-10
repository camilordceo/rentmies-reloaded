'use client'

import { useState } from 'react'
import { toast } from 'sonner'
import { Save, User, Building2 } from 'lucide-react'

interface ConfiguracionClientProps {
  profile: any
  empresa: any
}

export function ConfiguracionClient({ profile, empresa }: ConfiguracionClientProps) {
  const [perfil, setPerfil] = useState({ nombre: profile?.nombre || '', email: profile?.email || '' })
  const [emp, setEmp] = useState({
    nombre: empresa?.nombre || '',
    nit: empresa?.configuracion?.nit || '',
    telefono: empresa?.configuracion?.telefono || '',
    website: empresa?.configuracion?.website || '',
  })
  const [saving, setSaving] = useState(false)

  async function saveEmpresa() {
    setSaving(true)
    const res = await fetch('/api/empresa', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ nombre: emp.nombre, configuracion: { nit: emp.nit, telefono: emp.telefono, website: emp.website } }),
    })
    setSaving(false)
    if (res.ok) toast.success('Cambios guardados')
    else toast.error('Error al guardar')
  }

  async function savePerfil() {
    setSaving(true)
    const supabase = (await import('@/lib/supabase/client')).createClient()
    const { error } = await supabase.from('profiles').update({ nombre: perfil.nombre }).eq('id', profile.id)
    setSaving(false)
    if (!error) toast.success('Perfil actualizado')
    else toast.error('Error al actualizar')
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <h1 className="text-2xl font-medium text-[#1a1a1a]">Configuración</h1>

      {/* Perfil personal */}
      <div className="bg-white border border-[#e5e5e5] rounded-xl p-5 shadow-sm">
        <div className="flex items-center gap-2 mb-4">
          <div className="w-7 h-7 rounded-lg bg-[#f0f0f0] flex items-center justify-center">
            <User className="w-4 h-4 text-[#6b7280]" />
          </div>
          <h2 className="text-sm font-medium text-[#1a1a1a]">Perfil personal</h2>
        </div>
        <div className="space-y-3">
          <div>
            <label className="text-xs text-[#6b7280] block mb-1">Nombre</label>
            <input
              value={perfil.nombre}
              onChange={e => setPerfil(p => ({ ...p, nombre: e.target.value }))}
              className="w-full h-10 px-3 border border-[#e5e5e5] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#40d99d]"
              placeholder="Tu nombre"
            />
          </div>
          <div>
            <label className="text-xs text-[#6b7280] block mb-1">Email</label>
            <input
              value={perfil.email}
              disabled
              className="w-full h-10 px-3 border border-[#e5e5e5] rounded-lg text-sm bg-[#f8f8f8] text-[#6b7280] cursor-not-allowed"
            />
          </div>
        </div>
        <button
          onClick={savePerfil}
          disabled={saving}
          className="mt-4 flex items-center gap-2 px-4 py-2 bg-[#1a1a1a] text-white text-sm rounded-lg hover:bg-[#1a1a1a]/90 disabled:opacity-50 transition-all"
        >
          <Save className="w-3.5 h-3.5" />Guardar perfil
        </button>
      </div>

      {/* Empresa */}
      <div className="bg-white border border-[#e5e5e5] rounded-xl p-5 shadow-sm">
        <div className="flex items-center gap-2 mb-4">
          <div className="w-7 h-7 rounded-lg bg-[#40d99d]/10 flex items-center justify-center">
            <Building2 className="w-4 h-4 text-[#40d99d]" />
          </div>
          <h2 className="text-sm font-medium text-[#1a1a1a]">Empresa</h2>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {[
            { key: 'nombre', label: 'Nombre empresa', placeholder: 'Rentmies Inmobiliaria' },
            { key: 'nit', label: 'NIT', placeholder: '900.123.456-7' },
            { key: 'telefono', label: 'Teléfono', placeholder: '+57 300 000 0000' },
            { key: 'website', label: 'Sitio web', placeholder: 'https://miempresa.co' },
          ].map(({ key, label, placeholder }) => (
            <div key={key}>
              <label className="text-xs text-[#6b7280] block mb-1">{label}</label>
              <input
                value={(emp as any)[key]}
                onChange={e => setEmp(p => ({ ...p, [key]: e.target.value }))}
                placeholder={placeholder}
                className="w-full h-10 px-3 border border-[#e5e5e5] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#40d99d]"
              />
            </div>
          ))}
        </div>
        <button
          onClick={saveEmpresa}
          disabled={saving}
          className="mt-4 flex items-center gap-2 px-4 py-2 bg-[#40d99d] text-white text-sm rounded-lg hover:bg-[#40d99d]/90 disabled:opacity-50 transition-all"
        >
          <Save className="w-3.5 h-3.5" />Guardar empresa
        </button>
      </div>

      {/* Notifications placeholder */}
      <div className="bg-white border border-[#e5e5e5] rounded-xl p-5 shadow-sm">
        <h2 className="text-sm font-medium text-[#1a1a1a] mb-3">Notificaciones</h2>
        {[
          { label: 'Nuevo lead por WhatsApp', key: 'nuevo_lead' },
          { label: 'Cita programada', key: 'cita' },
          { label: 'Lead movido de etapa', key: 'etapa_cambio' },
        ].map(({ label, key }) => (
          <div key={key} className="flex items-center justify-between py-2.5 border-b border-[#f0f0f0] last:border-0">
            <span className="text-sm text-[#1a1a1a]">{label}</span>
            <label className="relative inline-flex items-center cursor-pointer">
              <input type="checkbox" defaultChecked className="sr-only peer" />
              <div className="w-9 h-5 bg-[#e5e5e5] peer-checked:bg-[#40d99d] rounded-full transition-colors" />
              <div className="absolute left-0.5 top-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform peer-checked:translate-x-4" />
            </label>
          </div>
        ))}
      </div>
    </div>
  )
}
