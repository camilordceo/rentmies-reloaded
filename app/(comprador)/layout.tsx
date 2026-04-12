export const dynamic = 'force-dynamic'

import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { CompradorSidebar } from '@/components/comprador/sidebar'

export default async function CompradorLayout({ children }: { children: React.ReactNode }) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('rol, nombre, email')
    .eq('id', user.id)
    .single()

  if (profile?.rol !== 'comprador') redirect('/dashboard')

  return (
    <div className="flex h-screen bg-surface overflow-hidden">
      <CompradorSidebar nombre={profile?.nombre ?? null} email={user.email ?? null} />
      <main className="flex-1 overflow-auto p-4 lg:p-6">
        {children}
      </main>
    </div>
  )
}
