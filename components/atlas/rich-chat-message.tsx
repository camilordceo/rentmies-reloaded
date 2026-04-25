'use client'
import { useMemo } from 'react'
import {
  parseReferencesFromText,
  splitTextWithReferences,
  labelForSource,
  type ParsedReference,
} from '@/lib/atlas-message-parser'
import type { AtlasProperty } from '@/store/atlas-store'
import { InlinePropertyCard } from './inline-property-card'

interface RichChatMessageProps {
  role: 'user' | 'assistant'
  text: string
  properties?: AtlasProperty[]
  references?: ParsedReference[]
  onPropertyClick: (p: AtlasProperty) => void
  onCodeClick: (code: string) => void
}

export function RichChatMessage({
  role,
  text,
  properties = [],
  references,
  onPropertyClick,
  onCodeClick,
}: RichChatMessageProps) {
  // Parse references on the client if backend didn't send them
  const refs = useMemo(
    () => references ?? (role === 'assistant' ? parseReferencesFromText(text) : []),
    [text, references, role]
  )

  const segments = useMemo(() => splitTextWithReferences(text, refs), [text, refs])

  // Limit inline cards in chat to keep the panel scannable
  const inlineCards = properties.slice(0, 3)

  if (role === 'user') {
    return (
      <div
        style={{
          fontSize: 12,
          color: 'rgba(255,255,255,0.85)',
          fontWeight: 500,
          lineHeight: 1.45,
          textAlign: 'right',
          background: 'rgba(64,217,157,0.14)',
          padding: '8px 11px',
          borderRadius: 12,
          alignSelf: 'flex-end',
          maxWidth: '88%',
          marginLeft: 'auto',
        }}
      >
        {text}
      </div>
    )
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
      <div
        style={{
          fontSize: 14,
          color: '#fff',
          fontWeight: 500,
          lineHeight: 1.5,
          letterSpacing: '-0.005em',
        }}
      >
        {segments.map((seg, i) =>
          seg.type === 'text' ? (
            <span key={i}>{seg.content}</span>
          ) : (
            <CodeChip key={i} ref={seg.ref} onClick={() => onCodeClick(seg.ref.code)} />
          )
        )}
      </div>

      {inlineCards.length > 0 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          {inlineCards.map((p) => (
            <InlinePropertyCard key={p.id} property={p} onClick={() => onPropertyClick(p)} />
          ))}
          {properties.length > inlineCards.length && (
            <div
              style={{
                fontSize: 9,
                color: 'rgba(64,217,157,0.7)',
                fontWeight: 600,
                letterSpacing: '0.06em',
                textTransform: 'uppercase',
                paddingLeft: 4,
              }}
            >
              +{properties.length - inlineCards.length} más en el catálogo →
            </div>
          )}
        </div>
      )}
    </div>
  )
}

function CodeChip({ ref, onClick }: { ref: ParsedReference; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      title={`Abrir ${ref.code}`}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 3,
        padding: '1px 6px',
        margin: '0 1px',
        borderRadius: 6,
        background: 'rgba(64,217,157,0.18)',
        border: '1px solid rgba(64,217,157,0.4)',
        color: '#4fffb4',
        fontSize: 11,
        fontWeight: 700,
        cursor: 'pointer',
        verticalAlign: 'baseline',
        fontFamily: 'inherit',
        transition: 'all .15s',
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.background = 'rgba(64,217,157,0.3)'
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.background = 'rgba(64,217,157,0.18)'
      }}
    >
      <span style={{ fontSize: 8, opacity: 0.7 }}>{labelForSource(ref.source)}</span>
      <span>{ref.code}</span>
      <span style={{ fontSize: 9, opacity: 0.6 }}>↗</span>
    </button>
  )
}
