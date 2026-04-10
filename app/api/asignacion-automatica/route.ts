import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'

export async function GET() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { data: profile } = await supabase.from('profiles').select('empresa_id').eq('id', user.id).single()
  const db = createAdminClient()
  const { data } = await db.from('asignacion_automatica').select('*').eq('empresa_id', profile?.empresa_id || '').single()
  return NextResponse.json({ data })
}

export async function POST(req: NextRequest) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { data: profile } = await supabase.from('profiles').select('empresa_id').eq('id', user.id).single()
  if (!profile?.empresa_id) return NextResponse.json({ error: 'No empresa' }, { status: 400 })

  const { metodo, activo, configuracion } = await req.json()

  const db = createAdminClient()
  const { data, error } = await db.from('asignacion_automatica').upsert({
    empresa_id: profile.empresa_id,
    metodo: metodo || 'por_dia',
    activo: activo ?? true,
    configuracion: configuracion || {},
  }, { onConflict: 'empresa_id' }).select().single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ data })
}
