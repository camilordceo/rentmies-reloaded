'use client'
import { fmtCOP } from '@/store/atlas-store'

interface CashbackCoinProps {
  amount: number | null
  tipo: 'Venta' | 'Arriendo' | 'Venta/Arriendo' | null
  size?: number
}

export function CashbackCoin({ amount, tipo, size = 160 }: CashbackCoinProps) {
  const label = tipo === 'Arriendo' ? '= 1 MES GRATIS' : '= VIAJE A SAN ANDRÉS'

  return (
    <div
      style={{
        position: 'relative',
        width: size,
        height: size,
        animation: 'float-gentle 4.5s ease-in-out infinite',
        flexShrink: 0,
      }}
    >
      {/* Outer rotating ring with text */}
      <svg
        viewBox="0 0 160 160"
        width={size}
        height={size}
        style={{
          position: 'absolute',
          inset: 0,
          animation: 'slow-rotate 26s linear infinite',
        }}
      >
        <defs>
          <path
            id="coinRingPath"
            d="M 80,80 m -62,0 a 62,62 0 1,1 124,0 a 62,62 0 1,1 -124,0"
          />
        </defs>
        <text
          fill="#4fffb4"
          style={{
            fontFamily: 'ui-monospace, monospace',
            fontSize: 10,
            fontWeight: 700,
            letterSpacing: '0.28em',
          }}
        >
          <textPath href="#coinRingPath">
            · TU PARTE DEL TRATO · CASHBACK · TU PARTE DEL TRATO · CASHBACK ·
          </textPath>
        </text>
      </svg>

      {/* Inner coin */}
      <div
        style={{
          position: 'absolute',
          inset: size * 0.14,
          borderRadius: '50%',
          background:
            'radial-gradient(circle at 35% 30%, #4fffb4, #40d99d 55%, #006c4a 110%)',
          boxShadow:
            '0 18px 48px rgba(0,108,74,0.45), inset 0 2px 6px rgba(255,255,255,0.45), inset 0 -4px 10px rgba(0,77,53,0.5)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          color: '#004d35',
        }}
      >
        <span
          className="atlas-mono atlas-eyebrow"
          style={{ fontSize: 7, fontWeight: 800, opacity: 0.7 }}
        >
          VUELVE A TI
        </span>
        <div
          style={{
            fontSize: size * 0.165,
            fontWeight: 900,
            letterSpacing: '-0.03em',
            lineHeight: 1,
            marginTop: 2,
          }}
        >
          {fmtCOP(amount)}
        </div>
        <span
          className="atlas-mono"
          style={{ fontSize: 6.5, fontWeight: 700, letterSpacing: '0.12em', marginTop: 4, opacity: 0.6 }}
        >
          {label}
        </span>
      </div>
    </div>
  )
}
