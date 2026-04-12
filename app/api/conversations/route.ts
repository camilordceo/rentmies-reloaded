import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'

async function requireAdmin() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: NextResponse.json({ error: 'Unauthorized' }, { status: 401 }) }

  const db = createAdminClient()
  const { data: profile } = await db.from('profiles').select('rol').eq('id', user.id).single()
  if (profile?.rol !== 'admin') return { error: NextResponse.json({ error: 'Forbidden' }, { status: 403 }) }

  return { db }
}

// GET /api/conversations — list WhatsApp AI conversations with details
export async function GET(req: NextRequest) {
  const auth = await requireAdmin()
  if (auth.error) return auth.error

  const { searchParams } = new URL(req.url)
  const agentId = searchParams.get('whatsapp_ai_id')
  const empresaId = searchParams.get('empresa_id')
  const limit = parseInt(searchParams.get('limit') || '50')
  const offset = parseInt(searchParams.get('offset') || '0')

  let query = auth.db
    .from('conversacion')
    .select(`
      *,
      whatsapp_ai(id, nombre_agente, numero_whatsapp, empresa_id, empresa_nombre),
      user_conversacion(id, telefono, nombre, callbell_contact_uuid)
    `)
    .order('ultimo_mensaje_at', { ascending: false })
    .range(offset, offset + limit - 1)

  if (agentId) query = query.eq('whatsapp_ai_id', agentId)
  if (empresaId) query = query.eq('whatsapp_ai.empresa_id', empresaId)

  const { data, error, count } = await query

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ data, count })
}
