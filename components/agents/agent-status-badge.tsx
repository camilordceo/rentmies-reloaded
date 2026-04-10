'use client'

interface AgentStatusBadgeProps {
  activo: boolean
}

export function AgentStatusBadge({ activo }: AgentStatusBadgeProps) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-medium ${
        activo
          ? 'bg-[#40d99d]/10 text-[#40d99d]'
          : 'bg-[#f0f0f0] text-[#6b7280]'
      }`}
    >
      <span
        className={`w-1.5 h-1.5 rounded-full ${activo ? 'bg-[#40d99d]' : 'bg-[#6b7280]'}`}
      />
      {activo ? 'Activo' : 'Inactivo'}
    </span>
  )
}
