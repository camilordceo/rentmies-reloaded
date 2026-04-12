export const dynamic = 'force-dynamic'

import { createClient } from '@supabase/supabase-js'
import { FlaskConical, Sparkles } from 'lucide-react'
import { TestPanel } from '@/components/testing/test-panel'
import type { WhatsappAI } from '@/lib/types'

function getDB() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )
}

export default async function TestingPage() {
  const supabase = getDB()
  const { data: agents } = await supabase
    .from('whatsapp_ai')
    .select('*')
    .eq('activo', true)
    .order('nombre_agente')

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div>
        <p className="text-[11px] font-bold uppercase tracking-[0.15em] text-authority-green mb-1">QA</p>
        <div className="flex items-center gap-2 mb-1">
          <FlaskConical className="w-5 h-5 text-brand-teal" />
          <h1 className="text-3xl font-bold tracking-tight text-on-surface">Panel de Pruebas</h1>
        </div>
        <p className="text-on-surface/50 text-sm">
          Envía mensajes de prueba via Callbell o simula el procesamiento completo del webhook sin enviar por WhatsApp.
        </p>
      </div>

      <TestPanel agents={(agents || []) as WhatsappAI[]} />

      {/* Recent logs */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <p className="text-[10px] font-bold uppercase tracking-widest text-on-surface/40">LOGS RECIENTES</p>
          <a
            href="/admin/logs"
            className="text-xs text-brand-teal hover:text-authority-green font-medium transition-colors"
          >
            Ver todos →
          </a>
        </div>
        <RecentLogs />
      </div>
    </div>
  )
}

async function RecentLogs() {
  const supabase = getDB()
  const { data: logs } = await supabase
    .from('admin_logs')
    .select('*')
    .in('source', ['webhook', 'conversation-manager', 'test-panel'])
    .order('created_at', { ascending: false })
    .limit(20)

  if (!logs || logs.length === 0) {
    return (
      <div className="bg-surface-container-lowest rounded-xl p-8 text-center shadow-editorial">
        <p className="text-sm text-on-surface/40">Sin logs recientes</p>
      </div>
    )
  }

  const levelColors: Record<string, string> = {
    debug: 'bg-surface-container text-on-surface/50',
    info: 'bg-blue-50 text-blue-600',
    warn: 'bg-amber-50 text-amber-600',
    error: 'bg-red-50 text-red-600',
  }

  return (
    <div className="bg-surface-container-lowest rounded-xl overflow-hidden shadow-editorial">
      {logs.map((log, i) => (
        <div
          key={log.id}
          className={`flex items-start gap-3 px-4 py-3 ${i > 0 ? 'border-t border-outline-variant/10' : ''}`}
        >
          <span className={`mt-0.5 flex-shrink-0 px-1.5 py-0.5 rounded text-[10px] font-bold uppercase ${levelColors[log.level] || levelColors.info}`}>
            {log.level}
          </span>
          <div className="flex-1 min-w-0">
            <p className="text-xs text-on-surface truncate">{log.message}</p>
            <p className="text-[10px] text-on-surface/40 mt-0.5">
              {log.source} · {new Date(log.created_at).toLocaleTimeString('es-CO')}
            </p>
          </div>
        </div>
      ))}
    </div>
  )
}
