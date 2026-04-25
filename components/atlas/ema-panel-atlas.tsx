'use client'
import { useState, useRef, useEffect, useCallback } from 'react'
import { useShallow } from 'zustand/react/shallow'
import { useAtlasStore } from '@/store/atlas-store'
import { fmtCOP, computeMatchScore } from '@/store/atlas-store'
import type { AtlasChapter } from '@/store/atlas-store'
import { EmaSphere } from './ema-sphere'
import { Waveform } from './waveform'
import { EmaDictation } from './ema-dictation'
import { RichChatMessage } from './rich-chat-message'

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
    setIsSearching, setActiveFilters,
    lastDebug, setLastDebug,
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
      setIsSearching: s.setIsSearching,
      setActiveFilters: s.setActiveFilters,
      lastDebug: s.lastDebug,
      setLastDebug: s.setLastDebug,
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
    setIsSearching(true)
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
      const props = Array.isArray(data.properties) ? data.properties : []

      addEmaMessage({
        role: 'assistant',
        text: data.text,
        properties: props,
        references: data.references ?? [],
      })
      if (data.response_id) setResponseId(data.response_id)
      if (data.search_filters) setActiveFilters(data.search_filters)
      if (data.debug) {
        setLastDebug(data.debug)
        // Mirror to console so devs see the diagnostic without opening the admin panel
        // eslint-disable-next-line no-console
        console.log('[ema/chat] debug', data.debug)
      }

      // Push AI-found properties into the catalog
      if (props.length > 0) {
        setProperties(props)
        setLastPropertyCount(props.length)
        setChapter(1 as AtlasChapter)
        requestAnimationFrame(() => {
          const rail = document.querySelector('.atlas-rail') as HTMLElement | null
          if (rail) rail.scrollTo({ left: window.innerWidth, behavior: 'smooth' })
        })
      }

      speakText(data.text)
    } catch {
      addEmaMessage({ role: 'assistant', text: 'Hubo un error. Intenta de nuevo.' })
    } finally {
      setEmaProcessing(false)
      setIsSearching(false)
    }
  }

  // Click handler for code chips inside chat — open drawer for matching property
  function handleCodeClick(code: string) {
    const match = properties.find(
      (p) =>
        p.codigo === code ||
        (p as any).codigo_finca_raiz === code ||
        (p as any).codigo_metro_cuadrado === code ||
        (p as any).codigo_domus === code
    )
    if (match) {
      openDrawer(match)
      return
    }
    // No match in current set — focus the rail on chapter 2 anyway so user
    // can browse the full catalog
    setChapter(1 as AtlasChapter)
    requestAnimationFrame(() => {
      const rail = document.querySelector('.atlas-rail') as HTMLElement | null
      if (rail) rail.scrollTo({ left: window.innerWidth, behavior: 'smooth' })
    })
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
                <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                  {emaMessages.slice(-12).map((msg, i) => (
                    <RichChatMessage
                      key={i}
                      role={msg.role}
                      text={msg.text}
                      properties={msg.properties}
                      references={msg.references}
                      onPropertyClick={(p) => openDrawer(p)}
                      onCodeClick={handleCodeClick}
                    />
                  ))}
                  {emaProcessing && (
                    <div style={{
                      display: 'flex', alignItems: 'center', gap: 6,
                      fontSize: 11, color: 'rgba(64,217,157,0.7)',
                      fontStyle: 'italic',
                      padding: '4px 0',
                    }}>
                      <span style={{
                        width: 6, height: 6, borderRadius: '50%',
                        background: '#4fffb4',
                        animation: 'breathe 1s infinite',
                      }} />
                      EMA está buscando…
                    </div>
                  )}
                  {!emaProcessing && lastDebug && <DebugStrip debug={lastDebug} />}
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

// ── DebugStrip ─────────────────────────────────────────────────────────────
// Tiny diagnostic row shown beneath the latest assistant reply so the user
// can see *what happened* without opening the admin panel.

function DebugStrip({ debug }: { debug: any }) {
  const path = debug?.used_path
  const codes: string[] = debug?.extracted_codes ?? []
  const inv = debug?.inventory_total
  const tool = debug?.tool_results ?? 0
  const fb = debug?.fallback_results ?? 0

  // Big red banner if inventory is empty
  if (inv === 0) {
    return (
      <div style={{
        marginTop: 4,
        padding: '10px 12px',
        borderRadius: 10,
        background: 'rgba(255,107,107,0.14)',
        border: '1px solid rgba(255,107,107,0.4)',
        fontSize: 11,
        color: '#ffb4b4',
        lineHeight: 1.4,
      }}>
        <strong>⚠ Inventario vacío en Supabase.</strong> Corre la migration 011 + el seed
        para que EMA pueda traer propiedades.
      </div>
    )
  }

  // Yellow note when AI mentioned codes but DB had no match
  const mentionedNotFound = codes.length > 0 && tool === 0 && fb === 0
  if (mentionedNotFound) {
    return (
      <div style={{
        marginTop: 4,
        padding: '8px 10px',
        borderRadius: 10,
        background: 'rgba(255,200,80,0.12)',
        border: '1px solid rgba(255,200,80,0.3)',
        fontSize: 10,
        color: '#ffd58a',
        lineHeight: 1.4,
      }}>
        EMA mencionó {codes.length === 1 ? 'el código' : 'códigos'}{' '}
        <strong>{codes.join(', ')}</strong>{' '}
        — no están en el inventario actual.
      </div>
    )
  }

  if (path === 'none' && codes.length === 0) return null

  // Standard inline diagnostic
  return (
    <div style={{
      display: 'flex',
      flexWrap: 'wrap',
      alignItems: 'center',
      gap: 5,
      marginTop: 2,
      fontSize: 9,
      color: 'rgba(255,255,255,0.45)',
      fontFamily: 'ui-monospace, SFMono-Regular, monospace',
    }}>
      <DebugPill label={path === 'tool' ? 'tool' : path === 'fallback' ? 'codes' : '—'} accent={path === 'tool'} />
      <DebugPill label={`${tool + fb} props`} />
      {codes.length > 0 && <DebugPill label={`${codes.length} códigos`} />}
      {debug?.search_filters && Object.keys(debug.search_filters).length > 0 && (
        <DebugPill label={`${Object.keys(debug.search_filters).length} filtros`} />
      )}
    </div>
  )
}

function DebugPill({ label, accent = false }: { label: string; accent?: boolean }) {
  return (
    <span style={{
      padding: '1px 5px',
      borderRadius: 4,
      background: accent ? 'rgba(64,217,157,0.18)' : 'rgba(255,255,255,0.06)',
      color: accent ? '#4fffb4' : 'rgba(255,255,255,0.5)',
      letterSpacing: '0.04em',
    }}>
      {label}
    </span>
  )
}
