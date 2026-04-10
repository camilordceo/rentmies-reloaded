export const dynamic = 'force-dynamic'

import { notFound } from 'next/navigation'
import { createClient } from '@supabase/supabase-js'
import { ArrowLeft, MessageSquare, Calendar } from 'lucide-react'
import Link from 'next/link'
import { AgentForm } from '@/components/agents/agent-form'
import { AgentStatusBadge } from '@/components/agents/agent-status-badge'
import { formatDistanceToNow } from 'date-fns'
import { es } from 'date-fns/locale'
import type { WhatsappAI, Empresa } from '@/lib/types'

function getDB() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )
}

export default async function AgentDetailPage({ params }: { params: { id: string } }) {
  const supabase = getDB()

  const [agentRes, empresasRes] = await Promise.all([
    supabase
      .from('whatsapp_ai')
      .select('*, empresas(nombre, plan)')
      .eq('id', params.id)
      .single(),
    supabase.from('empresas').select('id, nombre, plan, activo').eq('activo', true).order('nombre'),
  ])

  if (!agentRes.data) notFound()

  const agent = agentRes.data as WhatsappAI
  const empresas = (empresasRes.data || []) as Empresa[]

  // Stats
  const { count: totalConvs } = await supabase
    .from('conversacion')
    .select('id', { count: 'exact', head: true })
    .eq('whatsapp_ai_id', params.id)

  const { count: activeConvs } = await supabase
    .from('conversacion')
    .select('id', { count: 'exact', head: true })
    .eq('whatsapp_ai_id', params.id)
    .eq('activa', true)

  const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString()
  const { count: recentMessages } = await supabase
    .from('mensaje')
    .select('id', { count: 'exact', head: true })
    .gte('created_at', thirtyDaysAgo)

  return (
    <div className="max-w-5xl mx-auto">
      <div className="flex items-center gap-3 mb-6">
        <Link href="/admin/agents" className="text-[#6b7280] hover:text-[#1a1a1a] transition-colors">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-medium text-[#1a1a1a]">
              {agent.nombre_agente || 'Agente sin nombre'}
            </h1>
            <AgentStatusBadge activo={agent.activo} />
          </div>
          <p className="text-sm text-[#6b7280] mt-0.5">{agent.empresa_nombre}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Form */}
        <div className="lg:col-span-2">
          <div className="bg-white border border-[#e5e5e5] rounded-xl p-6 shadow-sm">
            <AgentForm agent={agent} empresas={empresas} mode="edit" />
          </div>
        </div>

        {/* Stats panel */}
        <div className="space-y-4">
          <div className="bg-white border border-[#e5e5e5] rounded-xl p-5 shadow-sm">
            <h3 className="text-sm font-medium text-[#1a1a1a] mb-4">Estadísticas</h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs text-[#6b7280]">Total conversaciones</span>
                <span className="text-sm font-medium text-[#1a1a1a]">{totalConvs ?? 0}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-[#6b7280]">Conversaciones activas</span>
                <span className="text-sm font-medium text-[#40d99d]">{activeConvs ?? 0}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-[#6b7280]">Mensajes último mes</span>
                <span className="text-sm font-medium text-[#1a1a1a]">{recentMessages ?? 0}</span>
              </div>
            </div>
          </div>

          <div className="bg-white border border-[#e5e5e5] rounded-xl p-5 shadow-sm">
            <h3 className="text-sm font-medium text-[#1a1a1a] mb-3">Configuración</h3>
            <div className="space-y-2">
              <div>
                <p className="text-xs text-[#6b7280] mb-0.5">Assistant ID</p>
                <p className="text-xs font-mono text-[#1a1a1a] break-all">{agent.assistant_id}</p>
              </div>
              <div>
                <p className="text-xs text-[#6b7280] mb-0.5">Channel UUID</p>
                <p className="text-xs font-mono text-[#1a1a1a] break-all">{agent.channel_uuid_callbell}</p>
              </div>
              <div>
                <p className="text-xs text-[#6b7280] mb-0.5">Número WhatsApp</p>
                <p className="text-xs font-mono text-[#1a1a1a]">+{agent.numero_whatsapp}</p>
              </div>
            </div>
          </div>

          <Link
            href="/admin/wa-conversations"
            className="flex items-center gap-2 p-4 bg-white border border-[#e5e5e5] rounded-xl shadow-sm hover:border-[#40d99d] transition-all text-sm text-[#1a1a1a]"
          >
            <MessageSquare className="w-4 h-4 text-[#40d99d]" />
            Ver conversaciones
          </Link>
        </div>
      </div>
    </div>
  )
}
