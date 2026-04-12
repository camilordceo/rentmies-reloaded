'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import {
  Home, Building2, MessageSquare, Users, Users2, BarChart3,
  CreditCard, Settings, LogOut, ChevronDown, ChevronRight,
  Bot, ScrollText, ShieldCheck, FlaskConical, Webhook,
  Menu, X, Calendar, Sparkles, Plus,
} from 'lucide-react'
import { useState } from 'react'
import { cn } from '@/lib/utils'
import { createClient } from '@/lib/supabase/client'

const adminNav = [
  { href: '/admin', label: 'Admin', icon: ShieldCheck, exact: true },
  { href: '/admin/agents', label: 'AI Agents', icon: Bot },
  { href: '/admin/wa-conversations', label: 'WhatsApp Chats', icon: Webhook },
  { href: '/admin/testing', label: 'Testing', icon: FlaskConical },
  { href: '/admin/logs', label: 'Logs', icon: ScrollText },
]

const configSubItems = [
  { href: '/configuracion', label: 'General', exact: true },
  { href: '/configuracion/agentes-ia', label: 'Agentes IA' },
]

function getNav(role: string) {
  if (role === 'agente') return [
    { href: '/dashboard', label: 'Inicio', icon: Home, exact: true },
    { href: '/conversaciones', label: 'Conversaciones', icon: MessageSquare },
    { href: '/mis-leads', label: 'Mis Leads', icon: Users },
    { href: '/mis-citas-agente', label: 'Mis Citas', icon: Calendar },
  ]
  if (role === 'empresa_admin') return [
    { href: '/dashboard', label: 'Inicio', icon: Home, exact: true },
    { href: '/empresa', label: 'Empresa', icon: Building2 },
    { href: '/conversaciones', label: 'Conversaciones', icon: MessageSquare },
    { href: '/crm', label: 'CRM', icon: Users },
    { href: '/analytics', label: 'Analytics', icon: BarChart3 },
    { href: '/pagos', label: 'Pagos', icon: CreditCard },
    { href: '/mi-equipo', label: 'Mi Equipo', icon: Users2 },
  ]
  return [
    { href: '/dashboard', label: 'Inicio', icon: Home, exact: true },
    { href: '/empresa', label: 'Empresa', icon: Building2 },
    { href: '/conversaciones', label: 'Conversaciones', icon: MessageSquare },
    { href: '/crm', label: 'CRM', icon: Users },
    { href: '/analytics', label: 'Analytics', icon: BarChart3 },
    { href: '/pagos', label: 'Pagos', icon: CreditCard },
  ]
}

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
  const nav = getNav(userRole)

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
      <div className="h-14 flex items-center px-4 flex-shrink-0">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 bg-brand-teal rounded-lg flex items-center justify-center flex-shrink-0">
            <Bot className="w-4 h-4 text-white" />
          </div>
          <span className="font-semibold text-on-surface text-sm tracking-tight">Rentmies</span>
        </div>
      </div>

      {/* EMA Status Block */}
      <div className="mx-3 mb-2 px-3 py-2.5 rounded-lg bg-brand-teal/8">
        <div className="flex items-center gap-2">
          <Sparkles className="w-3.5 h-3.5 text-brand-teal flex-shrink-0" />
          <span className="text-xs font-bold text-on-surface tracking-tight">EMA</span>
          <span className="ml-auto w-1.5 h-1.5 rounded-full bg-brand-teal animate-pulse" />
        </div>
        <p className="text-[10px] font-bold uppercase tracking-widest text-brand-teal mt-0.5">
          PROACTIVE MODE: ACTIVE
        </p>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 space-y-0.5 overflow-y-auto hide-scrollbar">
        {nav.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            onClick={() => setMobileOpen(false)}
            className={cn(
              'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all',
              isActive(item.href, item.exact)
                ? 'bg-brand-teal/10 text-brand-teal font-medium'
                : 'text-on-surface/50 hover:bg-surface-container hover:text-on-surface'
            )}
          >
            <item.icon className="w-4 h-4 flex-shrink-0" />
            {item.label}
          </Link>
        ))}

        {/* Configuración con sub-menú */}
        {userRole !== 'agente' && (
          <div>
            <button
              onClick={() => setConfigOpen(!configOpen)}
              className={cn(
                'w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all',
                isActive('/configuracion')
                  ? 'bg-brand-teal/10 text-brand-teal font-medium'
                  : 'text-on-surface/50 hover:bg-surface-container hover:text-on-surface'
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
                        ? 'bg-brand-teal/10 text-brand-teal font-medium'
                        : 'text-on-surface/50 hover:bg-surface-container hover:text-on-surface'
                    )}
                  >
                    {sub.label}
                  </Link>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Admin section */}
        {userRole === 'admin' && (
          <>
            <div className="pt-4 pb-1 px-3">
              <p className="text-[10px] font-bold uppercase tracking-widest text-on-surface/30">Admin</p>
            </div>
            {adminNav.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setMobileOpen(false)}
                className={cn(
                  'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all',
                  isActive(item.href, item.exact)
                    ? 'bg-brand-teal/10 text-brand-teal font-medium'
                    : 'text-on-surface/50 hover:bg-surface-container hover:text-on-surface'
                )}
              >
                <item.icon className="w-4 h-4 flex-shrink-0" />
                {item.label}
              </Link>
            ))}
          </>
        )}
      </nav>

      {/* Bottom section */}
      <div className="p-3 flex-shrink-0 space-y-3">
        {/* New Listing CTA */}
        <Link
          href="/empresa?tab=inventario"
          className="flex items-center justify-center gap-2 w-full py-2.5 rounded-lg bg-brand-teal text-white text-sm font-semibold hover:bg-brand-teal/90 transition-colors"
        >
          <Plus className="w-4 h-4" />
          New Listing
        </Link>

        {/* Consumo */}
        <div className="bg-surface-container-low rounded-lg p-3 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[10px] text-on-surface/40">
              {consumo?.periodo || '19 Mar - 18 Abr'}
            </span>
            <span className="text-[10px] font-bold text-brand-teal">{pct}%</span>
          </div>
          <div className="h-1 bg-surface-container-highest rounded-full overflow-hidden">
            <div
              className="h-full bg-brand-teal rounded-full transition-all"
              style={{ width: `${Math.min(pct, 100)}%` }}
            />
          </div>
          <p className="text-[10px] text-on-surface/40">
            {consumo?.conversaciones ?? 194} / {consumo?.limite ?? 1000} conversaciones
          </p>
        </div>

        {/* Utility links */}
        <div className="flex items-center justify-between px-1">
          <Link href="/configuracion" className="text-[11px] text-on-surface/40 hover:text-on-surface transition-colors">
            Configuración
          </Link>
          <span className="text-on-surface/20">·</span>
          <button className="text-[11px] text-on-surface/40 hover:text-on-surface transition-colors">
            Soporte
          </button>
          <span className="text-on-surface/20">·</span>
          <button
            onClick={handleLogout}
            className="text-[11px] text-on-surface/40 hover:text-red-500 transition-colors flex items-center gap-1"
          >
            <LogOut className="w-3 h-3" />
            Salir
          </button>
        </div>
      </div>
    </div>
  )

  return (
    <>
      {/* Desktop */}
      <aside className="hidden md:flex w-56 flex-col bg-surface border-r border-outline-variant/20 flex-shrink-0">
        <SidebarContent />
      </aside>

      {/* Mobile toggle */}
      <button
        className="md:hidden fixed bottom-4 right-4 z-50 w-12 h-12 bg-brand-teal text-white rounded-full shadow-glow-subtle flex items-center justify-center"
        onClick={() => setMobileOpen(!mobileOpen)}
      >
        {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
      </button>

      {/* Mobile drawer */}
      {mobileOpen && (
        <>
          <div className="md:hidden fixed inset-0 bg-black/40 backdrop-blur-sm z-40" onClick={() => setMobileOpen(false)} />
          <aside className="md:hidden fixed left-0 top-0 bottom-0 w-56 bg-surface z-50 shadow-editorial">
            <SidebarContent />
          </aside>
        </>
      )}
    </>
  )
}
