'use client'

interface AgentStatusBadgeProps {
  activo: boolean
}

export function AgentStatusBadge({ activo }: AgentStatusBadgeProps) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${
        activo
          ? 'bg-brand-teal/10 text-brand-teal'
          : 'bg-surface-container text-on-surface/50'
      }`}
    >
      <span
        className={`w-1.5 h-1.5 rounded-full ${activo ? 'bg-brand-teal' : 'bg-on-surface/30'}`}
      />
      {activo ? 'Activo' : 'Inactivo'}
    </span>
  )
}
