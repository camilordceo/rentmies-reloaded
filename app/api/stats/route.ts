import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'

export async function GET() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const db = createAdminClient()
  const { data: profile } = await db.from('profiles').select('rol').eq('id', user.id).single()
  if (profile?.rol !== 'admin') return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()
  const todayStart = new Date()
  todayStart.setHours(0, 0, 0, 0)

  const [users, empresas, convs, errors] = await Promise.all([
    db.from('profiles').select('id', { count: 'exact', head: true }),
    db.from('empresas').select('id', { count: 'exact', head: true }).eq('activo', true),
    db.from('conversations').select('id', { count: 'exact', head: true }).gte('created_at', todayStart.toISOString()),
    db.from('admin_logs').select('id', { count: 'exact', head: true }).eq('level', 'error').gte('created_at', yesterday),
  ])

  return NextResponse.json({
    totalUsers: users.count ?? 0,
    activeEmpresas: empresas.count ?? 0,
    conversationsToday: convs.count ?? 0,
    errors24h: errors.count ?? 0,
  })
}
