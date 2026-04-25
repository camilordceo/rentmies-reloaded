'use client'
import { useEffect, useRef } from 'react'
import { useShallow } from 'zustand/react/shallow'
import { useAtlasStore } from '@/store/atlas-store'
import type { AtlasProperty, AtlasChapter } from '@/store/atlas-store'

const SESSION_STORAGE_KEY = 'rentmies_atlas_session_id'
import { AtlasTopNav } from '@/components/atlas/atlas-top-nav'
import { ChapterIndicator } from '@/components/atlas/chapter-indicator'
import { Chapter1Awakening } from '@/components/atlas/chapter-1-awakening'
import { Chapter2Curation } from '@/components/atlas/chapter-2-curation'
import { Chapter3Tour } from '@/components/atlas/chapter-3-tour'
import { Chapter4Cashback } from '@/components/atlas/chapter-4-cashback'
import { EmaPanelAtlas } from '@/components/atlas/ema-panel-atlas'
import { PropDrawer } from '@/components/atlas/prop-drawer'

export function AtlasClient({ initialProperties }: { initialProperties: AtlasProperty[] }) {
  const railRef = useRef<HTMLDivElement>(null)
  const {
    setProperties, setMouse, setChapter, activeChapter,
    setSessionId, hydrateMessages, setResponseId,
  } = useAtlasStore(
    useShallow((s) => ({
      setProperties: s.setProperties,
      setMouse: s.setMouse,
      setChapter: s.setChapter,
      activeChapter: s.activeChapter,
      setSessionId: s.setSessionId,
      hydrateMessages: s.hydrateMessages,
      setResponseId: s.setResponseId,
    }))
  )

  // Seed store with server-fetched properties
  useEffect(() => {
    if (initialProperties.length > 0) setProperties(initialProperties)
  }, [initialProperties, setProperties])

  // Resolve session id (sessionStorage) and restore prior conversation
  useEffect(() => {
    let cancelled = false

    async function restoreSession() {
      let sid: string | null = null
      try {
        sid = sessionStorage.getItem(SESSION_STORAGE_KEY)
      } catch {
        // sessionStorage may be unavailable in some embedded contexts
      }

      if (!sid) {
        sid = typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : `s-${Date.now()}`
        try { sessionStorage.setItem(SESSION_STORAGE_KEY, sid) } catch {}
        setSessionId(sid)
        return
      }

      setSessionId(sid)

      try {
        const res = await fetch(`/api/portal/conversations?session_id=${encodeURIComponent(sid)}`)
        if (!res.ok) return
        const data = await res.json()
        if (cancelled) return

        if (Array.isArray(data.messages) && data.messages.length > 0) {
          hydrateMessages(
            data.messages.map((m: { role: 'user' | 'assistant'; text: string }) => ({
              role: m.role,
              text: m.text,
            }))
          )
        }
        if (data.response_id) setResponseId(data.response_id)
      } catch {
        // graceful — first-load failure shouldn't break the page
      }
    }

    restoreSession()
    return () => { cancelled = true }
  }, [setSessionId, hydrateMessages, setResponseId])

  // Mouse parallax tracking
  useEffect(() => {
    const onMove = (e: MouseEvent) => {
      setMouse({ x: e.clientX / window.innerWidth, y: e.clientY / window.innerHeight })
    }
    window.addEventListener('mousemove', onMove, { passive: true })
    return () => window.removeEventListener('mousemove', onMove)
  }, [setMouse])

  // Keyboard chapter navigation
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const rail = railRef.current
      if (!rail) return
      if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
        e.preventDefault()
        const next = Math.min(3, activeChapter + 1) as AtlasChapter
        scrollToChapter(rail, next)
        setChapter(next)
      } else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
        e.preventDefault()
        const prev = Math.max(0, activeChapter - 1) as AtlasChapter
        scrollToChapter(rail, prev)
        setChapter(prev)
      } else if (e.key === 'Escape') {
        const zero = 0 as AtlasChapter
        scrollToChapter(rail, zero)
        setChapter(zero)
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [activeChapter, setChapter])

  // Detect chapter from scroll position
  useEffect(() => {
    const rail = railRef.current
    if (!rail) return
    const onScroll = () => {
      const idx = Math.round(rail.scrollLeft / window.innerWidth) as AtlasChapter
      if (idx >= 0 && idx <= 3) setChapter(idx)
    }
    rail.addEventListener('scroll', onScroll, { passive: true })
    return () => rail.removeEventListener('scroll', onScroll)
  }, [setChapter])

  return (
    <>
      <AtlasTopNav />
      <ChapterIndicator
        onJump={(i) => {
          const rail = railRef.current
          if (rail) scrollToChapter(rail, i)
          setChapter(i as AtlasChapter)
        }}
      />

      {/* Horizontal scroll rail */}
      <div
        ref={railRef}
        className="atlas-rail"
        style={{ paddingTop: 68 }}
      >
        <Chapter1Awakening />
        <Chapter2Curation />
        <Chapter3Tour />
        <Chapter4Cashback />
      </div>

      <EmaPanelAtlas />
      <PropDrawer />
    </>
  )
}

function scrollToChapter(rail: HTMLDivElement, idx: number) {
  rail.scrollTo({ left: idx * window.innerWidth, behavior: 'smooth' })
}
