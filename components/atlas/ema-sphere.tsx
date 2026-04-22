'use client'

interface EmaSpherePros {
  size?: number
  style?: React.CSSProperties
}

export function EmaSphere({ size = 56, style }: EmaSpherePros) {
  return (
    <div
      className="atlas-ema-sphere"
      style={{ width: size, height: size, flexShrink: 0, ...style }}
    />
  )
}
