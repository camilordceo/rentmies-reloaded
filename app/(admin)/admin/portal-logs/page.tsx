export const dynamic = 'force-dynamic'

import { createAdminClient } from '@/lib/supabase/admin'
import { PortalLogsClient } from './portal-logs-client'
import type { PortalConversacion } from './portal-logs-client'

async function fetchPortalData() {
  try {
    const db = createAdminClient()
    const todayStart = new Date()
    todayStart.setHours(0, 0, 0, 0)

    const { data: convs, error } = await db
      .from('conversacion')
      .select('id, created_at, ultimo_mensaje_at, metadata')
      .filter('metadata->>source', 'eq', 'portal')
      .order('created_at', { ascending: false })
      .limit(200)

    if (error) {
      console.error('[portal-logs] conversacion query error:', error.message)
      return empty()
    }

    if (!convs?.length) return empty()

    const convIds = convs.map((c) => c.id)

    const { data: msgs, error: msgErr } = await db
      .from('mensaje')
      .select('id, conversacion_id, rol, texto, created_at, metadata')
      .in('conversacion_id', convIds)
      .order('created_at', { ascending: true })

    if (msgErr) console.error('[portal-logs] mensaje query error:', msgErr.message)

    const msgsByConv: Record<string, PortalConversacion['mensajes']> = {}
    for (const m of msgs ?? []) {
      if (!msgsByConv[m.conversacion_id]) msgsByConv[m.conversacion_id] = []
      msgsByConv[m.conversacion_id].push(m as PortalConversacion['mensajes'][0])
    }

    const conversations: PortalConversacion[] = convs.map((c) => ({
      id: c.id,
      created_at: c.created_at,
      ultimo_mensaje_at: c.ultimo_mensaje_at,
      metadata: c.metadata ?? {},
      mensajes: msgsByConv[c.id] ?? [],
    }))

    const todaySessions = convs.filter(
      (c) => c.created_at >= todayStart.toISOString()
    ).length
    const totalMessages = (msgs ?? []).length

    const intentCount: Record<string, number> = {}
    for (const m of msgs ?? []) {
      for (const i of (m.metadata?.intents ?? []) as string[]) {
        intentCount[i] = (intentCount[i] ?? 0) + 1
      }
    }
    const topIntents = Object.entries(intentCount)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .map(([intent, count]) => ({ intent, count }))

    return {
      conversations,
      stats: { totalSessions: convs.length, totalMessages, todaySessions, topIntents },
    }
  } catch (err) {
    console.error('[portal-logs] unexpected error:', err)
    return empty()
  }
}

function empty() {
  return {
    conversations: [] as PortalConversacion[],
    stats: {
      totalSessions: 0,
      totalMessages: 0,
      todaySessions: 0,
      topIntents: [] as Array<{ intent: string; count: number }>,
    },
  }
}

export default async function PortalLogsPage() {
  const { conversations, stats } = await fetchPortalData()

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div>
        <p className="text-[11px] font-bold uppercase tracking-[0.15em] text-authority-green mb-1">
          PORTAL B2C
        </p>
        <h1 className="text-3xl font-bold tracking-tight text-on-surface">Logs del Portal</h1>
        <p className="text-on-surface/50 text-sm mt-1">
          Conversaciones de EMA en el atlas — úsalas para afinar el asistente
        </p>
      </div>

      <PortalLogsClient conversations={conversations} stats={stats} />
    </div>
  )
}
