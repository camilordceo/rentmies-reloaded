import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'

export async function GET() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { data: profile } = await supabase.from('profiles').select('empresa_id').eq('id', user.id).single()
  const db = createAdminClient()
  const { data } = await db.from('agentes_ia').select('*').eq('empresa_id', profile?.empresa_id || '').order('created_at')
  return NextResponse.json({ data })
}

export async function POST(req: NextRequest) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { data: profile } = await supabase.from('profiles').select('empresa_id').eq('id', user.id).single()
  if (!profile?.empresa_id) return NextResponse.json({ error: 'No empresa' }, { status: 400 })

  const body = await req.json()
  const { nombre, canal, instrucciones, assistant_id, channel_uuid_callbell, numero_whatsapp, elevenlabs_agent_id, elevenlabs_voice_id } = body
  if (!nombre || !canal) return NextResponse.json({ error: 'nombre y canal requeridos' }, { status: 400 })

  const db = createAdminClient()
  const { data, error } = await db.from('agentes_ia').insert({
    nombre, canal, instrucciones,
    assistant_id: assistant_id || null,
    channel_uuid_callbell: channel_uuid_callbell || null,
    numero_whatsapp: numero_whatsapp || null,
    elevenlabs_agent_id: elevenlabs_agent_id || null,
    elevenlabs_voice_id: elevenlabs_voice_id || null,
    empresa_id: profile.empresa_id,
    activo: true,
    archivos_inventario: [],
    estadisticas: { mensajes_enviados: 0, llamadas_realizadas: 0 },
  }).select().single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ data }, { status: 201 })
}
