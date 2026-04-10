/**
 * Provider Router — decides which WhatsApp provider handles each message.
 * Rules (in priority order):
 *  1. Contact has preferred_provider tag in DB → honor it
 *  2. Off-hours COT (22:00–07:00) → wharentmies (lower AI latency)
 *  3. Callbell circuit-breaker open → failover to wharentmies
 *  4. AI agent (EMA) → wharentmies; human agent → callbell
 */

import type { ProviderId } from './types'
import type { SupabaseClient } from '@supabase/supabase-js'
import { callbellProvider } from './callbell.provider'
import { wharentmiesProvider } from './wharentmies.provider'
import type { WhatsAppProvider } from './types'

export interface MessageContext {
  agentType?: 'ai' | 'human'
  empresaId?: string
}

// ─── Circuit breaker (in-memory) ─────────────────────────────────────────────
// Tracks Callbell failures. Opens if >3 failures in the last 5 minutes.
// ASSUMPTION: Single-instance acceptable for Vercel hobby/pro — use Redis for multi-region.

const CB_WINDOW_MS = 5 * 60 * 1_000
const CB_THRESHOLD = 3

const circuitFailures: Array<number> = []  // timestamps of recent failures

export function recordCallbellFailure(): void {
  circuitFailures.push(Date.now())
}

export function isCallbellCircuitOpen(): boolean {
  const cutoff = Date.now() - CB_WINDOW_MS
  const recent = circuitFailures.filter((t) => t > cutoff)
  // Mutate in-place to avoid accumulation
  circuitFailures.splice(0, circuitFailures.length, ...recent)
  return recent.length >= CB_THRESHOLD
}

// ─── COT time check ──────────────────────────────────────────────────────────

function isOffHoursCOT(): boolean {
  const cotOffset = -5 // Colombia UTC-5
  const cotHour = (new Date().getUTCHours() + 24 + cotOffset) % 24
  return cotHour >= 22 || cotHour < 7
}

// ─── Main router ─────────────────────────────────────────────────────────────

export async function routeMessage(
  phone: string,
  context: MessageContext,
  supabase?: SupabaseClient
): Promise<ProviderId> {
  // Rule 1: DB-preferred provider per contact
  if (supabase) {
    const { data } = await supabase
      .from('user_conversacion')
      .select('metadata')
      .eq('telefono', phone)
      .single()
    const preferred = (data?.metadata as Record<string, string> | null)?.preferred_provider
    if (preferred === 'wharentmies' || preferred === 'callbell') {
      return preferred as ProviderId
    }
  }

  // Rule 2: Off-hours → wharentmies
  if (isOffHoursCOT()) return 'wharentmies'

  // Rule 3: Circuit breaker
  if (isCallbellCircuitOpen()) return 'wharentmies'

  // Rule 4: AI agent → wharentmies, human → callbell
  if (context.agentType === 'ai') return 'wharentmies'

  return process.env.WHATSAPP_DEFAULT_PROVIDER === 'wharentmies' ? 'wharentmies' : 'callbell'
}

export function getProvider(id: ProviderId): WhatsAppProvider {
  return id === 'wharentmies' ? wharentmiesProvider : callbellProvider
}
