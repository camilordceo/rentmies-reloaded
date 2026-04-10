export const dynamic = 'force-dynamic'

import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { ConversacionesView } from '@/components/conversaciones/conversaciones-view'

export default async function ConversacionesPage() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase.from('profiles').select('empresa_id,rol').eq('id', user.id).single()

  const db = createAdminClient()
  const empresaId = profile?.empresa_id || ''

  // Get this company's WhatsApp AI agent IDs first, then filter conversations by them
  const { data: waAgents } = await db.from('agentes_ia').select('id').eq('empresa_id', empresaId)
  const waIds = (waAgents || []).map((a: any) => a.id)

  const [{ data: convs }, { data: agentes }, { data: etiquetas }] = await Promise.all([
    waIds.length > 0
      ? db.from('conversacion')
          .select(`*, whatsapp_ai(id,nombre_agente,numero_whatsapp,empresa_id), user_conversacion(id,telefono,nombre)`)
          .in('whatsapp_ai_id', waIds)
          .order('ultimo_mensaje_at', { ascending: false })
          .limit(200)
      : Promise.resolve({ data: [] }),
    db.from('agentes').select('id,nombre,email').eq('empresa_id', empresaId).eq('activo', true),
    db.from('etiquetas').select('id,nombre,color').eq('empresa_id', empresaId),
  ])

  return (
    <ConversacionesView
      initialConversations={convs || []}
      agentes={agentes || []}
      etiquetas={etiquetas || []}
      empresaId={empresaId}
    />
  )
}
