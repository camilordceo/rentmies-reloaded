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

export async function GET(request: NextRequest) {
  const auth = await requireAdmin()
  if (auth.error) return auth.error

  const { searchParams } = new URL(request.url)
  const level = searchParams.get('level')
  const source = searchParams.get('source')
  const limit = parseInt(searchParams.get('limit') ?? '100')
  const offset = parseInt(searchParams.get('offset') ?? '0')

  let query = auth.db
    .from('admin_logs')
    .select('*')
    .order('created_at', { ascending: false })
    .range(offset, offset + limit - 1)

  if (level && level !== 'all') query = query.eq('level', level)
  if (source) query = query.ilike('source', `%${source}%`)

  const { data, error } = await query

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ data })
}

export async function POST(request: NextRequest) {
  const auth = await requireAdmin()
  if (auth.error) return auth.error

  try {
    const body = await request.json()
    const { level, source, message, context } = body

    if (!level || !source || !message) {
      return NextResponse.json({ error: 'level, source, message son requeridos' }, { status: 400 })
    }

    if (!['info', 'warn', 'error', 'debug'].includes(level)) {
      return NextResponse.json({ error: 'level inválido' }, { status: 400 })
    }

    const { data, error } = await auth.db
      .from('admin_logs')
      .insert({ level, source, message, context: context ?? null })
      .select()
      .single()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ data }, { status: 201 })
  } catch {
    return NextResponse.json({ error: 'Request inválido' }, { status: 400 })
  }
}
