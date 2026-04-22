'use client'

interface WaveformProps {
  active?: boolean
  bars?: number
  color?: string
  height?: number
}

export function Waveform({ active = true, bars = 24, color = '#40d99d', height = 22 }: WaveformProps) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 3, height }}>
      {Array.from({ length: bars }).map((_, i) => (
        <div
          key={i}
          className="atlas-wave-bar"
          style={{
            animationDelay: `${(i * 0.055) % 1.1}s`,
            animationDuration: `${1 + (i % 5) * 0.12}s`,
            height: `${8 + (i % 7) * 3}px`,
            background: color,
            opacity: active ? 0.45 + (i % 4) * 0.15 : 0.12,
            animationPlayState: active ? 'running' : 'paused',
          }}
        />
      ))}
    </div>
  )
}
