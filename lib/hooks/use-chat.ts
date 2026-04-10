'use client'

import { useState, useCallback, useRef } from 'react'

export interface ChatMessage {
  id: string
  role: 'user' | 'assistant'
  text: string
  properties?: any[]
  timestamp: Date
}

export function useChat(empresaId: string) {
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const sessionId = useRef<string>(crypto.randomUUID())
  const responseId = useRef<string | null>(null)

  const sendMessage = useCallback(async (text: string) => {
    const userMsg: ChatMessage = {
      id: crypto.randomUUID(),
      role: 'user',
      text,
      timestamp: new Date(),
    }
    setMessages((prev) => [...prev, userMsg])
    setIsLoading(true)

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          empresa_id: empresaId,
          message: text,
          session_id: sessionId.current,
          previous_response_id: responseId.current,
        }),
      })

      const data = await res.json()

      if (data.response_id) responseId.current = data.response_id

      const assistantMsg: ChatMessage = {
        id: crypto.randomUUID(),
        role: 'assistant',
        text: data.text ?? data.error ?? 'No pude procesar tu solicitud.',
        properties: data.properties ?? [],
        timestamp: new Date(),
      }
      setMessages((prev) => [...prev, assistantMsg])
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          id: crypto.randomUUID(),
          role: 'assistant',
          text: 'Disculpa, ocurrió un error. Intenta de nuevo.',
          timestamp: new Date(),
        },
      ])
    } finally {
      setIsLoading(false)
    }
  }, [empresaId])

  return { messages, isLoading, sendMessage }
}
