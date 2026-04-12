export const dynamic = 'force-dynamic'

import { notFound } from 'next/navigation'
import { createAdminClient } from '@/lib/supabase/admin'
import { ArrowLeft, MessageSquare, Sparkles } from 'lucide-react'
import Link from 'next/link'
import { AgentForm } from '@/components/agents/agent-form'
import { AgentStatusBadge } from '@/components/agents/agent-status-badge'
import type { AgenteIA, Empresa } from '@/lib/types'

export default async function AgentDetailPage({ params }: { params: { id: string } }) {
  const db = createAdminClient()

  const [agentRes, empresasRes] = await Promise.all([
    db.from('agentes_ia').select('*, empresas(nombre, plan)').eq('id', params.id).single(),
    db.from('empresas').select('id, nombre, plan, activo').eq('activo', true).order('nombre'),
  ])

  if (!agentRes.data) notFound()

  const agent = agentRes.data as AgenteIA
  const empresas = (empresasRes.data || []) as Empresa[]

  const { count: totalConvs } = await db
    .from('conversacion')
    .select('id', { count: 'exact', head: true })
    .eq('whatsapp_ai_id', params.id)

  const { count: activeConvs } = await db
    .from('conversacion')
    .select('id', { count: 'exact', head: true })
    .eq('whatsapp_ai_id', params.id)
    .eq('activa', true)

  const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString()
  const { count: recentMessages } = await db
    .from('mensaje')
    .select('id', { count: 'exact', head: true })
    .gte('created_at', thirtyDaysAgo)

  return (
    <div className="max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <Link
          href="/admin/agents"
          className="p-2 hover:bg-surface-container rounded-lg transition-colors text-on-surface/40 hover:text-on-surface"
        >
          <ArrowLeft className="w-4 h-4" />
        </Link>
        <div className="flex-1">
          <p className="text-[11px] font-bold uppercase tracking-[0.15em] text-authority-green mb-0.5">AGENTES IA</p>
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 bg-brand-teal/10 rounded-lg flex items-center justify-center">
              <Sparkles className="w-3.5 h-3.5 text-brand-teal" />
            </div>
            <h1 className="text-2xl font-bold tracking-tight text-on-surface">
              {agent.nombre || 'Agente sin nombre'}
            </h1>
            <AgentStatusBadge activo={agent.activo} />
          </div>
          <p className="text-sm text-on-surface/40 mt-0.5 ml-8">{agent.empresa_nombre}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Form */}
        <div className="lg:col-span-2">
          <div className="bg-surface-container-lowest rounded-xl p-6 shadow-editorial">
            <AgentForm agent={agent} empresas={empresas} mode="edit" />
          </div>
        </div>

        {/* Stats panel */}
        <div className="space-y-4">
          <div className="bg-surface-container-lowest rounded-xl p-5 shadow-editorial">
            <p className="text-[10px] font-bold uppercase tracking-widest text-on-surface/40 mb-4">Estadísticas</p>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs text-on-surface/50">Total conversaciones</span>
                <span className="text-sm font-bold text-authority-green">{totalConvs ?? 0}</span>
              </div>
              <div className="flex items-center justify-between border-t border-outline-variant/10 pt-3">
                <span className="text-xs text-on-surface/50">Conversaciones activas</span>
                <span className="text-sm font-bold text-brand-teal">{activeConvs ?? 0}</span>
              </div>
              <div className="flex items-center justify-between border-t border-outline-variant/10 pt-3">
                <span className="text-xs text-on-surface/50">Mensajes último mes</span>
                <span className="text-sm font-bold text-on-surface">{recentMessages ?? 0}</span>
              </div>
            </div>
          </div>

          <div className="bg-surface-container-lowest rounded-xl p-5 shadow-editorial">
            <p className="text-[10px] font-bold uppercase tracking-widest text-on-surface/40 mb-3">Configuración</p>
            <div className="space-y-3">
              <div>
                <p className="text-[10px] text-on-surface/40 uppercase tracking-widest mb-0.5">Assistant ID</p>
                <p className="text-xs font-mono text-on-surface/60 break-all bg-surface-container rounded-lg px-2 py-1.5">{agent.assistant_id}</p>
              </div>
              <div>
                <p className="text-[10px] text-on-surface/40 uppercase tracking-widest mb-0.5">Channel UUID</p>
                <p className="text-xs font-mono text-on-surface/60 break-all bg-surface-container rounded-lg px-2 py-1.5">{agent.channel_uuid_callbell}</p>
              </div>
              <div>
                <p className="text-[10px] text-on-surface/40 uppercase tracking-widest mb-0.5">Número WhatsApp</p>
                <p className="text-xs font-mono text-on-surface/60 bg-surface-container rounded-lg px-2 py-1.5">+{agent.numero_whatsapp}</p>
              </div>
            </div>
          </div>

          <Link
            href="/admin/wa-conversations"
            className="flex items-center gap-2 p-4 bg-surface-container-lowest rounded-xl shadow-editorial hover:shadow-glow-subtle transition-all group"
          >
            <div className="w-8 h-8 bg-brand-teal/10 rounded-lg flex items-center justify-center flex-shrink-0 group-hover:bg-brand-teal/20 transition-colors">
              <MessageSquare className="w-4 h-4 text-brand-teal" />
            </div>
            <span className="text-sm font-semibold text-on-surface">Ver conversaciones</span>
          </Link>
        </div>
      </div>
    </div>
  )
}
