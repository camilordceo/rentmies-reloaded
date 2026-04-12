import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Rentmies — Tu concierge inmobiliario',
  description: 'Encuentra el inmueble perfecto con ayuda de IA en Colombia',
}

export default function PortalLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="h-dvh overflow-hidden bg-surface font-sans antialiased">
      {children}
    </div>
  )
}
