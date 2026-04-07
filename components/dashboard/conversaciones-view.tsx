'use client'

import { useState, useEffect, useRef } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { ConversationWithContact, Message, Contact } from '@/lib/types'
import { ConversationListPanel } from './conversation-list-panel'
import { ChatPanelView } from './chat-panel-view'
import { ContactPanelView } from './contact-panel-view'

interface ConversacionesViewProps {
  initialConversations: ConversationWithContact[]
  contacts: Contact[]
}

export function ConversacionesView({ initialConversations, contacts }: ConversacionesViewProps) {
  const [conversations, setConversations] = useState(initialConversations)
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [messages, setMessages] = useState<Message[]>([])
  const [loadingMessages, setLoadingMessages] = useState(false)
  const [showContact, setShowContact] = useState(false)
  const supabase = createClient()

  const selectedConv = conversations.find((c) => c.id === selectedId) ?? null

  // Load messages when conversation selected
  useEffect(() => {
    if (!selectedId) return

    setLoadingMessages(true)
    supabase
      .from('messages')
      .select('*')
      .eq('conversation_id', selectedId)
      .order('created_at', { ascending: true })
      .then(({ data }) => {
        setMessages(data ?? [])
        setLoadingMessages(false)
      })
  }, [selectedId])

  // Real-time messages subscription
  useEffect(() => {
    if (!selectedId) return

    const channel = supabase
      .channel(`messages:${selectedId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `conversation_id=eq.${selectedId}`,
        },
        (payload) => {
          setMessages((prev) => [...prev, payload.new as Message])
        }
      )
      .subscribe()

    return () => { supabase.removeChannel(channel) }
  }, [selectedId])

  // Real-time conversations subscription
  useEffect(() => {
    const channel = supabase
      .channel('conversations')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'conversations' },
        (payload) => {
          if (payload.eventType === 'UPDATE') {
            setConversations((prev) =>
              prev.map((c) =>
                c.id === payload.new.id ? { ...c, ...payload.new } : c
              )
            )
          }
          if (payload.eventType === 'INSERT') {
            setConversations((prev) => [payload.new as ConversationWithContact, ...prev])
          }
        }
      )
      .subscribe()

    return () => { supabase.removeChannel(channel) }
  }, [])

  const handleSendMessage = async (text: string) => {
    if (!selectedId) return

    await supabase.from('messages').insert({
      conversation_id: selectedId,
      sender: 'agent',
      type: 'text',
      text,
    })

    await supabase
      .from('conversations')
      .update({ last_message: text, last_message_at: new Date().toISOString() })
      .eq('id', selectedId)
  }

  const handleToggleMode = async (convId: string, currentMode: string) => {
    const newMode = currentMode === 'ia' ? 'manual' : 'ia'
    await supabase.from('conversations').update({ mode: newMode }).eq('id', convId)
    setConversations((prev) =>
      prev.map((c) => (c.id === convId ? { ...c, mode: newMode as 'ia' | 'manual' } : c))
    )
  }

  const handleUpdateCRMStage = async (convId: string, stage: string) => {
    await supabase.from('conversations').update({ crm_stage: stage }).eq('id', convId)
    setConversations((prev) =>
      prev.map((c) => (c.id === convId ? { ...c, crm_stage: stage } : c))
    )
  }

  const handleUpdateAppointment = async (
    convId: string,
    date: Date | undefined,
    time: string
  ) => {
    const update = {
      appointment_date: date ? date.toISOString() : null,
      appointment_time: time || null,
    }
    await supabase.from('conversations').update(update).eq('id', convId)
    setConversations((prev) =>
      prev.map((c) => (c.id === convId ? { ...c, ...update } : c))
    )
  }

  const [view, setView] = useState<'list' | 'chat' | 'contact'>('list')

  const handleSelectConversation = (id: string) => {
    setSelectedId(id)
    setView('chat')
  }

  return (
    <div className="flex h-full bg-[#f8f8f8]">
      {/* List — always visible on desktop, hide on mobile when chat open */}
      <div className={`
        w-full md:w-72 lg:w-80 flex-shrink-0 p-3 lg:p-4
        ${view === 'chat' || view === 'contact' ? 'hidden md:block' : 'block'}
      `}>
        <ConversationListPanel
          conversations={conversations}
          contacts={contacts}
          selectedId={selectedId}
          onSelect={handleSelectConversation}
        />
      </div>

      {/* Chat */}
      <div className={`
        flex-1 p-3 lg:p-4 min-w-0
        ${view === 'list' ? 'hidden md:block' : view === 'contact' ? 'hidden lg:block' : 'block'}
      `}>
        {selectedConv ? (
          <ChatPanelView
            conversation={selectedConv}
            messages={messages}
            loading={loadingMessages}
            onSendMessage={handleSendMessage}
            onToggleMode={handleToggleMode}
            onBack={() => setView('list')}
            onShowContact={() => setView('contact')}
          />
        ) : (
          <div className="h-full flex items-center justify-center bg-white rounded-xl border border-[#e5e5e5]">
            <div className="text-center">
              <div className="w-14 h-14 bg-[#40d99d]/10 rounded-full flex items-center justify-center mx-auto mb-3">
                <svg className="w-7 h-7 text-[#40d99d]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
              </div>
              <p className="text-sm font-medium text-[#1a1a1a]">Selecciona una conversación</p>
              <p className="text-xs text-[#6b7280] mt-1">Elige una conversación de la lista</p>
            </div>
          </div>
        )}
      </div>

      {/* Contact panel */}
      <div className={`
        w-full md:w-64 lg:w-72 flex-shrink-0 p-3 lg:p-4
        ${view === 'contact' ? 'block' : 'hidden lg:block'}
      `}>
        {selectedConv ? (
          <div className="h-full bg-white rounded-xl border border-[#e5e5e5] overflow-hidden">
            <ContactPanelView
              conversation={selectedConv}
              contacts={contacts}
              onUpdateCRMStage={handleUpdateCRMStage}
              onUpdateAppointment={handleUpdateAppointment}
              onBack={() => setView('chat')}
            />
          </div>
        ) : (
          <div className="h-full bg-white rounded-xl border border-[#e5e5e5]" />
        )}
      </div>
    </div>
  )
}
