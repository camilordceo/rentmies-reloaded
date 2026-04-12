export const dynamic = 'force-dynamic'

import Link from 'next/link'
import { Plus, Sparkles } from 'lucide-react'
import { createAdminClient } from '@/lib/supabase/admin'
import { AgentsClientWrapper } from './agents-client-wrapper'
import type { AgenteIAWithEmpresa } from '@/lib/types'

export default async function AgentsPage() {
  const db = createAdminClient()

  const { data: agents } = await db
    .from('agentes_ia')
    .select('*, empresas(nombre, plan)')
    .order('created_at', { ascending: false })

  const { data: convCounts } = await db
    .from('conversacion')
    .select('whatsapp_ai_id')
    .eq('activa', true)

  const countMap: Record<string, number> = {}
  for (const row of convCounts || []) {
    countMap[row.whatsapp_ai_id] = (countMap[row.whatsapp_ai_id] || 0) + 1
  }

  const activeCount = (agents || []).filter((a: AgenteIAWithEmpresa) => a.activo).length

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-[11px] font-bold uppercase tracking-[0.15em] text-authority-green mb-1">AGENTES IA</p>
          <h1 className="text-3xl font-bold tracking-tight text-on-surface">AI Agents</h1>
          <p className="text-on-surface/50 text-sm mt-1">
            {activeCount} activos · {(agents || []).length} total
          </p>
        </div>
        <Link
          href="/admin/agents/new"
          className="flex items-center gap-2 px-4 py-2 bg-authority-green text-white text-sm font-semibold rounded-lg hover:bg-authority-green/90 transition-all"
        >
          <Plus className="w-3.5 h-3.5" />
          Crear agente
        </Link>
      </div>

      {!agents || agents.length === 0 ? (
        <div className="bg-surface-container-lowest rounded-xl p-16 text-center shadow-editorial">
          <div className="w-14 h-14 bg-surface-container rounded-xl flex items-center justify-center mx-auto mb-4">
            <Sparkles className="w-7 h-7 text-on-surface/30" />
          </div>
          <h3 className="text-base font-semibold text-on-surface mb-1">Sin agentes configurados</h3>
          <p className="text-sm text-on-surface/50 mb-5">Crea tu primer agente WhatsApp AI</p>
          <Link
            href="/admin/agents/new"
            className="inline-flex items-center gap-2 px-4 py-2 bg-authority-green text-white text-sm font-semibold rounded-lg hover:bg-authority-green/90 transition-all"
          >
            <Plus className="w-3.5 h-3.5" />
            Crear agente
          </Link>
        </div>
      ) : (
        <AgentsClientWrapper
          agents={agents as AgenteIAWithEmpresa[]}
          countMap={countMap}
        />
      )}
    </div>
  )
}
