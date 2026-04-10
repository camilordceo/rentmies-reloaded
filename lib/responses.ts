import type { ResponsesAPIRequest, ResponsesAPIResponse } from './types'

const RESPONSES_URL =
  process.env.RENTMIES_RESPONSES_URL ||
  'https://rentmiesresponses.azurewebsites.net/api/rentmies/responses'

export async function callResponsesAPI(req: ResponsesAPIRequest): Promise<ResponsesAPIResponse> {
  const response = await fetch(RESPONSES_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(req),
  })

  if (!response.ok) {
    const text = await response.text()
    throw new Error(`Responses API ${response.status}: ${text}`)
  }

  return response.json()
}

export function buildHistoryContent(
  history: Array<{ rol: 'user' | 'assistant'; texto: string }>,
  newUserMessage: string
): string {
  const lines: string[] = []
  if (history.length > 0) {
    lines.push('HISTORIAL DE CONVERSACIÓN:')
    for (const msg of history) {
      lines.push(`${msg.rol === 'user' ? 'Usuario' : 'Asistente'}: ${msg.texto}`)
    }
    lines.push('')
  }
  lines.push('NUEVO MENSAJE:')
  lines.push(`Usuario: ${newUserMessage}`)
  return lines.join('\n')
}
