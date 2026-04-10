import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { cloneVoice, createConversationalAgent } from '@/lib/api/elevenlabs'
import { createAdminClient } from '@/lib/supabase/admin'

export async function POST(req: NextRequest) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const formData = await req.formData()
  const audio = formData.get('audio') as File | null
  const nombre = formData.get('nombre') as string
  const instrucciones = formData.get('instrucciones') as string

  if (!audio || !nombre) return NextResponse.json({ error: 'audio y nombre requeridos' }, { status: 400 })

  try {
    // Upload audio to Supabase Storage first, then clone
    const db = createAdminClient()
    const ext = audio.name.split('.').pop() || 'mp3'
    const path = `voice-samples/${user.id}/${Date.now()}.${ext}`
    const arrayBuffer = await audio.arrayBuffer()

    const { data: storageData, error: storageError } = await db.storage
      .from('rentmies-assets')
      .upload(path, arrayBuffer, { contentType: audio.type, upsert: false })

    if (storageError) throw new Error(`Storage upload failed: ${storageError.message}`)

    const { data: { publicUrl } } = db.storage.from('rentmies-assets').getPublicUrl(path)

    // Clone voice
    const { voice_id } = await cloneVoice({ name: nombre, audioUrl: publicUrl })

    // Create conversational agent
    const { agent_id } = await createConversationalAgent({
      name: nombre,
      voice_id,
      system_prompt: instrucciones || `Eres ${nombre}, agente inmobiliario de Rentmies. Ayuda a los clientes a encontrar su inmueble ideal en Colombia.`,
    })

    return NextResponse.json({ voice_id, agent_id, voice_sample_url: publicUrl })
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}
