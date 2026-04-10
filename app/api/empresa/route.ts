import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'

export async function GET() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { data: profile } = await supabase.from('profiles').select('empresa_id').eq('id', user.id).single()
  if (!profile?.empresa_id) return NextResponse.json({ error: 'No empresa' }, { status: 404 })

  const db = createAdminClient()
  const { data } = await db.from('empresas').select('*').eq('id', profile.empresa_id).single()
  return NextResponse.json({ data })
}

export async function PATCH(req: NextRequest) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { data: profile } = await supabase.from('profiles').select('empresa_id').eq('id', user.id).single()
  if (!profile?.empresa_id) return NextResponse.json({ error: 'No empresa' }, { status: 404 })

  const body = await req.json()
  const allowed = ['nombre', 'nit', 'telefono', 'email', 'website', 'logo_url', 'configuracion']
  const update: Record<string, unknown> = {}
  for (const key of allowed) {
    if (key in body) update[key] = body[key]
  }

  const db = createAdminClient()
  const { data, error } = await db.from('empresas').update(update).eq('id', profile.empresa_id).select().single()
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ data })
}
