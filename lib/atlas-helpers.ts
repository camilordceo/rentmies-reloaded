// Server-safe helpers — no 'use client', importable from API routes and client components

export interface AtlasPropertyLike {
  id?: string | null
  descripcion?: string | null
  ubicacion?: string | null
  ciudad?: string | null
  tipo_inmueble?: string | null
  tipo_negocio?: string | null
  habitaciones?: number | null
  parqueaderos?: number | null
  estrato?: number | null
  tags?: string[]
  mood?: string
}

export function fmtCOP(n: number | null | undefined): string {
  if (n == null) return '—'
  return '$' + Math.round(n).toLocaleString('es-CO')
}

export function deriveMood(p: AtlasPropertyLike): string {
  const d = (p.descripcion ?? '').toLowerCase()
  const u = (p.ubicacion ?? '').toLowerCase()
  if (d.includes('penthouse') || d.includes('ático')) return 'Penthouse · Altura'
  if (d.includes('loft') || d.includes('industrial')) return 'Industrial · Loft'
  if (d.includes('colonial') || d.includes('tradicional')) return 'Clásico · Colonial'
  if ((p.habitaciones ?? 0) >= 4) return 'Familiar · Amplio'
  if (d.includes('piscina') || d.includes('club')) return 'Club · Piscina'
  if (u.includes('chapinero') || u.includes('usaquén') || u.includes('laureles')) return 'Barrio · Caminable'
  if (p.tipo_inmueble === 'Apartamento') return 'Luminoso · Contemporáneo'
  if (p.tipo_inmueble === 'Casa') return 'Casa · Jardín'
  return 'Moderno · Diseño'
}

export function deriveTags(p: AtlasPropertyLike): string[] {
  const d = (p.descripcion ?? '').toLowerCase()
  const tags: string[] = []
  if (d.includes('piscina')) tags.push('Piscina')
  if (d.includes('terraza') || d.includes('balcón')) tags.push('Terraza')
  if (d.includes('amoblado') || d.includes('amueblado')) tags.push('Amoblado')
  if (d.includes('gym') || d.includes('gimnasio')) tags.push('Gym')
  if (d.includes('home office') || d.includes('estudio')) tags.push('Home office')
  if (d.includes('pet') || d.includes('mascota')) tags.push('Pet friendly')
  if (d.includes('vigilancia') || d.includes('seguridad')) tags.push('Vigilancia 24h')
  if ((p.parqueaderos ?? 0) > 0) tags.push('Parqueadero')
  if ((p.estrato ?? 0) >= 5) tags.push(`Estrato ${p.estrato}`)
  if (tags.length === 0 && p.tipo_negocio === 'Venta') tags.push('Off-market')
  return tags.slice(0, 4)
}

export function computeMatchScore(
  p: AtlasPropertyLike,
  intents: string[]
): number {
  const jitter = p.id
    ? (p.id.charCodeAt(0) + p.id.charCodeAt(p.id.length - 1)) % 20
    : 10
  if (intents.length === 0) return 70 + jitter
  const text = [p.descripcion, p.ubicacion, p.ciudad, ...(p.tags ?? []), p.mood]
    .join(' ')
    .toLowerCase()
  const hits = intents.filter((it) => text.includes(it.toLowerCase())).length
  const base = Math.round((hits / intents.length) * 35)
  return Math.min(99, 60 + base + (jitter % 8))
}
