'use client'
import { useState, useEffect } from 'react'

interface EmaDictationProps {
  lines: string[]
  speed?: number
}

export function EmaDictation({ lines, speed = 28 }: EmaDictationProps) {
  const [lineIdx, setLineIdx] = useState(0)
  const [charIdx, setCharIdx] = useState(0)
  const [shown, setShown] = useState<string[]>([])

  // Reset on lines change (chapter change)
  useEffect(() => {
    setLineIdx(0)
    setCharIdx(0)
    setShown([])
  }, [lines])

  useEffect(() => {
    if (lineIdx >= lines.length) return
    const full = lines[lineIdx]

    if (charIdx < full.length) {
      const t = setTimeout(() => setCharIdx((c) => c + 1), speed)
      return () => clearTimeout(t)
    }

    const pause = setTimeout(() => {
      setShown((s) => [...s, full])
      if (lineIdx === lines.length - 1) {
        setTimeout(() => {
          setShown([])
          setLineIdx(0)
          setCharIdx(0)
        }, 4500)
      } else {
        setLineIdx((i) => i + 1)
        setCharIdx(0)
      }
    }, 1200)
    return () => clearTimeout(pause)
  }, [charIdx, lineIdx, lines, speed])

  const current = lineIdx < lines.length ? lines[lineIdx].slice(0, charIdx) : ''

  return (
    <div style={{ minHeight: 120 }}>
      {shown.slice(-2).map((l, i) => (
        <div
          key={i}
          style={{
            fontSize: 13,
            color: 'rgba(255,255,255,0.45)',
            marginBottom: 6,
            fontWeight: 400,
            letterSpacing: '-0.01em',
          }}
        >
          {l}
        </div>
      ))}
      <div
        style={{
          fontSize: 17,
          color: '#fff',
          fontWeight: 500,
          letterSpacing: '-0.015em',
          lineHeight: 1.4,
        }}
      >
        <span className="atlas-dictation-cursor">{current}</span>
      </div>
    </div>
  )
}
