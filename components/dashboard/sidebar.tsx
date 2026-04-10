'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import {
  Home, Building2, MessageSquare, Users, BarChart3,
  CreditCard, Settings, LogOut, ChevronDown, ChevronRight,
  Bot, ScrollText, ShieldCheck, FlaskConical, Webhook,
  Menu, X,
} from 'lucide-react'
import { useState } from 'react'
import { cn } from '@/lib/utils'
import { createClient } from '@/lib/supabase/client'

const mainNav = [
  { href: '/dashboard', label: 'Inicio', icon: Home, exact: true },
  { href: '/empresa', label: 'Empresa', icon: Building2 },
  { href: '/conversaciones', label: 'Conversaciones', icon: MessageSquare },
  { href: '/crm', label: 'CRM', icon: Users },
  { href: '/analytics', label: 'Analytics', icon: BarChart3 },
  { href: '/pagos', label: 'Pagos', icon: CreditCard },
]

const configSubItems = [
  { href: '/configuracion', label: 'General', exact: true },
  { href: '/configuracion/agentes-ia', label: 'Agentes IA' },
]

const adminNav = [
  { href: '/admin', label: 'Admin', icon: ShieldCheck, exact: true },
  { href: '/admin/agents', label: 'AI Agents', icon: Bot },
  { href: '/admin/wa-conversations', label: 'WhatsApp Chats', icon: Webhook },
  { href: '/admin/testing', label: 'Testing', icon: FlaskConical },
  { href: '/admin/logs', label: 'Logs', icon: ScrollText },
]

interface SidebarProps {
  userRole: string
  consumo?: {
    periodo: string
    conversaciones: number
    limite: number
  }
}

export function Sidebar({ userRole, consumo }: SidebarProps) {
  const pathname = usePathname()
  const router = useRouter()
  const [configOpen, setConfigOpen] = useState(pathname.startsWith('/configuracion'))
  const [mobileOpen, setMobileOpen] = useState(false)

  const isActive = (href: string, exact?: boolean) => {
    if (exact) return pathname === href
    return pathname.startsWith(href)
  }

  async function handleLogout() {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/login')
  }

  const pct = consumo ? Math.round((consumo.conversaciones / consumo.limite) * 100) : 19

  const SidebarContent = () => (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div className="h-14 flex items-center px-4 border-b border-[#e5e5e5] flex-shrink-0">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 bg-[#40d99d] rounded-lg flex items-center justify-center flex-shrink-0">
            <Bot className="w-4 h-4 text-white" />
          </div>
          <span className="font-medium text-[#1a1a1a] text-sm">Rentmies</span>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 p-3 space-y-0.5 overflow-y-auto">
        {mainNav.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            onClick={() => setMobileOpen(false)}
            className={cn(
              'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all',
              isActive(item.href, item.exact)
                ? 'bg-[#40d99d]/10 text-[#40d99d] font-medium border-l-2 border-[#40d99d] ml-[-1px] pl-[11px]'
                : 'text-[#6b7280] hover:bg-[#f0f0f0] hover:text-[#1a1a1a]'
            )}
          >
            <item.icon className="w-4 h-4 flex-shrink-0" />
            {item.label}
          </Link>
        ))}

        {/* Configuración con sub-menú */}
        <div>
          <button
            onClick={() => setConfigOpen(!configOpen)}
            className={cn(
              'w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all',
              isActive('/configuracion')
                ? 'bg-[#40d99d]/10 text-[#40d99d] font-medium'
                : 'text-[#6b7280] hover:bg-[#f0f0f0] hover:text-[#1a1a1a]'
            )}
          >
            <Settings className="w-4 h-4 flex-shrink-0" />
            <span className="flex-1 text-left">Configuración</span>
            {configOpen
              ? <ChevronDown className="w-3.5 h-3.5" />
              : <ChevronRight className="w-3.5 h-3.5" />
            }
          </button>
          {configOpen && (
            <div className="ml-7 mt-0.5 space-y-0.5">
              {configSubItems.map((sub) => (
                <Link
                  key={sub.href}
                  href={sub.href}
                  onClick={() => setMobileOpen(false)}
                  className={cn(
                    'block px-3 py-2 rounded-lg text-xs transition-all',
                    isActive(sub.href, sub.exact)
                      ? 'bg-[#40d99d]/10 text-[#40d99d] font-medium'
                      : 'text-[#6b7280] hover:bg-[#f0f0f0] hover:text-[#1a1a1a]'
                  )}
                >
                  {sub.label}
                </Link>
              ))}
            </div>
          )}
        </div>

        {/* Admin section */}
        {userRole === 'admin' && (
          <>
            <div className="pt-4 pb-1 px-3">
              <p className="text-[10px] font-semibold text-[#6b7280] uppercase tracking-wider">Admin</p>
            </div>
            {adminNav.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setMobileOpen(false)}
                className={cn(
                  'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all',
                  isActive(item.href, item.exact)
                    ? 'bg-[#40d99d]/10 text-[#40d99d] font-medium'
                    : 'text-[#6b7280] hover:bg-[#f0f0f0] hover:text-[#1a1a1a]'
                )}
              >
                <item.icon className="w-4 h-4 flex-shrink-0" />
                {item.label}
              </Link>
            ))}
          </>
        )}
      </nav>

      {/* Consumo widget */}
      <div className="p-3 border-t border-[#e5e5e5] flex-shrink-0">
        <div className="bg-[#f8f8f8] rounded-lg p-3 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[10px] text-[#6b7280]">
              {consumo?.periodo || '19 Mar - 18 Abr'}
            </span>
            <span className="text-[10px] font-medium text-[#40d99d]">{pct}%</span>
          </div>
          <div className="space-y-1">
            <div className="flex items-center justify-between">
              <span className="text-xs text-[#1a1a1a] font-medium">Conversaciones</span>
            </div>
            <div className="h-1.5 bg-[#e5e5e5] rounded-full overflow-hidden">
              <div
                className="h-full bg-[#40d99d] rounded-full transition-all"
                style={{ width: `${Math.min(pct, 100)}%` }}
              />
            </div>
            <p className="text-[10px] text-[#6b7280]">
              {consumo?.conversaciones ?? 194} de {consumo?.limite ?? 1000} conversaciones
            </p>
          </div>
        </div>

        {/* Logout */}
        <button
          onClick={handleLogout}
          className="mt-2 w-full flex items-center gap-2 px-3 py-2 text-xs text-[#6b7280] hover:text-[#dc2626] hover:bg-red-50 rounded-lg transition-all"
        >
          <LogOut className="w-4 h-4" />
          Cerrar sesión
        </button>
      </div>
    </div>
  )

  return (
    <>
      {/* Desktop */}
      <aside className="hidden md:flex w-56 flex-col bg-white border-r border-[#e5e5e5] flex-shrink-0">
        <SidebarContent />
      </aside>

      {/* Mobile toggle */}
      <button
        className="md:hidden fixed bottom-4 right-4 z-50 w-12 h-12 bg-[#40d99d] text-white rounded-full shadow-lg flex items-center justify-center"
        onClick={() => setMobileOpen(!mobileOpen)}
      >
        {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
      </button>

      {/* Mobile drawer */}
      {mobileOpen && (
        <>
          <div className="md:hidden fixed inset-0 bg-black/40 z-40" onClick={() => setMobileOpen(false)} />
          <aside className="md:hidden fixed left-0 top-0 bottom-0 w-56 bg-white z-50 shadow-xl">
            <SidebarContent />
          </aside>
        </>
      )}
    </>
  )
}
