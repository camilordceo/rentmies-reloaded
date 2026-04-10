/**
 * ElevenLabs Conversational AI API client
 * Docs: https://elevenlabs.io/docs/conversational-ai
 */

const ELEVENLABS_API_KEY = process.env.ELEVENLABS_API_KEY!
const BASE_URL = 'https://api.elevenlabs.io/v1'

function headers() {
  return {
    'xi-api-key': ELEVENLABS_API_KEY,
    'Content-Type': 'application/json',
  }
}

// ─── Voice Cloning ───────────────────────────────────────

export async function cloneVoice(params: {
  name: string
  audioUrl: string
  description?: string
}): Promise<{ voice_id: string }> {
  // ElevenLabs voice cloning requires a FormData with audio file
  // Since we store audio as URL, we fetch and re-upload
  const audioResp = await fetch(params.audioUrl)
  const audioBlob = await audioResp.blob()

  const form = new FormData()
  form.append('name', params.name)
  form.append('files', audioBlob, 'voice_sample.mp3')
  if (params.description) form.append('description', params.description)

  const resp = await fetch(`${BASE_URL}/voices/add`, {
    method: 'POST',
    headers: { 'xi-api-key': ELEVENLABS_API_KEY },
    body: form,
  })

  if (!resp.ok) {
    const err = await resp.text()
    throw new Error(`ElevenLabs clone voice error: ${resp.status} ${err}`)
  }

  return resp.json()
}

// ─── Conversational AI Agents ────────────────────────────

export interface ElevenLabsAgentConfig {
  name: string
  voice_id: string
  first_message?: string
  system_prompt: string
}

export async function createConversationalAgent(
  config: ElevenLabsAgentConfig
): Promise<{ agent_id: string }> {
  const resp = await fetch(`${BASE_URL}/convai/agents/create`, {
    method: 'POST',
    headers: headers(),
    body: JSON.stringify({
      name: config.name,
      conversation_config: {
        agent: {
          prompt: {
            prompt: config.system_prompt,
          },
          first_message: config.first_message || `Hola, soy ${config.name}. ¿En qué puedo ayudarte?`,
          language: 'es',
        },
        tts: {
          voice_id: config.voice_id,
        },
      },
    }),
  })

  if (!resp.ok) {
    const err = await resp.text()
    throw new Error(`ElevenLabs create agent error: ${resp.status} ${err}`)
  }

  return resp.json()
}

export async function updateConversationalAgent(
  agentId: string,
  config: Partial<ElevenLabsAgentConfig>
): Promise<void> {
  const body: Record<string, unknown> = {}

  if (config.name) body.name = config.name
  if (config.system_prompt || config.voice_id || config.first_message) {
    const conversation_config: Record<string, unknown> = {}
    if (config.system_prompt) {
      conversation_config.agent = {
        prompt: { prompt: config.system_prompt },
        ...(config.first_message ? { first_message: config.first_message } : {}),
      }
    }
    if (config.voice_id) {
      conversation_config.tts = { voice_id: config.voice_id }
    }
    body.conversation_config = conversation_config
  }

  const resp = await fetch(`${BASE_URL}/convai/agents/${agentId}`, {
    method: 'PATCH',
    headers: headers(),
    body: JSON.stringify(body),
  })

  if (!resp.ok) {
    const err = await resp.text()
    throw new Error(`ElevenLabs update agent error: ${resp.status} ${err}`)
  }
}

export async function getConversationalAgent(agentId: string) {
  const resp = await fetch(`${BASE_URL}/convai/agents/${agentId}`, {
    headers: { 'xi-api-key': ELEVENLABS_API_KEY },
  })
  if (!resp.ok) throw new Error(`ElevenLabs get agent error: ${resp.status}`)
  return resp.json()
}
