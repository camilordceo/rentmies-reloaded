import { createServerClient } from '@supabase/ssr'
import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'

function createService() {
  const cookieStore = cookies()
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
      cookies: {
        getAll: () => cookieStore.getAll(),
        setAll: () => {},
      },
    }
  )
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const level = searchParams.get('level')
  const source = searchParams.get('source')
  const limit = parseInt(searchParams.get('limit') ?? '100')
  const offset = parseInt(searchParams.get('offset') ?? '0')

  const supabase = createService()
  let query = supabase
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
  try {
    const body = await request.json()
    const { level, source, message, context } = body

    if (!level || !source || !message) {
      return NextResponse.json({ error: 'level, source, message son requeridos' }, { status: 400 })
    }

    if (!['info', 'warn', 'error', 'debug'].includes(level)) {
      return NextResponse.json({ error: 'level inválido' }, { status: 400 })
    }

    const supabase = createService()
    const { data, error } = await supabase
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
