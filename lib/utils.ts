import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatRelativeTime(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date
  const diff = Date.now() - d.getTime()
  const minutes = Math.floor(diff / 60_000)
  const hours = Math.floor(minutes / 60)
  const days = Math.floor(hours / 24)

  if (minutes < 1) return 'Ahora'
  if (minutes < 60) return `${minutes}min`
  if (hours < 24) return `${hours}h`
  if (days === 1) return 'Ayer'
  return d.toLocaleDateString('es-ES', { day: 'numeric', month: 'short' })
}

export type WindowStatus = 'open' | 'warning' | 'closed'

export function getWindowStatus(lastClientResponse: Date | string | null): {
  status: WindowStatus
  label: string
  dotColor: string
  bannerDesc?: string
} {
  if (!lastClientResponse) return { status: 'open', label: '', dotColor: '' }

  const d =
    typeof lastClientResponse === 'string'
      ? new Date(lastClientResponse)
      : lastClientResponse
  const diffHours = (Date.now() - d.getTime()) / (1000 * 60 * 60)

  if (diffHours < 23) {
    return { status: 'open', label: '', dotColor: '' }
  }
  if (diffHours < 24) {
    return {
      status: 'warning',
      label: 'Última hora para responder',
      dotColor: 'bg-amber-500',
    }
  }
  return {
    status: 'closed',
    label: 'Requiere plantilla',
    dotColor: 'bg-blue-500',
    bannerDesc:
      'Han pasado más de 24 horas desde el último mensaje del cliente. Debes usar una plantilla aprobada para reactivar esta conversación.',
  }
}

export function formatTime12h(time24: string): string {
  if (!time24) return ''
  const [h, m] = time24.split(':')
  let hour = parseInt(h)
  const period = hour >= 12 ? 'PM' : 'AM'
  if (hour === 0) hour = 12
  else if (hour > 12) hour -= 12
  return `${hour}:${m} ${period}`
}

export function parseTime12h(time24: string) {
  if (!time24) return { hour: '09', minute: '00', period: 'AM' }
  const [hourStr, minuteStr] = time24.split(':')
  let hour = parseInt(hourStr)
  const period = hour >= 12 ? 'PM' : 'AM'
  if (hour === 0) hour = 12
  else if (hour > 12) hour -= 12
  return { hour: hour.toString().padStart(2, '0'), minute: minuteStr || '00', period }
}

export function formatTime24h(hour: string, minute: string, period: string): string {
  let h = parseInt(hour)
  if (period === 'PM' && h !== 12) h += 12
  if (period === 'AM' && h === 12) h = 0
  return `${h.toString().padStart(2, '0')}:${minute}`
}

export function interpolateTemplate(
  template: string,
  variables: Record<string, string>
): string {
  let result = template
  for (const [key, value] of Object.entries(variables)) {
    result = result.replaceAll(`{${key}}`, value || `{${key}}`)
  }
  return result
}

export function formatCurrency(value: string | number, currency = 'COP'): string {
  const num = typeof value === 'string' ? parseFloat(value) : value
  if (isNaN(num)) return String(value)
  return new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency,
    maximumFractionDigits: 0,
  }).format(num)
}

export function normalizePhone(phone: string): string {
  return phone.replace(/[^\d]/g, '')
}

export function formatPhone(phone: string): string {
  const digits = normalizePhone(phone)
  if (digits.startsWith('57') && digits.length === 12) {
    return `+57 ${digits.slice(2, 5)} ${digits.slice(5, 8)} ${digits.slice(8)}`
  }
  return `+${digits}`
}

export function formatDate(date: string | Date): string {
  return new Date(date).toLocaleDateString('es-CO', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  })
}

export function formatDateTime(date: string | Date): string {
  return new Date(date).toLocaleString('es-CO', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  })
}

export function getInitials(name: string): string {
  return name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((n) => n[0]?.toUpperCase() || '')
    .join('')
}

export function truncate(str: string, maxLen: number): string {
  if (str.length <= maxLen) return str
  return str.slice(0, maxLen) + '...'
}
