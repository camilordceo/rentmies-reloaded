import { NextRequest, NextResponse } from 'next/server'

const ELEVENLABS_API_KEY = process.env.ELEVENLABS_API_KEY
// Default: Mateo — ElevenLabs Spanish male voice (change via env)
const VOICE_ID = process.env.ELEVENLABS_VOICE_ID || 'VR6AewLTigWG4xSOukaG'
const MODEL_ID = 'eleven_multilingual_v2'

export async function POST(req: NextRequest) {
  if (!ELEVENLABS_API_KEY) {
    return NextResponse.json({ error: 'ElevenLabs not configured' }, { status: 503 })
  }

  const { text } = await req.json()
  if (!text?.trim()) return NextResponse.json({ error: 'text requerido' }, { status: 400 })

  // Truncate to ~500 chars so responses stay snappy
  const clean = text.replace(/\[.*?\]/g, '').trim().slice(0, 500)

  const res = await fetch(
    `https://api.elevenlabs.io/v1/text-to-speech/${VOICE_ID}/stream`,
    {
      method: 'POST',
      headers: {
        'xi-api-key': ELEVENLABS_API_KEY,
        'Content-Type': 'application/json',
        Accept: 'audio/mpeg',
      },
      body: JSON.stringify({
        text: clean,
        model_id: MODEL_ID,
        voice_settings: { stability: 0.45, similarity_boost: 0.8, style: 0.2 },
      }),
    }
  )

  if (!res.ok) {
    const err = await res.text()
    return NextResponse.json({ error: `ElevenLabs ${res.status}: ${err}` }, { status: 502 })
  }

  // Stream audio directly back to client
  return new NextResponse(res.body, {
    headers: {
      'Content-Type': 'audio/mpeg',
      'Cache-Control': 'no-store',
    },
  })
}
