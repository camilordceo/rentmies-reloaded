'use client'

import { useCallback, useEffect, useRef } from 'react'
import { usePortalAgent } from '@/store/portal-agent-store'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AnySpeechRecognition = any

function getSpeechRecognition(): AnySpeechRecognition | null {
  if (typeof window === 'undefined') return null
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const w = window as any
  return w.SpeechRecognition ?? w.webkitSpeechRecognition ?? null
}

export function useVoice(onTranscript: (text: string) => void) {
  const { voiceState, setVoiceState, setTranscript } = usePortalAgent()
  const recognitionRef = useRef<AnySpeechRecognition>(null)
  const finalTranscriptRef = useRef('')
  const isSupported = typeof window !== 'undefined' && !!getSpeechRecognition()

  const startListening = useCallback(() => {
    const SpeechRecognitionAPI = getSpeechRecognition()
    if (!SpeechRecognitionAPI || voiceState !== 'idle') return

    // eslint-disable-next-line @typescript-eslint/no-unsafe-call
    const recognition = new SpeechRecognitionAPI()
    recognition.lang = 'es-CO'
    recognition.interimResults = true
    recognition.maxAlternatives = 1
    recognition.continuous = false
    finalTranscriptRef.current = ''

    recognition.onstart = () => {
      setVoiceState('listening')
      setTranscript('')
    }

    recognition.onresult = (event: { results: ArrayLike<{ 0: { transcript: string }; isFinal: boolean }> }) => {
      let interim = ''
      let final = ''
      for (let i = 0; i < event.results.length; i++) {
        const r = event.results[i]
        if (r.isFinal) final += r[0].transcript
        else interim += r[0].transcript
      }
      if (final) finalTranscriptRef.current = final
      setTranscript(final || interim)
    }

    recognition.onend = () => {
      setVoiceState('processing')
      const text = finalTranscriptRef.current.trim()
      if (text) {
        onTranscript(text)
      } else {
        setVoiceState('idle')
      }
      setTranscript('')
      finalTranscriptRef.current = ''
    }

    recognition.onerror = () => {
      setVoiceState('idle')
      setTranscript('')
      finalTranscriptRef.current = ''
    }

    recognitionRef.current = recognition
    recognition.start()
  }, [voiceState, setVoiceState, setTranscript, onTranscript])

  const stopListening = useCallback(() => {
    recognitionRef.current?.stop()
  }, [])

  useEffect(() => {
    return () => {
      recognitionRef.current?.abort()
    }
  }, [])

  return { voiceState, isSupported, startListening, stopListening }
}
