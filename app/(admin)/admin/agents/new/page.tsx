export const dynamic = 'force-dynamic'

import { createClient } from '@supabase/supabase-js'
import { ArrowLeft } from 'lucide-react'
import Link from 'next/link'
import { AgentForm } from '@/components/agents/agent-form'
import type { Empresa } from '@/lib/types'

function getDB() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )
}

export default async function NewAgentPage() {
  const supabase = getDB()
  const { data: empresas } = await supabase
    .from('empresas')
    .select('id, nombre, plan, activo')
    .eq('activo', true)
    .order('nombre')

  return (
    <div className="max-w-3xl mx-auto">
      <div className="flex items-center gap-3 mb-6">
        <Link href="/admin/agents" className="text-[#6b7280] hover:text-[#1a1a1a] transition-colors">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div>
          <h1 className="text-2xl font-medium text-[#1a1a1a]">Nuevo agente AI</h1>
          <p className="text-sm text-[#6b7280] mt-0.5">Configura un nuevo agente de WhatsApp</p>
        </div>
      </div>

      <div className="bg-white border border-[#e5e5e5] rounded-xl p-6 shadow-sm">
        <AgentForm empresas={empresas as Empresa[]} mode="create" />
      </div>
    </div>
  )
}
