/**
 * Parses property references (URLs + codes) out of EMA's chat replies so the
 * frontend can render them as clickable chips and inline cards.
 *
 * Server-safe (no 'use client'): used by both the API route and the chat UI.
 */

export type ReferenceSource =
  | 'fincaraiz'
  | 'metrocuadrado'
  | 'mc-inline'
  | 'domus'
  | 'generic'

export interface ParsedReference {
  code: string
  source: ReferenceSource
  matchText: string
  start: number
  end: number
}

export function parseReferencesFromText(text: string): ParsedReference[] {
  if (!text) return []
  const found: ParsedReference[] = []

  function scan(re: RegExp, source: ReferenceSource, codeGroup = 1) {
    re.lastIndex = 0
    let m: RegExpExecArray | null
    while ((m = re.exec(text)) !== null) {
      found.push({
        code: m[codeGroup],
        source,
        matchText: m[0],
        start: m.index,
        end: m.index + m[0].length,
      })
    }
  }

  // URL-based — these win over inline (greedy, more specific)
  scan(/https?:\/\/(?:www\.)?fincaraiz\.com\.co\/[^\s"')>]*\/(\d{6,12})/gi, 'fincaraiz')
  scan(/https?:\/\/(?:www\.)?metrocuadrado\.com\/[^\s"')>]*\/(\d{4,6}-M\d+)/gi, 'metrocuadrado')
  scan(/https?:\/\/(?:www\.)?metrocuadrado\.com\/[^\s"')>]*\/(\d{5,10})\b/gi, 'metrocuadrado')

  // Inline patterns
  scan(/\b(\d{4,6}-M\d+)\b/gi, 'mc-inline')
  scan(/(?:c[oó]digo|cod\.|ref\.?|#)\s*:?\s*(\d{4,12})\b/gi, 'generic')

  // Sort by position, drop overlaps (URL match wins because it's added first
  // at the same span; we then dedupe by start range).
  found.sort((a, b) => a.start - b.start || b.end - a.end)
  const result: ParsedReference[] = []
  const seenCodes = new Set<string>()
  let lastEnd = -1
  for (const r of found) {
    if (r.start < lastEnd) continue
    if (seenCodes.has(r.code)) continue
    result.push(r)
    seenCodes.add(r.code)
    lastEnd = r.end
  }
  return result
}

export type TextSegment =
  | { type: 'text'; content: string }
  | { type: 'ref'; ref: ParsedReference }

export function splitTextWithReferences(
  text: string,
  refs: ParsedReference[]
): TextSegment[] {
  if (!refs.length) return [{ type: 'text', content: text }]
  const sorted = [...refs].sort((a, b) => a.start - b.start)
  const segments: TextSegment[] = []
  let cursor = 0
  for (const ref of sorted) {
    if (ref.start > cursor) {
      segments.push({ type: 'text', content: text.slice(cursor, ref.start) })
    }
    segments.push({ type: 'ref', ref })
    cursor = ref.end
  }
  if (cursor < text.length) {
    segments.push({ type: 'text', content: text.slice(cursor) })
  }
  return segments
}

const SOURCE_LABELS: Record<ReferenceSource, string> = {
  fincaraiz: 'FR',
  metrocuadrado: 'MC',
  'mc-inline': 'MC',
  domus: 'D',
  generic: '#',
}

export function labelForSource(source: ReferenceSource): string {
  return SOURCE_LABELS[source]
}
