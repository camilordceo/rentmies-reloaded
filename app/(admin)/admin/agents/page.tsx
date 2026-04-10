export const dynamic = 'force-dynamic'

import Link from 'next/link'
import { Plus, Bot } from 'lucide-react'
import { createClient } from '@supabase/supabase-js'
import { AgentCard } from '@/components/agents/agent-card'
import { AgentsClientWrapper } from './agents-client-wrapper'
import type { WhatsappAIWithEmpresa } from '@/lib/types'

function getDB() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )
}

export default async function AgentsPage() {
  const supabase = getDB()

  const { data: agents } = await supabase
    .from('whatsapp_ai')
    .select('*, empresas(nombre, plan)')
    .order('created_at', { ascending: false })

  const { data: convCounts } = await supabase
    .from('conversacion')
    .select('whatsapp_ai_id')
    .eq('activa', true)

  const countMap: Record<string, number> = {}
  for (const row of convCounts || []) {
    countMap[row.whatsapp_ai_id] = (countMap[row.whatsapp_ai_id] || 0) + 1
  }

  const activeCount = (agents || []).filter((a: WhatsappAIWithEmpresa) => a.activo).length

  return (
    <div className="max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-medium text-[#1a1a1a]">AI Agents</h1>
          <p className="text-sm text-[#6b7280] mt-1">
            {activeCount} activos · {(agents || []).length} total
          </p>
        </div>
        <Link
          href="/admin/agents/new"
          className="flex items-center gap-2 px-4 py-2 bg-[#40d99d] text-white text-sm font-medium rounded-lg hover:bg-[#40d99d]/90 transition-all"
        >
          <Plus className="w-4 h-4" />
          Crear agente
        </Link>
      </div>

      {/* Empty state */}
      {!agents || agents.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <div className="w-14 h-14 bg-[#f0f0f0] rounded-2xl flex items-center justify-center mb-4">
            <Bot className="w-7 h-7 text-[#6b7280]" />
          </div>
          <h3 className="text-base font-medium text-[#1a1a1a] mb-1">Sin agentes configurados</h3>
          <p className="text-sm text-[#6b7280] mb-4">Crea tu primer agente WhatsApp AI</p>
          <Link
            href="/admin/agents/new"
            className="flex items-center gap-2 px-4 py-2 bg-[#40d99d] text-white text-sm font-medium rounded-lg hover:bg-[#40d99d]/90 transition-all"
          >
            <Plus className="w-4 h-4" />
            Crear agente
          </Link>
        </div>
      ) : (
        <AgentsClientWrapper
          agents={agents as WhatsappAIWithEmpresa[]}
          countMap={countMap}
        />
      )}
    </div>
  )
}
