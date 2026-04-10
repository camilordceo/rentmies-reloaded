import { createClient } from '@supabase/supabase-js'

/**
 * Service-role Supabase client for API routes.
 * Bypasses RLS — use only server-side.
 */
export function createAdminClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
      auth: { persistSession: false },
    }
  )
}
