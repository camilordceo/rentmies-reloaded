import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

function getDB() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )
}

// GET /api/conversations — list WhatsApp AI conversations with details
export async function GET(req: NextRequest) {
  const supabase = getDB()
  const { searchParams } = new URL(req.url)
  const agentId = searchParams.get('whatsapp_ai_id')
  const empresaId = searchParams.get('empresa_id')
  const limit = parseInt(searchParams.get('limit') || '50')
  const offset = parseInt(searchParams.get('offset') || '0')

  let query = supabase
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
