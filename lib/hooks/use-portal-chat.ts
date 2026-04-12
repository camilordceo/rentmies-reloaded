'use client'

import { useCallback } from 'react'
import { usePortalAgent } from '@/store/portal-agent-store'
import type { AgentMessage, PropertyItem } from '@/store/portal-agent-store'

export function usePortalChat(empresaId: string | null) {
  const {
    messages,
    isProcessing,
    sessionId,
    responseId,
    addMessage,
    setProcessing,
    setDisplayedProperties,
    setResponseId,
    focusProperty,
  } = usePortalAgent()

  const sendMessage = useCallback(
    async (text: string) => {
      const userMsg: AgentMessage = {
        id: crypto.randomUUID(),
        role: 'user',
        text,
        timestamp: new Date(),
      }
      addMessage(userMsg)
      setProcessing(true)

      try {
        const res = await fetch('/api/chat', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            ...(empresaId ? { empresa_id: empresaId } : {}),
            message: text,
            session_id: sessionId,
            previous_response_id: responseId,
          }),
        })

        const data = await res.json() as {
          text?: string
          error?: string
          properties?: PropertyItem[]
          response_id?: string
        }

        if (data.response_id) setResponseId(data.response_id)

        const props: PropertyItem[] = data.properties ?? []

        const assistantMsg: AgentMessage = {
          id: crypto.randomUUID(),
          role: 'assistant',
          text: data.text ?? data.error ?? 'No pude procesar tu solicitud.',
          properties: props,
          timestamp: new Date(),
        }
        addMessage(assistantMsg)

        // Push properties to canvas
        if (props.length > 0) {
          setDisplayedProperties(props)
          // If AI returned exactly one property, auto-focus it
          if (props.length === 1) {
            focusProperty(props[0])
          }
        }
      } catch {
        addMessage({
          id: crypto.randomUUID(),
          role: 'assistant',
          text: 'Disculpa, ocurrió un error. Intenta de nuevo.',
          timestamp: new Date(),
        })
      } finally {
        setProcessing(false)
      }
    },
    [empresaId, sessionId, responseId, addMessage, setProcessing, setDisplayedProperties, setResponseId, focusProperty]
  )

  return { messages, isProcessing, sendMessage }
}
