import type { ResponsesAPIResponse } from './types'

const RESPONSES_URL =
  process.env.RENTMIES_RESPONSES_URL ||
  'https://rentmiesresponses.azurewebsites.net/api/rentmies/responses'

export function buildHistoryContent(
  history: Array<{ rol: 'user' | 'assistant'; texto: string }>,
  newUserMessage: string
): string {
  const lines: string[] = []

  if (history.length > 0) {
    lines.push('HISTORIAL DE CONVERSACIÓN:')
    for (const msg of history) {
      const label = msg.rol === 'user' ? 'Usuario' : 'Asistente'
      lines.push(`${label}: ${msg.texto}`)
    }
    lines.push('')
  }

  lines.push('NUEVO MENSAJE:')
  lines.push(`Usuario: ${newUserMessage}`)

  return lines.join('\n')
}

export async function getAIResponse(
  assistantId: string,
  content: string,
  previousResponseId?: string | null
): Promise<ResponsesAPIResponse> {
  const body: Record<string, string> = {
    assistant_id: assistantId,
    content,
  }

  if (previousResponseId) {
    body.previous_response_id = previousResponseId
  }

  const response = await fetch(RESPONSES_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })

  if (!response.ok) {
    const text = await response.text()
    throw new Error(`Responses API error ${response.status}: ${text}`)
  }

  return response.json()
}
