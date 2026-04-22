'use client'
import { useState } from 'react'
import { useAtlasStore } from '@/store/atlas-store'

const CHAPTERS = [
  { idx: '01', label: 'El despertar' },
  { idx: '02', label: 'Curaduría viva' },
  { idx: '03', label: 'Recorrido íntimo' },
  { idx: '04', label: 'Tu parte del trato' },
]

interface ChapterIndicatorProps {
  onJump: (i: number) => void
}

export function ChapterIndicator({ onJump }: ChapterIndicatorProps) {
  const activeChapter = useAtlasStore((s) => s.activeChapter)
  const [hover, setHover] = useState(false)

  return (
    <div
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{
        position: 'fixed',
        left: 16,
        top: '50%',
        transform: 'translateY(-50%)',
        zIndex: 80,
        display: 'flex',
        flexDirection: 'column',
        gap: 18,
        padding: '14px',
        background: hover ? 'rgba(252,249,248,0.82)' : 'transparent',
        backdropFilter: hover ? 'blur(18px)' : 'none',
        WebkitBackdropFilter: hover ? 'blur(18px)' : 'none',
        borderRadius: 16,
        boxShadow: hover ? '0 32px 64px -12px rgba(28,27,27,0.06)' : 'none',
        transition: 'all .3s',
      }}
    >
      {CHAPTERS.map((ch, i) => (
        <button
          key={ch.idx}
          onClick={() => onJump(i)}
          style={{
            border: 'none',
            background: 'transparent',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: 10,
            padding: 0,
          }}
        >
          <span
            className="atlas-mono"
            style={{
              fontSize: 10,
              color: i === activeChapter ? '#006c4a' : '#6b7280',
              fontWeight: 700,
              transition: 'color .4s',
              width: 16,
              textAlign: 'left',
            }}
          >
            {ch.idx}
          </span>
          <span
            style={{
              width: i === activeChapter ? 24 : 12,
              height: 1.5,
              background: i === activeChapter ? '#006c4a' : '#dcd9d9',
              transition: 'width .5s, background .4s',
              flexShrink: 0,
            }}
          />
          <span
            style={{
              fontSize: 10,
              letterSpacing: '0.12em',
              textTransform: 'uppercase',
              color: i === activeChapter ? '#1c1b1b' : '#6b7280',
              fontWeight: i === activeChapter ? 600 : 500,
              maxWidth: hover ? 160 : 0,
              opacity: hover ? (i === activeChapter ? 1 : 0.7) : 0,
              overflow: 'hidden',
              whiteSpace: 'nowrap',
              transition: 'max-width .35s cubic-bezier(.2,.7,.2,1), opacity .25s',
            }}
          >
            {ch.label}
          </span>
        </button>
      ))}
    </div>
  )
}
