import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'

export async function GET() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { data: profile } = await supabase.from('profiles').select('empresa_id').eq('id', user.id).single()
  const db = createAdminClient()
  const { data } = await db.from('etiquetas').select('*').eq('empresa_id', profile?.empresa_id || '').order('nombre')
  return NextResponse.json({ data })
}

export async function POST(req: NextRequest) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { data: profile } = await supabase.from('profiles').select('empresa_id').eq('id', user.id).single()
  if (!profile?.empresa_id) return NextResponse.json({ error: 'No empresa' }, { status: 400 })

  const { nombre, color } = await req.json()
  if (!nombre) return NextResponse.json({ error: 'nombre requerido' }, { status: 400 })

  const db = createAdminClient()
  const { data, error } = await db.from('etiquetas').insert({ nombre, color: color || '#40d99d', empresa_id: profile.empresa_id }).select().single()
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ data }, { status: 201 })
}

export async function DELETE(req: NextRequest) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { id } = await req.json()
  const db = createAdminClient()
  const { error } = await db.from('etiquetas').delete().eq('id', id)
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ success: true })
}
