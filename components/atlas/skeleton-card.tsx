'use client'

export function SkeletonCard({ delay = 0 }: { delay?: number }) {
  return (
    <div
      style={{
        position: 'relative',
        aspectRatio: '5/4',
        borderRadius: 16,
        overflow: 'hidden',
        background: 'linear-gradient(110deg, #f0eded 8%, #f8f5f4 18%, #f0eded 33%)',
        backgroundSize: '200% 100%',
        animation: `shimmer 1.4s ease-in-out infinite ${delay}ms`,
        boxShadow: '0 8px 24px -8px rgba(28,27,27,0.05)',
      }}
    >
      <div
        style={{
          position: 'absolute',
          bottom: 12,
          left: 12,
          right: 12,
          display: 'flex',
          flexDirection: 'column',
          gap: 5,
        }}
      >
        <div style={{ height: 12, width: '70%', borderRadius: 4, background: 'rgba(255,255,255,0.6)' }} />
        <div style={{ height: 8, width: '45%', borderRadius: 4, background: 'rgba(255,255,255,0.5)' }} />
      </div>
    </div>
  )
}

export function SkeletonRailCard() {
  return (
    <div
      style={{
        display: 'flex',
        gap: 9,
        alignItems: 'center',
        padding: 9,
        borderRadius: 12,
        background: 'linear-gradient(110deg, #f0eded 8%, #f8f5f4 18%, #f0eded 33%)',
        backgroundSize: '200% 100%',
        animation: 'shimmer 1.4s ease-in-out infinite',
      }}
    >
      <div style={{ width: 40, height: 40, borderRadius: 8, background: 'rgba(255,255,255,0.55)' }} />
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 4 }}>
        <div style={{ height: 9, width: '75%', borderRadius: 3, background: 'rgba(255,255,255,0.55)' }} />
        <div style={{ height: 7, width: '50%', borderRadius: 3, background: 'rgba(255,255,255,0.45)' }} />
      </div>
    </div>
  )
}
