export const dynamic = 'force-dynamic'

import { createAdminClient } from '@/lib/supabase/admin'
import { ArrowLeft, Sparkles } from 'lucide-react'
import Link from 'next/link'
import { AgentForm } from '@/components/agents/agent-form'
import type { Empresa } from '@/lib/types'

export default async function NewAgentPage() {
  const db = createAdminClient()
  const { data: empresas } = await db
    .from('empresas')
    .select('id, nombre, plan, activo')
    .eq('activo', true)
    .order('nombre')

  return (
    <div className="max-w-3xl mx-auto">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <Link
          href="/admin/agents"
          className="p-2 hover:bg-surface-container rounded-lg transition-colors text-on-surface/40 hover:text-on-surface"
        >
          <ArrowLeft className="w-4 h-4" />
        </Link>
        <div>
          <p className="text-[11px] font-bold uppercase tracking-[0.15em] text-authority-green mb-0.5">AGENTES IA</p>
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 bg-brand-teal/10 rounded-lg flex items-center justify-center">
              <Sparkles className="w-3.5 h-3.5 text-brand-teal" />
            </div>
            <h1 className="text-2xl font-bold tracking-tight text-on-surface">Nuevo agente AI</h1>
          </div>
          <p className="text-sm text-on-surface/40 mt-0.5 ml-8">Configura un nuevo agente de WhatsApp</p>
        </div>
      </div>

      <div className="bg-surface-container-lowest rounded-xl p-6 shadow-editorial">
        <AgentForm empresas={empresas as Empresa[]} mode="create" />
      </div>
    </div>
  )
}
