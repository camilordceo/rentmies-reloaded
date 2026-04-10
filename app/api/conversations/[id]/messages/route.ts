import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

function getDB() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )
}

// GET /api/conversations/[id]/messages
export async function GET(_req: NextRequest, { params }: { params: { id: string } }) {
  const supabase = getDB()

  const { data, error } = await supabase
    .from('mensaje')
    .select('*')
    .eq('conversacion_id', params.id)
    .order('created_at', { ascending: true })

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ data })
}
