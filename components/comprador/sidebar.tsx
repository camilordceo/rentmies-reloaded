'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { Home, Calendar, CreditCard, MessageSquare, LogOut, Sparkles, Menu, X } from 'lucide-react'
import { useState } from 'react'
import { cn } from '@/lib/utils'
import { createClient } from '@/lib/supabase/client'

const nav = [
  { href: '/mi-cuenta', label: 'Inicio', icon: Home, exact: true },
  { href: '/mi-cuenta/mis-citas', label: 'Mis Citas', icon: Calendar },
  { href: '/mi-cuenta/mis-pagos', label: 'Mis Pagos', icon: CreditCard },
  { href: '/mi-cuenta/mis-solicitudes', label: 'Solicitudes', icon: MessageSquare },
]

interface Props {
  nombre: string | null
  email: string | null
}

export function CompradorSidebar({ nombre, email }: Props) {
  const pathname = usePathname()
  const router = useRouter()
  const [mobileOpen, setMobileOpen] = useState(false)

  const isActive = (href: string, exact?: boolean) =>
    exact ? pathname === href : pathname.startsWith(href)

  async function handleLogout() {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/login')
  }

  const SidebarContent = () => (
    <div className="flex flex-col h-full bg-surface">
      {/* Brand */}
      <div className="h-14 flex items-center px-4 flex-shrink-0">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 bg-brand-teal rounded-lg flex items-center justify-center flex-shrink-0">
            <Sparkles className="w-4 h-4 text-white" />
          </div>
          <div>
            <p className="text-[10px] font-bold uppercase tracking-widest text-on-surface/40">RENTMIES</p>
            <p className="text-xs font-semibold text-on-surface leading-none">Mi Cuenta</p>
          </div>
        </div>
      </div>

      <nav className="flex-1 p-3 space-y-0.5 overflow-y-auto">
        {nav.map(item => (
          <Link
            key={item.href}
            href={item.href}
            onClick={() => setMobileOpen(false)}
            className={cn(
              'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all',
              isActive(item.href, item.exact)
                ? 'bg-brand-teal/10 text-brand-teal font-semibold'
                : 'text-on-surface/50 hover:bg-surface-container hover:text-on-surface'
            )}
          >
            <item.icon className="w-4 h-4 flex-shrink-0" />
            {item.label}
          </Link>
        ))}
      </nav>

      <div className="p-3 flex-shrink-0 space-y-1">
        <div className="px-3 py-2 bg-surface-container rounded-lg mb-2">
          <p className="text-xs font-semibold text-on-surface truncate">{nombre ?? email}</p>
          {nombre && <p className="text-[10px] text-on-surface/50 truncate">{email}</p>}
        </div>
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-2 px-3 py-2 text-xs text-on-surface/40 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"
        >
          <LogOut className="w-3.5 h-3.5" />
          Cerrar sesión
        </button>
      </div>
    </div>
  )

  return (
    <>
      <aside className="hidden md:flex w-56 flex-col bg-surface flex-shrink-0">
        <SidebarContent />
      </aside>
      <button
        className="md:hidden fixed bottom-4 right-4 z-50 w-12 h-12 bg-authority-green text-white rounded-full shadow-editorial flex items-center justify-center"
        onClick={() => setMobileOpen(!mobileOpen)}
      >
        {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
      </button>
      {mobileOpen && (
        <>
          <div className="md:hidden fixed inset-0 bg-on-surface/40 backdrop-blur-sm z-40" onClick={() => setMobileOpen(false)} />
          <aside className="md:hidden fixed left-0 top-0 bottom-0 w-56 bg-surface z-50 shadow-editorial">
            <SidebarContent />
          </aside>
        </>
      )}
    </>
  )
}
