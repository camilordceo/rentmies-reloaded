'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { Profile } from '@/lib/types'

interface ConfigFormProps {
  profile: Profile | null
}

export function ConfigForm({ profile }: ConfigFormProps) {
  const [nombre, setNombre] = useState(profile?.nombre ?? '')
  const [saving, setSaving] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState('')
  const supabase = createClient()

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    setError('')
    setSuccess(false)

    const { error } = await supabase
      .from('profiles')
      .update({ nombre, updated_at: new Date().toISOString() })
      .eq('id', profile?.id)

    setSaving(false)
    if (error) {
      setError('Error al guardar los cambios')
    } else {
      setSuccess(true)
      setTimeout(() => setSuccess(false), 3000)
    }
  }

  return (
    <div className="space-y-6">
      {/* Profile section */}
      <div className="bg-white rounded-xl border border-[#e5e5e5] p-6 shadow-sm">
        <h2 className="font-medium text-[#1a1a1a] mb-4">Perfil de usuario</h2>
        <form onSubmit={handleSave} className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-[#1a1a1a]">Nombre completo</label>
            <input
              type="text"
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
              className="w-full h-10 px-3 rounded-lg border border-[#e5e5e5] bg-[#f0f0f0] text-sm text-[#1a1a1a] focus:outline-none focus:border-[#40d99d] focus:ring-1 focus:ring-[#40d99d]"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-sm font-medium text-[#1a1a1a]">Email</label>
            <input
              type="email"
              value={profile?.email ?? ''}
              disabled
              className="w-full h-10 px-3 rounded-lg border border-[#e5e5e5] bg-[#f8f8f8] text-sm text-[#6b7280] cursor-not-allowed"
            />
            <p className="text-xs text-[#6b7280]">El email no se puede cambiar</p>
          </div>

          <div className="space-y-1.5">
            <label className="text-sm font-medium text-[#1a1a1a]">Rol</label>
            <div className="inline-flex items-center px-3 py-1.5 rounded-lg bg-[#40d99d]/10 text-[#40d99d] text-sm font-medium">
              {profile?.rol ?? 'user'}
            </div>
          </div>

          {error && (
            <p className="text-xs text-red-500 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
              {error}
            </p>
          )}

          {success && (
            <p className="text-xs text-green-600 bg-green-50 border border-green-200 rounded-lg px-3 py-2">
              Cambios guardados correctamente
            </p>
          )}

          <button
            type="submit"
            disabled={saving}
            className="h-10 px-5 bg-[#40d99d] text-white rounded-lg text-sm font-medium hover:bg-[#4fffb4] transition-colors disabled:opacity-60"
          >
            {saving ? 'Guardando...' : 'Guardar cambios'}
          </button>
        </form>
      </div>

      {/* Account section */}
      <div className="bg-white rounded-xl border border-[#e5e5e5] p-6 shadow-sm">
        <h2 className="font-medium text-[#1a1a1a] mb-1">Cuenta</h2>
        <p className="text-sm text-[#6b7280] mb-4">Información de tu cuenta en Rentmies</p>
        <div className="text-sm text-[#6b7280] space-y-2">
          <p>
            <span className="font-medium text-[#1a1a1a]">ID:</span>{' '}
            <span className="font-mono text-xs">{profile?.id}</span>
          </p>
          <p>
            <span className="font-medium text-[#1a1a1a]">Creado:</span>{' '}
            {profile?.created_at
              ? new Date(profile.created_at).toLocaleDateString('es-CO', {
                  day: 'numeric',
                  month: 'long',
                  year: 'numeric',
                })
              : '—'}
          </p>
        </div>
      </div>
    </div>
  )
}
