'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

export function RegistroForm() {
  const [nombre, setNombre] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    if (password.length < 6) {
      setError('La contraseña debe tener al menos 6 caracteres')
      setLoading(false)
      return
    }

    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { nombre },
      },
    })

    if (error) {
      setError(error.message)
      setLoading(false)
      return
    }

    router.push('/dashboard')
    router.refresh()
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-1.5">
        <label className="text-xs font-medium text-on-surface/50" htmlFor="nombre">
          Nombre completo
        </label>
        <input
          id="nombre"
          type="text"
          value={nombre}
          onChange={(e) => setNombre(e.target.value)}
          placeholder="Ana Martínez"
          required
          className="w-full h-10 px-3 bg-surface-container rounded-lg text-sm text-on-surface placeholder:text-on-surface/35 outline-none focus:ring-2 focus:ring-brand-teal/30 transition-all"
        />
      </div>

      <div className="space-y-1.5">
        <label className="text-xs font-medium text-on-surface/50" htmlFor="email">
          Email
        </label>
        <input
          id="email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="tu@inmobiliaria.com"
          required
          className="w-full h-10 px-3 bg-surface-container rounded-lg text-sm text-on-surface placeholder:text-on-surface/35 outline-none focus:ring-2 focus:ring-brand-teal/30 transition-all"
        />
      </div>

      <div className="space-y-1.5">
        <label className="text-xs font-medium text-on-surface/50" htmlFor="password">
          Contraseña
        </label>
        <input
          id="password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Mínimo 6 caracteres"
          required
          className="w-full h-10 px-3 bg-surface-container rounded-lg text-sm text-on-surface placeholder:text-on-surface/35 outline-none focus:ring-2 focus:ring-brand-teal/30 transition-all"
        />
      </div>

      {error && (
        <div className="px-3 py-2.5 bg-red-50 rounded-lg">
          <p className="text-xs text-red-600">{error}</p>
        </div>
      )}

      <button
        type="submit"
        disabled={loading}
        className="w-full h-11 bg-authority-green text-white rounded-lg text-sm font-semibold hover:bg-authority-green/90 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {loading ? 'Creando cuenta...' : 'Crear cuenta'}
      </button>

      <p className="text-xs text-on-surface/40 text-center">
        Al registrarte aceptas nuestros términos de servicio.
      </p>
    </form>
  )
}
