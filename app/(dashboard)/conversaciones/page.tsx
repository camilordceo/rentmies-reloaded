export const dynamic = 'force-dynamic'

import { createClient } from '@/lib/supabase/server'
import { ConversacionesView } from '@/components/dashboard/conversaciones-view'

export default async function ConversacionesPage() {
  const supabase = createClient()

  const [convResult, contactResult] = await Promise.all([
    supabase
      .from('conversations')
      .select('*, contacts(*)')
      .order('last_message_at', { ascending: false })
      .limit(100),
    supabase
      .from('contacts')
      .select('*')
      .limit(500),
  ])

  return (
    <div className="h-[calc(100vh-8rem)] -m-4 lg:-m-6">
      <ConversacionesView
        initialConversations={convResult.data ?? []}
        contacts={contactResult.data ?? []}
      />
    </div>
  )
}
