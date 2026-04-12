'use client'

import { useState, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { Search } from 'lucide-react'
import { AgentCard } from '@/components/agents/agent-card'
import type { AgenteIAWithEmpresa } from '@/lib/types'

interface AgentsClientWrapperProps {
  agents: AgenteIAWithEmpresa[]
  countMap: Record<string, number>
}

export function AgentsClientWrapper({ agents, countMap }: AgentsClientWrapperProps) {
  const router = useRouter()
  const [search, setSearch] = useState('')
  const [filterStatus, setFilterStatus] = useState<'all' | 'active' | 'inactive'>('all')

  const filtered = useMemo(() => {
    return agents.filter((a) => {
      const matchSearch =
        !search ||
        a.nombre.toLowerCase().includes(search.toLowerCase()) ||
        (a.empresa_nombre ?? '').toLowerCase().includes(search.toLowerCase()) ||
        (a.numero_whatsapp ?? '').includes(search)

      const matchStatus =
        filterStatus === 'all' ||
        (filterStatus === 'active' && a.activo) ||
        (filterStatus === 'inactive' && !a.activo)

      return matchSearch && matchStatus
    })
  }, [agents, search, filterStatus])

  async function handleToggle(id: string, activo: boolean) {
    await fetch(`/api/agents/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ activo }),
    })
    router.refresh()
  }

  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="flex items-center gap-3">
        <div className="relative flex-1 max-w-xs">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-on-surface/40" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar agente..."
            className="w-full h-9 pl-9 pr-3 bg-surface-container rounded-lg text-sm text-on-surface placeholder:text-on-surface/35 outline-none focus:ring-2 focus:ring-brand-teal/30 transition-all"
          />
        </div>

        <div className="flex items-center gap-1 bg-surface-container rounded-xl p-1">
          {(['all', 'active', 'inactive'] as const).map((s) => (
            <button
              key={s}
              onClick={() => setFilterStatus(s)}
              className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-all ${
                filterStatus === s
                  ? 'bg-surface-container-lowest text-on-surface shadow-editorial'
                  : 'text-on-surface/50 hover:text-on-surface'
              }`}
            >
              {s === 'all' ? 'Todos' : s === 'active' ? 'Activos' : 'Inactivos'}
            </button>
          ))}
        </div>
      </div>

      {/* Grid */}
      {filtered.length === 0 ? (
        <p className="text-sm text-on-surface/40 text-center py-12">No se encontraron agentes</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filtered.map((agent) => (
            <AgentCard
              key={agent.id}
              agent={agent}
              conversationCount={countMap[agent.id] || 0}
              onToggle={handleToggle}
            />
          ))}
        </div>
      )}
    </div>
  )
}
