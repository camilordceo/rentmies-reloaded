/**
 * Logger — writes structured JSON to console (Vercel logs)
 * AND inserts a row into admin_logs asynchronously (non-blocking).
 *
 * Uses the service-role client so it bypasses RLS.
 * Import ONLY in server-side code (API routes, Server Components).
 */

type Level = 'debug' | 'info' | 'warn' | 'error'

interface LogContext {
  conversacion_id?: string
  telefono?: string
  empresa_id?: string
  whatsapp_ai_id?: string
  [key: string]: unknown
}

function getServiceClient() {
  // Dynamic import to avoid bundling in client code
  // We use createClient from supabase-js directly to avoid cookie issues in routes
  const { createClient } = require('@supabase/supabase-js')
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )
}

function log(
  level: Level,
  source: string,
  message: string,
  context?: LogContext
) {
  const entry = {
    level,
    source,
    message,
    timestamp: new Date().toISOString(),
    ...(context ? { context } : {}),
  }

  // Console output for Vercel logs
  if (level === 'error') {
    console.error(JSON.stringify(entry))
  } else if (level === 'warn') {
    console.warn(JSON.stringify(entry))
  } else {
    console.log(JSON.stringify(entry))
  }

  // Async insert into admin_logs — fire and forget
  const supabase = getServiceClient()
  supabase
    .from('admin_logs')
    .insert({
      level,
      source,
      message,
      empresa_id: context?.empresa_id ?? null,
      context: context ?? null,
    })
    .then(({ error }: { error: Error | null }) => {
      if (error) {
        console.error(JSON.stringify({ level: 'error', source: 'logger', message: 'Failed to insert log', error: error.message }))
      }
    })
}

export const logger = {
  debug: (source: string, message: string, context?: LogContext) =>
    log('debug', source, message, context),
  info: (source: string, message: string, context?: LogContext) =>
    log('info', source, message, context),
  warn: (source: string, message: string, context?: LogContext) =>
    log('warn', source, message, context),
  error: (source: string, message: string, context?: LogContext) =>
    log('error', source, message, context),
}
