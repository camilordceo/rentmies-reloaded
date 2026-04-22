'use client'
import { useState, useRef, useEffect, useCallback } from 'react'
import { useShallow } from 'zustand/react/shallow'
import { useAtlasStore } from '@/store/atlas-store'
import { fmtCOP, computeMatchScore } from '@/store/atlas-store'
import type { AtlasChapter } from '@/store/atlas-store'
import { EmaSphere } from './ema-sphere'
import { Waveform } from './waveform'
import { EmaDictation } from './ema-dictation'

const CHAPTER_LINES: Record<number, string[]> = {
  0: ['EMA escuchando.', 'Elige intenciones, o escríbeme.', 'Con 3 intenciones compongo tu curaduría.'],
  1: ['Reordené las propiedades por ti.', 'Las mejores flotan al frente.', 'Toca cualquiera para entrar.'],
  2: ['Tour virtual activado.', 'Cada espacio tiene su propia luz.', '¿Agendamos una visita privada?'],
  3: ['Al cerrar, el dinero vuelve a ti.', '1% en venta, 10% en arriendo.', 'Sin letra chica. Sin coreografía financiera.'],
}

export function EmaPanelAtlas() {
  const {
    emaPanelOpen, toggleEmaPanel,
    emaListening, setEmaListening,
    emaMode, setEmaMode,
    activeChapter, activeIntents, properties,
    emaMessages, addEmaMessage,
    emaProcessing, setEmaProcessing,
    sessionId, responseId, setResponseId,
    openDrawer,
    setProperties, setChapter,
  } = useAtlasStore(
    useShallow((s) => ({
      emaPanelOpen: s.emaPanelOpen,
      toggleEmaPanel: s.toggleEmaPanel,
      emaListening: s.emaListening,
      setEmaListening: s.setEmaListening,
      emaMode: s.emaMode,
      setEmaMode: s.setEmaMode,
      activeChapter: s.activeChapter,
      activeIntents: s.activeIntents,
      properties: s.properties,
      emaMessages: s.emaMessages,
      addEmaMessage: s.addEmaMessage,
      emaProcessing: s.emaProcessing,
      setEmaProcessing: s.setEmaProcessing,
      sessionId: s.sessionId,
      responseId: s.responseId,
      setResponseId: s.setResponseId,
      openDrawer: s.openDrawer,
      setProperties: s.setProperties,
      setChapter: s.setChapter,
    }))
  )

  const [input, setInput] = useState('')
  const [voiceActive, setVoiceActive] = useState(false)
  const [speaking, setSpeaking] = useState(false)
  const [lastPropertyCount, setLastPropertyCount] = useState(0)
  const inputRef = useRef<HTMLInputElement>(null)
  const recognitionRef = useRef<any>(null)
  const audioRef = useRef<HTMLAudioElement | null>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  // Auto-scroll chat to latest message
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [emaMessages])

  const topMatches = [...properties]
    .map((p) => ({ ...p, match_score: computeMatchScore(p, activeIntents) }))
    .sort((a, b) => b.match_score - a.match_score)
    .slice(0, 3)

  // ─── ElevenLabs TTS ────────────────────────────────────────────────────────

  const speakText = useCallback(async (text: string) => {
    try {
      const res = await fetch('/api/ema/speak', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text }),
      })
      if (!res.ok) return // no key configured — silent fail
      const blob = await res.blob()
      const url = URL.createObjectURL(blob)
      const audio = new Audio(url)
      audioRef.current = audio
      setSpeaking(true)
      setEmaListening(true)
      audio.play()
      audio.onended = () => {
        setSpeaking(false)
        URL.revokeObjectURL(url)
      }
    } catch {
      // graceful — voice is enhancement, not core
    }
  }, [setEmaListening])

  // ─── Web Speech API voice input ────────────────────────────────────────────

  function startVoice() {
    const SR = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition
    if (!SR) {
      alert('Tu navegador no soporta reconocimiento de voz. Usa Chrome.')
      return
    }
    if (recognitionRef.current) {
      recognitionRef.current.stop()
      recognitionRef.current = null
      setVoiceActive(false)
      return
    }
    const recognition = new SR()
    recognition.lang = 'es-CO'
    recognition.continuous = false
    recognition.interimResults = true

    recognition.onresult = (e: any) => {
      const transcript = Array.from(e.results as any[])
        .map((r: any) => r[0].transcript)
        .join('')
      setInput(transcript)
      if (e.results[e.results.length - 1].isFinal) {
        sendMessage(transcript)
        setVoiceActive(false)
        recognitionRef.current = null
      }
    }

    recognition.onerror = () => { setVoiceActive(false); recognitionRef.current = null }
    recognition.onend = () => { setVoiceActive(false); recognitionRef.current = null }

    recognition.start()
    recognitionRef.current = recognition
    setVoiceActive(true)
  }

  // ─── Chat send ─────────────────────────────────────────────────────────────

  async function sendMessage(text: string) {
    if (!text.trim() || emaProcessing) return
    const userMsg = text.trim()
    setInput('')
    addEmaMessage({ role: 'user', text: userMsg })
    setEmaProcessing(true)
    setEmaMode('dialogo')

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: userMsg,
          session_id: sessionId,
          previous_response_id: responseId,
          intents: activeIntents,
        }),
      })
      const data = await res.json()
      addEmaMessage({ role: 'assistant', text: data.text })
      if (data.response_id) setResponseId(data.response_id)

      // Push AI-found properties into the atlas store and jump to curation
      if (Array.isArray(data.properties) && data.properties.length > 0) {
        setProperties(data.properties)
        setLastPropertyCount(data.properties.length)
        setChapter(1 as AtlasChapter)
        // Switch panel to Resumen so user sees the ranked property list
        setEmaMode('resumen')
        // Defer scroll one frame so the DOM state is settled
        requestAnimationFrame(() => {
          const rail = document.querySelector('.atlas-rail') as HTMLElement | null
          if (rail) rail.scrollTo({ left: window.innerWidth, behavior: 'smooth' })
        })
      }

      // Speak the reply via ElevenLabs
      speakText(data.text)
    } catch {
      addEmaMessage({ role: 'assistant', text: 'Hubo un error. Intenta de nuevo.' })
    } finally {
      setEmaProcessing(false)
    }
  }

  // ─── Collapsed: floating bubble ────────────────────────────────────────────

  if (!emaPanelOpen) {
    return (
      <button
        onClick={toggleEmaPanel}
        style={{
          position: 'fixed', right: 24, bottom: 100, zIndex: 85,
          width: 68, height: 68, borderRadius: '50%', border: 'none',
          cursor: 'pointer', padding: 0,
          background: 'rgba(28,27,27,0.94)',
          boxShadow: '0 12px 40px -6px rgba(28,27,27,0.1), 0 0 28px rgba(64,217,157,0.3)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          animation: 'rise-in .4s ease-out',
        }}
      >
        <EmaSphere size={44} />
        {(voiceActive || speaking) && (
          <span style={{
            position: 'absolute', top: 5, right: 5, width: 10, height: 10,
            borderRadius: '50%', background: '#4fffb4', boxShadow: '0 0 8px #4fffb4',
            animation: 'breathe 1.4s infinite',
          }} />
        )}
      </button>
    )
  }

  // ─── Expanded panel ────────────────────────────────────────────────────────

  return (
    <div style={{
      position: 'fixed', right: 24, top: 84, bottom: 24, zIndex: 85,
      width: 356, animation: 'rise-in .5s ease-out',
      display: 'flex', flexDirection: 'column', gap: 10,
    }}>

      {/* Header */}
      <div className="atlas-glass-dark" style={{ borderRadius: 22, padding: 18, color: '#fff' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <EmaSphere size={42} />
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 14, fontWeight: 700, letterSpacing: '-0.01em' }}>EMA</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <span style={{
                width: 6, height: 6, borderRadius: '50%',
                background: voiceActive ? '#ff6b6b' : speaking ? '#4fffb4' : 'rgba(255,255,255,0.3)',
                boxShadow: voiceActive ? '0 0 8px #ff6b6b' : speaking ? '0 0 8px #4fffb4' : 'none',
                animation: (voiceActive || speaking) ? 'breathe 1.6s infinite' : 'none',
              }} />
              <span className="atlas-mono atlas-eyebrow" style={{
                fontSize: 8,
                color: voiceActive ? '#ff9999' : speaking ? '#4fffb4' : 'rgba(255,255,255,0.5)',
              }}>
                {voiceActive ? 'Escuchando tu voz' : speaking ? 'EMA hablando' : 'En pausa'}
              </span>
            </div>
          </div>

          {/* Voice mic button */}
          <button
            onClick={startVoice}
            title={voiceActive ? 'Detener' : 'Hablar'}
            style={{
              border: 'none', cursor: 'pointer', width: 30, height: 30, borderRadius: '50%',
              background: voiceActive ? '#ff6b6b' : 'rgba(255,255,255,0.1)',
              color: '#fff', fontSize: 13, fontWeight: 700,
              boxShadow: voiceActive ? '0 0 12px rgba(255,107,107,0.6)' : 'none',
              transition: 'all .3s',
            }}
          >
            {voiceActive ? '◼' : '🎙'}
          </button>

          <button
            onClick={toggleEmaPanel}
            style={{
              border: 'none', cursor: 'pointer', width: 30, height: 30,
              borderRadius: '50%', background: 'rgba(255,255,255,0.08)', color: '#fff', fontSize: 16,
            }}
          >
            ×
          </button>
        </div>
      </div>

      {/* Body */}
      <div className="atlas-glass-dark" style={{
        borderRadius: 22, flex: 1, display: 'flex', flexDirection: 'column',
        overflow: 'hidden', color: '#fff',
      }}>
        {/* Tabs */}
        <div style={{ display: 'flex', padding: '12px 12px 0', gap: 6 }}>
          {([['resumen', 'Resumen en vivo'], ['dialogo', 'Diálogo']] as const).map(([id, label]) => (
            <button key={id} onClick={() => setEmaMode(id)} style={{
              flex: 1, padding: '7px 10px', borderRadius: 10, border: 'none', cursor: 'pointer',
              background: emaMode === id ? 'rgba(64,217,157,0.18)' : 'transparent',
              color: emaMode === id ? '#4fffb4' : 'rgba(255,255,255,0.5)',
              fontSize: 10, fontWeight: 600, letterSpacing: '0.04em', textTransform: 'uppercase',
              transition: 'all .2s',
            }}>
              {label}
            </button>
          ))}
        </div>

        <div style={{ flex: 1, overflowY: 'auto', padding: '14px 16px' }} className="hide-scrollbar">
          {emaMode === 'resumen' ? (
            <div>
              {/* Intents */}
              <div className="atlas-mono atlas-eyebrow" style={{ color: 'rgba(255,255,255,0.5)', marginBottom: 8, fontSize: 8 }}>
                Tus intenciones · {activeIntents.length}
              </div>
              {activeIntents.length === 0 ? (
                <div style={{
                  fontSize: 12, color: 'rgba(255,255,255,0.5)', padding: '12px 14px',
                  borderRadius: 10, background: 'rgba(255,255,255,0.04)', marginBottom: 14, fontStyle: 'italic',
                }}>
                  Sin intenciones todavía. Ve al Capítulo 01.
                </div>
              ) : (
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5, marginBottom: 14 }}>
                  {activeIntents.map((it) => (
                    <span key={it} style={{
                      fontSize: 10, fontWeight: 600, color: '#4fffb4',
                      background: 'rgba(64,217,157,0.14)', padding: '4px 9px', borderRadius: 999,
                    }}>
                      ✦ {it}
                    </span>
                  ))}
                </div>
              )}

              {/* Property count badge when AI updated listings */}
              {lastPropertyCount > 0 && (
                <div style={{
                  marginBottom: 12, padding: '8px 12px', borderRadius: 10,
                  background: 'rgba(64,217,157,0.12)', border: '1px solid rgba(64,217,157,0.25)',
                  fontSize: 11, color: '#4fffb4', fontWeight: 600,
                }}>
                  ✦ EMA encontró {lastPropertyCount} propiedad{lastPropertyCount !== 1 ? 'es' : ''} para ti
                </div>
              )}

              {/* Top matches */}
              <div className="atlas-mono atlas-eyebrow" style={{
                color: 'rgba(255,255,255,0.5)', marginBottom: 8, fontSize: 8,
                display: 'flex', justifyContent: 'space-between',
              }}>
                <span>Top curaduría</span>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 7, marginBottom: 14 }}>
                {topMatches.map((p) => (
                  <div key={p.id} onClick={() => openDrawer(p)} style={{
                    display: 'flex', alignItems: 'center', gap: 9, padding: 9,
                    borderRadius: 11, background: 'rgba(255,255,255,0.05)', cursor: 'pointer',
                  }}>
                    <div style={{
                      width: 40, height: 40, borderRadius: 7, flexShrink: 0, position: 'relative',
                      backgroundImage: `url(${p.imagenes?.[0] ?? ''})`,
                      backgroundSize: 'cover', backgroundPosition: 'center',
                    }}>
                      <div style={{
                        position: 'absolute', top: -4, right: -4, width: 20, height: 20,
                        borderRadius: '50%', background: '#40d99d',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontSize: 7, fontWeight: 800, color: '#004d35',
                      }}>
                        {p.match_score}
                      </div>
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: 11, fontWeight: 600, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {p.ubicacion}
                      </div>
                      <div style={{ fontSize: 9, color: 'rgba(255,255,255,0.5)' }}>{fmtCOP(p.precio)}</div>
                    </div>
                    <div style={{ fontSize: 9, fontWeight: 700, color: '#4fffb4', whiteSpace: 'nowrap' }}>
                      +{fmtCOP(p.cashback_amount)}
                    </div>
                  </div>
                ))}
              </div>

              {/* Cashback pool */}
              <div style={{ background: 'linear-gradient(135deg, #004d35, #006c4a)', borderRadius: 12, padding: '12px 14px' }}>
                <div className="atlas-mono atlas-eyebrow" style={{ color: '#4fffb4', marginBottom: 4, fontSize: 8 }}>
                  Cashback potencial · top 3
                </div>
                <div style={{ fontSize: 26, fontWeight: 800, color: '#4fffb4', letterSpacing: '-0.02em', lineHeight: 1 }}>
                  +{fmtCOP(topMatches.reduce((s, p) => s + (p.cashback_amount ?? 0), 0))}
                </div>
              </div>
            </div>
          ) : (
            <div>
              {/* Chat messages */}
              {emaMessages.length === 0 ? (
                <EmaDictation key={activeChapter} lines={CHAPTER_LINES[activeChapter] ?? CHAPTER_LINES[0]} />
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                  {emaMessages.slice(-12).map((msg, i) => (
                    <div key={i} style={{
                      fontSize: msg.role === 'assistant' ? 14 : 12,
                      color: msg.role === 'assistant' ? '#fff' : 'rgba(255,255,255,0.6)',
                      fontWeight: msg.role === 'assistant' ? 500 : 400,
                      lineHeight: 1.45,
                      textAlign: msg.role === 'user' ? 'right' : 'left',
                      background: msg.role === 'user' ? 'rgba(64,217,157,0.1)' : 'transparent',
                      padding: msg.role === 'user' ? '8px 10px' : 0,
                      borderRadius: 10,
                    }}>
                      {msg.text}
                    </div>
                  ))}
                  {emaProcessing && (
                    <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.4)', fontStyle: 'italic' }}>
                      EMA está pensando…
                    </div>
                  )}
                  <div ref={messagesEndRef} />
                </div>
              )}

              {/* Waveform */}
              <div style={{ marginTop: 14, background: 'rgba(255,255,255,0.04)', borderRadius: 10, padding: 12 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 7 }}>
                  <span className="atlas-mono atlas-eyebrow" style={{ color: 'rgba(255,255,255,0.5)', fontSize: 8 }}>
                    {voiceActive ? 'Micrófono activo' : speaking ? 'EMA hablando' : 'Voz en pausa'}
                  </span>
                  <span className="atlas-mono" style={{ color: '#4fffb4', fontSize: 8, fontWeight: 700 }}>
                    {voiceActive ? '🔴 REC' : speaking ? '🔊 TTS' : '128Hz · Cálido'}
                  </span>
                </div>
                <Waveform active={voiceActive || speaking} bars={26} color="#40d99d" />
              </div>
            </div>
          )}
        </div>

        {/* Input bar */}
        <div style={{
          padding: 10, background: 'rgba(0,0,0,0.22)',
          display: 'flex', gap: 7, alignItems: 'center',
        }}>
          {/* Voice toggle */}
          <button
            onClick={startVoice}
            style={{
              width: 32, height: 32, borderRadius: 9, border: 'none', cursor: 'pointer', flexShrink: 0,
              background: voiceActive ? '#ff6b6b' : 'rgba(255,255,255,0.1)',
              color: '#fff', fontSize: 14,
              boxShadow: voiceActive ? '0 0 12px rgba(255,107,107,0.5)' : 'none',
              transition: 'all .3s',
            }}
          >
            {voiceActive ? '◼' : '🎙'}
          </button>

          <input
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && sendMessage(input)}
            placeholder={voiceActive ? 'Escuchando…' : 'Escribe o habla a EMA…'}
            style={{
              flex: 1, background: 'transparent', border: 'none', outline: 'none',
              color: '#fff', fontSize: 12, fontFamily: 'inherit', padding: '7px 9px',
            }}
          />
          <button
            onClick={() => sendMessage(input)}
            disabled={emaProcessing || !input.trim()}
            style={{
              width: 32, height: 32, borderRadius: 9, border: 'none', cursor: 'pointer',
              background: '#40d99d', color: '#004d35', fontSize: 13, fontWeight: 800,
              opacity: emaProcessing || !input.trim() ? 0.5 : 1,
            }}
          >
            →
          </button>
        </div>
      </div>
    </div>
  )
}
