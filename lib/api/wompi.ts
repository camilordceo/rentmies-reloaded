/**
 * Wompi Colombia API client
 * Docs: https://docs.wompi.co
 */

const WOMPI_ENV = process.env.WOMPI_ENVIRONMENT || 'sandbox'
const WOMPI_PUBLIC_KEY = process.env.WOMPI_PUBLIC_KEY!
const WOMPI_PRIVATE_KEY = process.env.WOMPI_PRIVATE_KEY!
const WOMPI_EVENTS_SECRET = process.env.WOMPI_EVENTS_SECRET!

const BASE_URL =
  WOMPI_ENV === 'production'
    ? 'https://production.wompi.co/v1'
    : 'https://sandbox.wompi.co/v1'

function headers() {
  return {
    Authorization: `Bearer ${WOMPI_PRIVATE_KEY}`,
    'Content-Type': 'application/json',
  }
}

// ─── Transactions ────────────────────────────────────────

export interface CreateTransactionParams {
  amount_in_cents: number // Monto en centavos COP
  currency: 'COP'
  customer_email: string
  payment_method: {
    type: 'CARD' | 'NEQUI' | 'PSE' | 'BANCOLOMBIA_TRANSFER'
    token?: string // Para tarjeta
    phone_number?: string // Para Nequi
    user_type?: number // Para PSE
    user_legal_id_type?: string
    user_legal_id?: string
    financial_institution_code?: string
    payment_description?: string
  }
  reference: string // Unique reference
  customer_data?: {
    phone_number: string
    full_name: string
    legal_id: string
    legal_id_type: string
  }
  redirect_url?: string
}

export async function createTransaction(
  params: CreateTransactionParams
): Promise<{ data: { id: string; status: string; redirect_url?: string } }> {
  const resp = await fetch(`${BASE_URL}/transactions`, {
    method: 'POST',
    headers: headers(),
    body: JSON.stringify(params),
  })

  if (!resp.ok) {
    const err = await resp.text()
    throw new Error(`Wompi create transaction error: ${resp.status} ${err}`)
  }

  return resp.json()
}

export async function getTransaction(transactionId: string) {
  const resp = await fetch(`${BASE_URL}/transactions/${transactionId}`, {
    headers: { Authorization: `Bearer ${WOMPI_PRIVATE_KEY}` },
  })
  if (!resp.ok) throw new Error(`Wompi get transaction error: ${resp.status}`)
  return resp.json()
}

// ─── Payment Sources (tokenización tarjetas) ─────────────

export async function getPaymentSources(customerId: string) {
  const resp = await fetch(`${BASE_URL}/payment_sources?customer_id=${customerId}`, {
    headers: { Authorization: `Bearer ${WOMPI_PRIVATE_KEY}` },
  })
  if (!resp.ok) throw new Error(`Wompi get payment sources error: ${resp.status}`)
  return resp.json()
}

// ─── Webhook signature verification ──────────────────────

export async function verifyWebhookSignature(
  eventJson: Record<string, unknown>,
  timestamp: string,
  signature: string
): Promise<boolean> {
  const checksum = `${eventJson.event}${timestamp}${WOMPI_EVENTS_SECRET}`

  const encoder = new TextEncoder()
  const data = encoder.encode(checksum)
  const key = await crypto.subtle.importKey(
    'raw',
    encoder.encode(WOMPI_EVENTS_SECRET),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  )

  const signatureBuffer = await crypto.subtle.sign('HMAC', key, data)
  const computedSignature = Array.from(new Uint8Array(signatureBuffer))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('')

  return computedSignature === signature
}

// ─── Public key (for frontend widget) ───────────────────

export function getPublicKey() {
  return WOMPI_PUBLIC_KEY
}

export function getWompiEnvironment() {
  return WOMPI_ENV
}

// ─── Generate unique reference ───────────────────────────

export function generateReference(empresaId: string, tipo: string = 'sub') {
  const timestamp = Date.now()
  const shortId = empresaId.slice(0, 8)
  return `rentmies_${tipo}_${shortId}_${timestamp}`
}
