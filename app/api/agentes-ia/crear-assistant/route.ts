import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createAssistant } from '@/lib/api/azure-openai'

export async function POST(req: NextRequest) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { nombre, instrucciones } = await req.json()
  if (!nombre || !instrucciones) return NextResponse.json({ error: 'nombre e instrucciones requeridos' }, { status: 400 })

  try {
    const assistant = await createAssistant({ name: nombre, instructions: instrucciones })
    return NextResponse.json({ assistant_id: assistant.id })
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}
