import type { Metadata } from 'next'
import './atlas.css'

export const metadata: Metadata = {
  title: 'Living Atlas · Rentmies',
  description: 'Descubre propiedades con EMA. Cashback garantizado.',
}

export default function AtlasLayout({ children }: { children: React.ReactNode }) {
  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        overflow: 'hidden',
        background: '#fcf9f8',
      }}
    >
      {children}
    </div>
  )
}
