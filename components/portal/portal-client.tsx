'use client'

import { useState } from 'react'
import { HeroSearch } from './hero-search'
import { ChatInterface } from './chat-interface'

interface PortalClientProps {
  empresa: { id: string; nombre: string; ciudad: string | null }
  destacadas: any[]
}

export function PortalClient({ empresa, destacadas }: PortalClientProps) {
  const [chatStarted, setChatStarted] = useState(false)
  const [initialMessage, setInitialMessage] = useState('')

  function handleSearch(query: string) {
    setInitialMessage(query)
    setChatStarted(true)
  }

  if (chatStarted) {
    return (
      <ChatInterface
        empresa={empresa}
        initialMessage={initialMessage}
        onBack={() => setChatStarted(false)}
      />
    )
  }

  return (
    <HeroSearch
      empresa={empresa}
      destacadas={destacadas}
      onSearch={handleSearch}
    />
  )
}
