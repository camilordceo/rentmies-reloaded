'use client'

import Link from 'next/link'
import { Sparkles, Phone, Building2, MessageSquare, Pencil, Power } from 'lucide-react'
import { AgentStatusBadge } from './agent-status-badge'
import type { AgenteIAWithEmpresa } from '@/lib/types'

interface AgentCardProps {
  agent: AgenteIAWithEmpresa
  conversationCount?: number
  onToggle?: (id: string, activo: boolean) => void
}

export function AgentCard({ agent, conversationCount = 0, onToggle }: AgentCardProps) {
  return (
    <div className="bg-surface-container-lowest rounded-xl p-5 shadow-editorial hover:shadow-glow-subtle transition-all">
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-brand-teal/10 rounded-xl flex items-center justify-center flex-shrink-0">
            <Sparkles className="w-5 h-5 text-brand-teal" />
          </div>
          <div>
            <h3 className="font-semibold text-on-surface text-sm leading-tight">
              {agent.nombre || 'Sin nombre'}
            </h3>
            <p className="text-xs text-on-surface/50 mt-0.5">{agent.empresa_nombre}</p>
          </div>
        </div>
        <AgentStatusBadge activo={agent.activo} />
      </div>

      {/* Details */}
      <div className="space-y-2 mb-4">
        <div className="flex items-center gap-2 text-xs text-on-surface/50">
          <Phone className="w-3.5 h-3.5 flex-shrink-0" />
          <span className="font-mono">+{agent.numero_whatsapp}</span>
        </div>
        <div className="flex items-center gap-2 text-xs text-on-surface/50">
          <Building2 className="w-3.5 h-3.5 flex-shrink-0" />
          <span className="truncate">{agent.empresas?.nombre ?? agent.empresa_nombre}</span>
        </div>
        <div className="flex items-center gap-2 text-xs text-on-surface/50">
          <MessageSquare className="w-3.5 h-3.5 flex-shrink-0" />
          <span>{conversationCount} conversaciones activas</span>
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-2 pt-4 border-t border-outline-variant/10">
        <Link
          href={`/admin/agents/${agent.id}`}
          className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-semibold text-on-surface bg-surface-container rounded-lg hover:bg-surface-container-high transition-all"
        >
          <Pencil className="w-3.5 h-3.5" />
          Editar
        </Link>
        <button
          onClick={() => onToggle?.(agent.id, !agent.activo)}
          className={`flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-lg transition-all ${
            agent.activo
              ? 'text-on-surface/50 bg-surface-container hover:bg-surface-container-high'
              : 'text-brand-teal bg-brand-teal/10 hover:bg-brand-teal/20'
          }`}
        >
          <Power className="w-3.5 h-3.5" />
          {agent.activo ? 'Desactivar' : 'Activar'}
        </button>
      </div>
    </div>
  )
}
