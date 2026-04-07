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
        <label className="text-sm font-medium text-[#1a1a1a]" htmlFor="nombre">
          Nombre completo
        </label>
        <input
          id="nombre"
          type="text"
          value={nombre}
          onChange={(e) => setNombre(e.target.value)}
          placeholder="Ana Martínez"
          required
          className="w-full h-10 px-3 rounded-lg border border-[#e5e5e5] bg-[#f0f0f0] text-sm text-[#1a1a1a] placeholder:text-[#6b7280] focus:outline-none focus:border-[#40d99d] focus:ring-1 focus:ring-[#40d99d] transition-colors"
        />
      </div>

      <div className="space-y-1.5">
        <label className="text-sm font-medium text-[#1a1a1a]" htmlFor="email">
          Email
        </label>
        <input
          id="email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="tu@inmobiliaria.com"
          required
          className="w-full h-10 px-3 rounded-lg border border-[#e5e5e5] bg-[#f0f0f0] text-sm text-[#1a1a1a] placeholder:text-[#6b7280] focus:outline-none focus:border-[#40d99d] focus:ring-1 focus:ring-[#40d99d] transition-colors"
        />
      </div>

      <div className="space-y-1.5">
        <label className="text-sm font-medium text-[#1a1a1a]" htmlFor="password">
          Contraseña
        </label>
        <input
          id="password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Mínimo 6 caracteres"
          required
          className="w-full h-10 px-3 rounded-lg border border-[#e5e5e5] bg-[#f0f0f0] text-sm text-[#1a1a1a] placeholder:text-[#6b7280] focus:outline-none focus:border-[#40d99d] focus:ring-1 focus:ring-[#40d99d] transition-colors"
        />
      </div>

      {error && (
        <p className="text-xs text-red-500 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
          {error}
        </p>
      )}

      <button
        type="submit"
        disabled={loading}
        className="w-full h-10 bg-[#40d99d] text-white rounded-lg text-sm font-medium hover:bg-[#4fffb4] transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
      >
        {loading ? 'Creando cuenta...' : 'Crear cuenta'}
      </button>

      <p className="text-xs text-[#6b7280] text-center">
        Al registrarte aceptas nuestros términos de servicio.
      </p>
    </form>
  )
}
