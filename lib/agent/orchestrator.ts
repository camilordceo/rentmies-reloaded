import { callResponsesAPI } from '../responses'
import { executeToolCall } from './tool-executor'
import { TOOL_DEFINITIONS } from './tool-definitions'
import { createAdminClient } from '../supabase/admin'
import { logger } from '../logger'
import type { Conversacion, WhatsappAI } from '../types'

const MAX_ITERATIONS = 5

export async function processMessage(params: {
  conversacion: Conversacion
  whatsappAI: WhatsappAI
  userMessage: string
}): Promise<string> {
  const { conversacion, whatsappAI, userMessage } = params
  const db = createAdminClient()

  // First call — send user message with tools + threading
  let apiResponse = await callResponsesAPI({
    assistant_id: whatsappAI.assistant_id,
    content: userMessage,
    previous_response_id: conversacion.last_response_id ?? null,
    tools: TOOL_DEFINITIONS,
  })

  let iterations = 0

  // Agent loop — execute tools until we get a final text response
  while (apiResponse.status === 'requires_action' && iterations < MAX_ITERATIONS) {
    iterations++

    logger.info('orchestrator', 'Agent requesting tools', {
      conversacion_id: conversacion.id,
      empresa_id: whatsappAI.empresa_id,
      context: {
        iteration: iterations,
        tools: apiResponse.output?.map((t) => t.name),
      },
    } as any)

    // Execute all tool calls in parallel
    const toolResults = await Promise.all(
      (apiResponse.output ?? []).map(async (toolCall) => {
        let result: unknown
        try {
          const args = JSON.parse(toolCall.arguments) as Record<string, unknown>
          result = await executeToolCall(toolCall.name, args, whatsappAI.empresa_id)
        } catch (err) {
          result = { error: err instanceof Error ? err.message : String(err) }
        }
        return {
          tool_call_id: toolCall.id,
          output: JSON.stringify(result),
        }
      })
    )

    // Send tool results back to the agent
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

  // Persist the response ID for next-turn threading
  await db
    .from('conversacion')
    .update({
      last_response_id: apiResponse.next_previous_response_id,
      ultimo_mensaje_at: new Date().toISOString(),
    })
    .eq('id', conversacion.id)

  return apiResponse.output_text
}
