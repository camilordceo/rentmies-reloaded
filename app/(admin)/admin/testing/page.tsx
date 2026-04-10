export const dynamic = 'force-dynamic'

import { createClient } from '@supabase/supabase-js'
import { FlaskConical } from 'lucide-react'
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
    <div className="max-w-5xl mx-auto">
      <div className="mb-6">
        <div className="flex items-center gap-2 mb-1">
          <FlaskConical className="w-5 h-5 text-[#40d99d]" />
          <h1 className="text-2xl font-medium text-[#1a1a1a]">Panel de pruebas</h1>
        </div>
        <p className="text-sm text-[#6b7280]">
          Envía mensajes de prueba via Callbell o simula el procesamiento completo del webhook sin enviar por WhatsApp.
        </p>
      </div>

      <TestPanel agents={(agents || []) as WhatsappAI[]} />

      {/* Recent logs */}
      <div className="mt-6">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-medium text-[#1a1a1a]">Logs recientes</h2>
          <a
            href="/admin/logs"
            className="text-xs text-[#40d99d] hover:underline"
          >
            Ver todos
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
      <div className="bg-white border border-[#e5e5e5] rounded-xl p-5 text-center">
        <p className="text-sm text-[#6b7280]">Sin logs recientes</p>
      </div>
    )
  }

  const levelColors: Record<string, string> = {
    debug: 'bg-[#f0f0f0] text-[#6b7280]',
    info: 'bg-blue-50 text-blue-600',
    warn: 'bg-amber-50 text-amber-600',
    error: 'bg-red-50 text-red-600',
  }

  return (
    <div className="bg-white border border-[#e5e5e5] rounded-xl overflow-hidden shadow-sm">
      <div className="divide-y divide-[#e5e5e5]">
        {logs.map((log) => (
          <div key={log.id} className="flex items-start gap-3 px-4 py-3">
            <span
              className={`mt-0.5 flex-shrink-0 px-1.5 py-0.5 rounded text-[10px] font-medium uppercase ${
                levelColors[log.level] || levelColors.info
              }`}
            >
              {log.level}
            </span>
            <div className="flex-1 min-w-0">
              <p className="text-xs text-[#1a1a1a] truncate">{log.message}</p>
              <p className="text-[10px] text-[#6b7280] mt-0.5">
                {log.source} · {new Date(log.created_at).toLocaleTimeString('es-CO')}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
