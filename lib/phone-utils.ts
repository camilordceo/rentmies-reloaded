/**
 * Normalize a phone number to digits only (no +, spaces, dashes).
 * Input: "+57 300 123-4567" → "573001234567"
 */
export function normalizePhone(phone: string): string {
  return phone.replace(/[^\d]/g, '')
}

/**
 * Format a phone number for Callbell (must start with +).
 * Input: "573001234567" → "+573001234567"
 */
export function formatForCallbell(phone: string): string {
  const digits = normalizePhone(phone)
  return digits.startsWith('+') ? digits : `+${digits}`
}
