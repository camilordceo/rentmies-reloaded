import { callResponsesAPI } from '../responses'
import { executeToolCall } from './tool-executor'
import { TOOL_DEFINITIONS } from './tool-definitions'
import { createAdminClient } from '../supabase/admin'
import { logger } from '../logger'
import type { Conversacion, AgenteIA } from '../types'

const MAX_ITERATIONS = 5

export interface AgentToolCall {
  name: string
  args: Record<string, unknown>
}

export interface AgentResult {
  text: string
  properties: any[]
  responseId: string
  toolCalls: AgentToolCall[]
}

export async function processMessage(params: {
  conversacion: Conversacion
  whatsappAI: AgenteIA
  userMessage: string
}): Promise<AgentResult> {
  const { conversacion, whatsappAI, userMessage } = params
  if (!whatsappAI.assistant_id) {
    throw new Error(`Agent ${whatsappAI.id} has no assistant_id configured`)
  }
  const db = createAdminClient()
  const collectedProperties: any[] = []
  const collectedToolCalls: AgentToolCall[] = []

  let apiResponse = await callResponsesAPI({
    assistant_id: whatsappAI.assistant_id,
    content: userMessage,
    previous_response_id: conversacion.last_response_id ?? null,
    tools: TOOL_DEFINITIONS,
  })

  let iterations = 0

  while (apiResponse.status === 'requires_action' && iterations < MAX_ITERATIONS) {
    iterations++

    logger.info('orchestrator', 'Agent requesting tools', {
      conversacion_id: conversacion.id,
      empresa_id: whatsappAI.empresa_id,
      context: { iteration: iterations, tools: apiResponse.output?.map((t) => t.name) },
    })

    const toolResults = await Promise.all(
      (apiResponse.output ?? []).map(async (toolCall) => {
        let result: unknown
        try {
          const args = JSON.parse(toolCall.arguments) as Record<string, unknown>
          collectedToolCalls.push({ name: toolCall.name, args })
          result = await executeToolCall(toolCall.name, args, whatsappAI.empresa_id)
          // Collect property results for portal frontend
          if (toolCall.name === 'buscar_propiedades' && Array.isArray(result)) {
            collectedProperties.push(...result)
          }
          if (toolCall.name === 'obtener_detalle_propiedad' && result && typeof result === 'object' && !('error' in result)) {
            collectedProperties.push(result)
          }
        } catch (err) {
          result = { error: err instanceof Error ? err.message : String(err) }
        }
        return { tool_call_id: toolCall.id, output: JSON.stringify(result) }
      })
    )

    apiResponse = await callResponsesAPI({
      assistant_id: whatsappAI.assistant_id,
      content: '',
      previous_response_id: apiResponse.next_previous_response_id,
      tools: TOOL_DEFINITIONS,
      tool_results: toolResults,
    })
  }

  if (apiResponse.status !== 'completed' || !apiResponse.output_text) {
    throw new Error(`Agent did not complete after ${iterations} iterations. Status: ${apiResponse.status}`)
  }

  await db
    .from('conversacion')
    .update({
      last_response_id: apiResponse.next_previous_response_id,
      ultimo_mensaje_at: new Date().toISOString(),
    })
    .eq('id', conversacion.id)

  return {
    text: apiResponse.output_text,
    properties: collectedProperties,
    responseId: apiResponse.next_previous_response_id,
    toolCalls: collectedToolCalls,
  }
}
