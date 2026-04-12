'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { CheckCircle2, X, Sparkles } from 'lucide-react'
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

  const inputClass = 'w-full h-10 px-3 bg-surface-container rounded-lg text-sm text-on-surface placeholder:text-on-surface/35 outline-none focus:ring-2 focus:ring-brand-teal/30 transition-all'
  const labelClass = 'text-xs font-semibold text-on-surface/50 block mb-1.5'

  return (
    <div className="space-y-6 max-w-lg">
      {/* Profile section */}
      <div className="bg-surface-container-lowest rounded-xl p-6 shadow-editorial">
        <p className="text-[10px] font-bold uppercase tracking-[0.15em] text-authority-green mb-1">Cuenta</p>
        <h2 className="text-lg font-bold text-on-surface mb-5">Perfil de usuario</h2>
        <form onSubmit={handleSave} className="space-y-4">
          <div>
            <label className={labelClass}>Nombre completo</label>
            <input
              type="text"
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
              className={inputClass}
              placeholder="Tu nombre completo"
            />
          </div>

          <div>
            <label className={labelClass}>Email</label>
            <input
              type="email"
              value={profile?.email ?? ''}
              disabled
              className={inputClass + ' opacity-50 cursor-not-allowed'}
            />
            <p className="text-xs text-on-surface/40 mt-1">El email no se puede cambiar</p>
          </div>

          <div>
            <label className={labelClass}>Rol</label>
            <div className="inline-flex items-center px-3 py-1.5 rounded-lg bg-brand-teal/10 text-brand-teal text-sm font-semibold">
              {profile?.rol ?? 'user'}
            </div>
          </div>

          {error && (
            <div className="flex items-center gap-2 p-3 bg-red-50 rounded-xl text-xs text-red-700">
              <X className="w-4 h-4 flex-shrink-0" />
              {error}
            </div>
          )}

          {success && (
            <div className="flex items-center gap-2 p-3 bg-authority-green/5 rounded-xl text-xs text-authority-green font-semibold">
              <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
              Cambios guardados correctamente
            </div>
          )}

          <button
            type="submit"
            disabled={saving}
            className="h-10 px-5 bg-authority-green text-white rounded-lg text-sm font-semibold hover:bg-authority-green/90 transition-all disabled:opacity-50"
          >
            {saving ? 'Guardando...' : 'Guardar cambios'}
          </button>
        </form>
      </div>

      {/* Account info */}
      <div className="bg-surface-container-lowest rounded-xl p-6 shadow-editorial">
        <h2 className="text-sm font-bold text-on-surface mb-1">Detalles de cuenta</h2>
        <p className="text-xs text-on-surface/40 mb-4">Información técnica de tu perfil en Rentmies</p>
        <div className="space-y-3">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-widest text-on-surface/40 mb-0.5">ID de usuario</p>
            <p className="text-xs font-mono text-on-surface/60 bg-surface-container rounded-lg px-3 py-2">{profile?.id ?? '—'}</p>
          </div>
          <div>
            <p className="text-[10px] font-bold uppercase tracking-widest text-on-surface/40 mb-0.5">Fecha de registro</p>
            <p className="text-xs text-on-surface/60">
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

      {/* EMA tip */}
      <div className="bg-surface-container-low rounded-xl p-4">
        <div className="flex items-start gap-3">
          <div className="w-8 h-8 bg-brand-teal/10 rounded-lg flex items-center justify-center flex-shrink-0">
            <Sparkles className="w-4 h-4 text-brand-teal" />
          </div>
          <div>
            <p className="text-[10px] font-bold uppercase tracking-widest text-brand-teal mb-1">EMA Tip</p>
            <p className="text-xs text-on-surface/60 leading-relaxed">
              Mantén tu nombre actualizado para que los leads sepan con quién están hablando cuando el agente IA los transfiere a ti.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
