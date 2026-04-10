export const dynamic = 'force-dynamic'

import { createClient } from '@supabase/supabase-js'
import { WaConversationsClient } from './wa-conversations-client'
import type { ConversacionWithDetails, WhatsappAI } from '@/lib/types'

function getDB() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )
}

export default async function WaConversationsPage() {
  const supabase = getDB()

  const [convsRes, agentsRes] = await Promise.all([
    supabase
      .from('conversacion')
      .select(`
        *,
        whatsapp_ai(id, nombre_agente, numero_whatsapp, empresa_id, empresa_nombre),
        user_conversacion(id, telefono, nombre, callbell_contact_uuid)
      `)
      .order('ultimo_mensaje_at', { ascending: false })
      .limit(100),
    supabase.from('whatsapp_ai').select('id, nombre_agente, numero_whatsapp').order('nombre_agente'),
  ])

  return (
    <WaConversationsClient
      conversations={(convsRes.data || []) as ConversacionWithDetails[]}
      agents={(agentsRes.data || []) as WhatsappAI[]}
    />
  )
}
