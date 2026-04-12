import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'

const inter = Inter({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700'],
  variable: '--font-inter',
})

export const metadata: Metadata = {
  title: 'Rentmies — Agente IA para inmobiliarias',
  description: 'Plataforma de IA para agencias inmobiliarias en Colombia. Arrienda y vende inmuebles 24/7 con WhatsApp.',
  keywords: 'inmobiliaria, IA, WhatsApp, Colombia, arriendo, venta, proptech',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="es">
      <body className={`${inter.variable} font-sans antialiased bg-surface`}>
        {children}
      </body>
    </html>
  )
}
