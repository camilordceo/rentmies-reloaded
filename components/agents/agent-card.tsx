'use client'

import Link from 'next/link'
import { Bot, Phone, Building2, MessageSquare, Pencil, Power } from 'lucide-react'
import { AgentStatusBadge } from './agent-status-badge'
import type { WhatsappAIWithEmpresa } from '@/lib/types'

interface AgentCardProps {
  agent: WhatsappAIWithEmpresa
  conversationCount?: number
  onToggle?: (id: string, activo: boolean) => void
}

export function AgentCard({ agent, conversationCount = 0, onToggle }: AgentCardProps) {
  return (
    <div className="bg-white border border-[#e5e5e5] rounded-xl p-5 shadow-sm hover:border-[#40d99d] transition-all group">
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-[#40d99d]/10 rounded-xl flex items-center justify-center flex-shrink-0">
            <Bot className="w-5 h-5 text-[#40d99d]" />
          </div>
          <div>
            <h3 className="font-medium text-[#1a1a1a] text-sm leading-tight">
              {agent.nombre_agente || 'Sin nombre'}
            </h3>
            <p className="text-xs text-[#6b7280] mt-0.5">{agent.empresa_nombre}</p>
          </div>
        </div>
        <AgentStatusBadge activo={agent.activo} />
      </div>

      {/* Details */}
      <div className="space-y-2 mb-4">
        <div className="flex items-center gap-2 text-xs text-[#6b7280]">
          <Phone className="w-3.5 h-3.5 flex-shrink-0" />
          <span className="font-mono">+{agent.numero_whatsapp}</span>
        </div>
        <div className="flex items-center gap-2 text-xs text-[#6b7280]">
          <Building2 className="w-3.5 h-3.5 flex-shrink-0" />
          <span className="truncate">{agent.empresas?.nombre || agent.empresa_nombre}</span>
        </div>
        <div className="flex items-center gap-2 text-xs text-[#6b7280]">
          <MessageSquare className="w-3.5 h-3.5 flex-shrink-0" />
          <span>{conversationCount} conversaciones activas</span>
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-2 pt-3 border-t border-[#e5e5e5]">
        <Link
          href={`/admin/agents/${agent.id}`}
          className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-medium text-[#1a1a1a] bg-[#f0f0f0] rounded-lg hover:bg-[#e5e5e5] transition-all"
        >
          <Pencil className="w-3.5 h-3.5" />
          Editar
        </Link>
        <button
          onClick={() => onToggle?.(agent.id, !agent.activo)}
          className={`flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-medium rounded-lg transition-all ${
            agent.activo
              ? 'text-[#6b7280] bg-[#f0f0f0] hover:bg-[#e5e5e5]'
              : 'text-[#40d99d] bg-[#40d99d]/10 hover:bg-[#40d99d]/20'
          }`}
        >
          <Power className="w-3.5 h-3.5" />
          {agent.activo ? 'Desactivar' : 'Activar'}
        </button>
      </div>
    </div>
  )
}
