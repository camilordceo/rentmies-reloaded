'use client'
import Link from 'next/link'
import { useAtlasStore } from '@/store/atlas-store'
import { fmtCOP } from '@/store/atlas-store'

export function AtlasTopNav() {
  const properties = useAtlasStore((s) => s.properties)

  const totalCashback = properties.reduce((sum, p) => sum + (p.cashback_amount ?? 0), 0)

  return (
    <header
      className="atlas-glass"
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        height: 68,
        zIndex: 90,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0 32px',
      }}
    >
      {/* Left: logo + nav */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 40 }}>
        <Link
          href="/"
          style={{
            fontWeight: 800,
            fontSize: 18,
            letterSpacing: '-0.03em',
            color: '#006c4a',
            textDecoration: 'none',
          }}
        >
          rentmies<span style={{ color: '#40d99d' }}>.</span>
        </Link>

        <nav
          style={{
            display: 'flex',
            gap: 28,
            fontSize: 13,
            fontWeight: 500,
            color: '#3c4a42',
          }}
        >
          <span style={{ color: '#1c1b1b', borderBottom: '1.5px solid #40d99d', paddingBottom: 3 }}>
            Living Atlas
          </span>
          <Link href="/atlas" style={{ textDecoration: 'none', color: 'inherit' }}>
            Cashback
          </Link>
          <Link href="/login" style={{ textDecoration: 'none', color: 'inherit' }}>
            EMA
          </Link>
        </nav>
      </div>

      {/* Right: cashback pill + acceder */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
        <div
          className="atlas-glass"
          style={{
            borderRadius: 999,
            padding: '8px 16px',
            display: 'flex',
            alignItems: 'center',
            gap: 10,
          }}
        >
          <span
            style={{
              width: 6,
              height: 6,
              borderRadius: '50%',
              background: '#40d99d',
              boxShadow: '0 0 8px #40d99d',
              animation: 'breathe 2s ease-in-out infinite',
              flexShrink: 0,
            }}
          />
          <span
            className="atlas-mono atlas-eyebrow"
            style={{ color: '#6b7280', fontSize: 9, letterSpacing: '0.15em' }}
          >
            CASHBACK EN VIVO
          </span>
          <span
            className="atlas-mono"
            style={{ color: '#006c4a', fontWeight: 700, fontSize: 13 }}
          >
            {fmtCOP(totalCashback)}
          </span>
        </div>

        <Link
          href="/login"
          style={{
            border: 'none',
            background: '#1c1b1b',
            color: '#fff',
            padding: '10px 20px',
            borderRadius: 999,
            fontSize: 12,
            fontWeight: 600,
            letterSpacing: '0.05em',
            cursor: 'pointer',
            textDecoration: 'none',
            display: 'inline-block',
          }}
        >
          Acceder
        </Link>
      </div>
    </header>
  )
}
