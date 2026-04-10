/**
 * Azure OpenAI Assistants API client
 * Used for creating/editing WhatsApp AI assistants
 */

const AZURE_OPENAI_API_KEY = process.env.AZURE_OPENAI_API_KEY!
const AZURE_OPENAI_ENDPOINT = process.env.AZURE_OPENAI_ENDPOINT!
const AZURE_OPENAI_API_VERSION = process.env.AZURE_OPENAI_API_VERSION || '2024-05-01-preview'

function getBaseUrl() {
  return `${AZURE_OPENAI_ENDPOINT}/openai`
}

function headers() {
  return {
    'api-key': AZURE_OPENAI_API_KEY,
    'Content-Type': 'application/json',
  }
}

function queryParam() {
  return `api-version=${AZURE_OPENAI_API_VERSION}`
}

// ─── Assistants ──────────────────────────────────────────

export interface AssistantConfig {
  name: string
  instructions: string
  model?: string
}

export async function createAssistant(
  config: AssistantConfig
): Promise<{ id: string; name: string }> {
  const resp = await fetch(
    `${getBaseUrl()}/assistants?${queryParam()}`,
    {
      method: 'POST',
      headers: headers(),
      body: JSON.stringify({
        name: config.name,
        instructions: config.instructions,
        model: config.model || 'gpt-4o',
        tools: [],
      }),
    }
  )

  if (!resp.ok) {
    const err = await resp.text()
    throw new Error(`Azure OpenAI create assistant error: ${resp.status} ${err}`)
  }

  return resp.json()
}

export async function updateAssistant(
  assistantId: string,
  config: Partial<AssistantConfig>
): Promise<void> {
  const resp = await fetch(
    `${getBaseUrl()}/assistants/${assistantId}?${queryParam()}`,
    {
      method: 'POST', // Azure uses POST for updates
      headers: headers(),
      body: JSON.stringify({
        ...(config.name ? { name: config.name } : {}),
        ...(config.instructions ? { instructions: config.instructions } : {}),
      }),
    }
  )

  if (!resp.ok) {
    const err = await resp.text()
    throw new Error(`Azure OpenAI update assistant error: ${resp.status} ${err}`)
  }
}

export async function getAssistant(assistantId: string) {
  const resp = await fetch(
    `${getBaseUrl()}/assistants/${assistantId}?${queryParam()}`,
    { headers: { 'api-key': AZURE_OPENAI_API_KEY } }
  )

  if (!resp.ok) throw new Error(`Azure OpenAI get assistant error: ${resp.status}`)
  return resp.json()
}

// ─── Files ───────────────────────────────────────────────

export async function uploadFile(
  fileBlob: Blob,
  fileName: string
): Promise<{ id: string }> {
  const form = new FormData()
  form.append('file', fileBlob, fileName)
  form.append('purpose', 'assistants')

  const resp = await fetch(
    `${getBaseUrl()}/files?${queryParam()}`,
    {
      method: 'POST',
      headers: { 'api-key': AZURE_OPENAI_API_KEY },
      body: form,
    }
  )

  if (!resp.ok) {
    const err = await resp.text()
    throw new Error(`Azure OpenAI upload file error: ${resp.status} ${err}`)
  }

  return resp.json()
}

export async function attachFileToAssistant(
  assistantId: string,
  fileId: string
): Promise<void> {
  const resp = await fetch(
    `${getBaseUrl()}/assistants/${assistantId}/files?${queryParam()}`,
    {
      method: 'POST',
      headers: headers(),
      body: JSON.stringify({ file_id: fileId }),
    }
  )

  if (!resp.ok) {
    const err = await resp.text()
    throw new Error(`Azure OpenAI attach file error: ${resp.status} ${err}`)
  }
}
