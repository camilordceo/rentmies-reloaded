'use client'

import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { LogOut, Search, Mic, Bell, ChevronDown } from 'lucide-react'
import { useState } from 'react'
import type { Profile } from '@/lib/types'

interface TopbarProps {
  profile: Profile | null
}

export function Topbar({ profile }: TopbarProps) {
  const router = useRouter()
  const supabase = createClient()
  const [open, setOpen] = useState(false)

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push('/login')
    router.refresh()
  }

  const initials = profile?.nombre
    ? profile.nombre.split(' ').map((n) => n[0]).slice(0, 2).join('').toUpperCase()
    : '??'

  const displayName = profile?.nombre ?? profile?.email ?? 'Usuario'

  return (
    <header className="h-14 bg-surface/80 backdrop-blur-xl flex items-center justify-between px-4 lg:px-6 flex-shrink-0 sticky top-0 z-30">
      {/* Search bar */}
      <div className="flex items-center gap-2 bg-surface-container rounded-full px-4 py-2 w-64 lg:w-80">
        <Search className="w-3.5 h-3.5 text-on-surface/40 flex-shrink-0" />
        <input
          type="text"
          placeholder="Buscar leads, propiedades..."
          className="flex-1 bg-transparent text-sm text-on-surface placeholder:text-on-surface/35 outline-none min-w-0"
        />
        <Mic className="w-3.5 h-3.5 text-on-surface/30 flex-shrink-0 hover:text-brand-teal cursor-pointer transition-colors" />
      </div>

      {/* Right side */}
      <div className="flex items-center gap-2">
        {/* Notifications */}
        <button className="w-8 h-8 rounded-lg flex items-center justify-center text-on-surface/40 hover:bg-surface-container hover:text-on-surface transition-all relative">
          <Bell className="w-4 h-4" />
          <span className="absolute top-1 right-1 w-1.5 h-1.5 rounded-full bg-brand-teal" />
        </button>

        {/* Inquire CTA */}
        <button className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-authority-green text-white text-xs font-semibold hover:bg-authority-green/90 transition-colors">
          Inquire
          <span className="text-white/60">▶</span>
        </button>

        {/* Avatar dropdown */}
        <div className="relative">
          <button
            onClick={() => setOpen(!open)}
            className="flex items-center gap-2 hover:bg-surface-container rounded-lg px-2.5 py-1.5 transition-colors"
          >
            <div className="w-7 h-7 bg-brand-teal/15 rounded-full flex items-center justify-center">
              <span className="text-[11px] font-semibold text-brand-teal">{initials}</span>
            </div>
            <span className="text-sm text-on-surface hidden sm:block max-w-[100px] truncate">
              {displayName}
            </span>
            <ChevronDown className="w-3 h-3 text-on-surface/30" />
          </button>

          {open && (
            <>
              <div className="fixed inset-0 z-10" onClick={() => setOpen(false)} />
              <div className="absolute right-0 top-full mt-1.5 w-48 bg-surface-container-lowest rounded-xl shadow-editorial z-20 py-1.5 overflow-hidden">
                <div className="px-3 py-2 mb-1">
                  <p className="text-xs font-semibold text-on-surface truncate">{displayName}</p>
                  <p className="text-[11px] text-on-surface/50 truncate">{profile?.email}</p>
                </div>
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center gap-2 px-3 py-2 text-sm text-on-surface/60 hover:text-on-surface hover:bg-surface-container transition-colors"
                >
                  <LogOut className="w-4 h-4" />
                  Cerrar sesión
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </header>
  )
}
