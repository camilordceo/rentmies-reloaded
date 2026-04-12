'use client'

interface CinematicHeroProps {
  empresaNombre: string
}

const TAGLINES = [
  'Arrienda o compra con ayuda de IA.',
  'Tu concierge inmobiliario 24/7.',
  'Encuentra el espacio ideal hoy.',
]

export function CinematicHero({ empresaNombre }: CinematicHeroProps) {
  const tagline = TAGLINES[Math.floor(Date.now() / 86400000) % TAGLINES.length]

  return (
    <div className="flex flex-col items-center justify-center h-full gap-8 px-6 text-center select-none">
      {/* Ambient glow orb */}
      <div className="relative w-32 h-32 flex items-center justify-center">
        <div className="absolute inset-0 rounded-full bg-brand-teal/10 animate-pulse-glow" />
        <div className="absolute inset-4 rounded-full bg-brand-teal/20 blur-sm" />
        <svg
          viewBox="0 0 64 64"
          fill="none"
          className="relative w-12 h-12 text-authority-green"
          aria-hidden
        >
          <path
            d="M32 8C18.7 8 8 18.7 8 32s10.7 24 24 24 24-10.7 24-24S45.3 8 32 8zm0 6c9.9 0 18 8.1 18 18S41.9 50 32 50 14 41.9 14 32s8.1-18 18-18zm-1 8v12l8.5 5-1.5 2.6-10-6V22h3z"
            fill="currentColor"
          />
        </svg>
      </div>

      {/* Headline */}
      <div className="space-y-2">
        <h1 className="text-3xl font-semibold text-on-surface tracking-tight">
          {empresaNombre}
        </h1>
        <p className="text-base text-on-surface/60 font-light">{tagline}</p>
      </div>

      {/* Prompt hints */}
      <div className="flex flex-wrap gap-2 justify-center max-w-md">
        {[
          'Apartamento en Chapinero',
          'Casa con jardín < $2M',
          'Local comercial Medellín',
        ].map((hint) => (
          <span
            key={hint}
            className="text-xs px-3 py-1.5 rounded-full bg-surface-container text-on-surface/70 border border-outline-variant/30"
          >
            {hint}
          </span>
        ))}
      </div>
    </div>
  )
}
