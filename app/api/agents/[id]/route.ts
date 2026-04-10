import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

function getDB() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )
}

// GET /api/agents/[id]
export async function GET(_req: NextRequest, { params }: { params: { id: string } }) {
  const supabase = getDB()
  const { data, error } = await supabase
    .from('whatsapp_ai')
    .select('*, empresas(nombre, plan)')
    .eq('id', params.id)
    .single()

  if (error || !data) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 })
  }

  return NextResponse.json({ data })
}

// PATCH /api/agents/[id]
export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const supabase = getDB()
  let body: Record<string, unknown>
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  // Normalize phone if present
  if (body.numero_whatsapp) {
    body.numero_whatsapp = (body.numero_whatsapp as string).replace(/[^\d]/g, '')
  }

  const { data, error } = await supabase
    .from('whatsapp_ai')
    .update(body)
    .eq('id', params.id)
    .select()
    .single()

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ data })
}

// DELETE /api/agents/[id]
export async function DELETE(_req: NextRequest, { params }: { params: { id: string } }) {
  const supabase = getDB()
  const { error } = await supabase.from('whatsapp_ai').delete().eq('id', params.id)

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ success: true })
}
