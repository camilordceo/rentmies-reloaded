'use client'

import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { LogOut, ChevronDown } from 'lucide-react'
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
    <header className="h-16 bg-white border-b border-[#e5e5e5] flex items-center justify-end px-4 lg:px-6 flex-shrink-0">
      <div className="relative">
        <button
          onClick={() => setOpen(!open)}
          className="flex items-center gap-2.5 hover:bg-[#f8f8f8] rounded-lg px-3 py-2 transition-colors"
        >
          <div className="w-8 h-8 bg-[#40d99d]/15 rounded-full flex items-center justify-center">
            <span className="text-xs font-medium text-[#40d99d]">{initials}</span>
          </div>
          <span className="text-sm text-[#1a1a1a] hidden sm:block max-w-[120px] truncate">
            {displayName}
          </span>
          <ChevronDown className="w-3.5 h-3.5 text-[#6b7280]" />
        </button>

        {open && (
          <>
            <div
              className="fixed inset-0 z-10"
              onClick={() => setOpen(false)}
            />
            <div className="absolute right-0 top-full mt-1 w-48 bg-white border border-[#e5e5e5] rounded-lg shadow-md z-20 py-1">
              <div className="px-3 py-2 border-b border-[#e5e5e5]">
                <p className="text-xs font-medium text-[#1a1a1a] truncate">{displayName}</p>
                <p className="text-[11px] text-[#6b7280] truncate">{profile?.email}</p>
              </div>
              <button
                onClick={handleLogout}
                className="w-full flex items-center gap-2 px-3 py-2 text-sm text-[#6b7280] hover:text-[#1a1a1a] hover:bg-[#f8f8f8] transition-colors"
              >
                <LogOut className="w-4 h-4" />
                Cerrar sesión
              </button>
            </div>
          </>
        )}
      </div>
    </header>
  )
}
