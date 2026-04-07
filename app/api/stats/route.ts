import { createServerClient } from '@supabase/ssr'
import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'

export async function GET() {
  const cookieStore = cookies()
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
      cookies: {
        getAll: () => cookieStore.getAll(),
        setAll: () => {},
      },
    }
  )

  const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()
  const todayStart = new Date()
  todayStart.setHours(0, 0, 0, 0)

  const [users, empresas, convs, errors] = await Promise.all([
    supabase.from('profiles').select('id', { count: 'exact', head: true }),
    supabase.from('empresas').select('id', { count: 'exact', head: true }).eq('activo', true),
    supabase.from('conversations').select('id', { count: 'exact', head: true }).gte('created_at', todayStart.toISOString()),
    supabase.from('admin_logs').select('id', { count: 'exact', head: true }).eq('level', 'error').gte('created_at', yesterday),
  ])

  return NextResponse.json({
    totalUsers: users.count ?? 0,
    activeEmpresas: empresas.count ?? 0,
    conversationsToday: convs.count ?? 0,
    errors24h: errors.count ?? 0,
  })
}
