'use client'

import { useEffect } from 'react'
import { usePortalAgent } from '@/store/portal-agent-store'
import { usePortalChat } from '@/lib/hooks/use-portal-chat'
import { PortalTopBar } from './portal-top-bar'
import { PortalSideNav } from './portal-side-nav'
import { CinematicCanvas } from './cinematic-canvas'
import { ConciergePanel } from './concierge-panel'
import { SchedulingOverlay } from './scheduling-overlay'
import type { PropertyItem } from '@/store/portal-agent-store'

interface PortalV2Props {
  empresa: { id: string; nombre: string; ciudad: string | null }
  featuredProperties: PropertyItem[]
}

export function PortalV2({ empresa, featuredProperties }: PortalV2Props) {
  const { sendMessage } = usePortalChat(empresa.id)
  const schedulingProperty = usePortalAgent((s) => s.schedulingProperty)
  const setVoiceState = usePortalAgent((s) => s.setVoiceState)

  // Reset voice state to idle when processing completes
  const isProcessing = usePortalAgent((s) => s.isProcessing)
  useEffect(() => {
    if (!isProcessing) {
      setVoiceState('idle')
    }
  }, [isProcessing, setVoiceState])

  return (
    <div className="flex flex-col h-full">
      {/* Top bar */}
      <PortalTopBar empresaNombre={empresa.nombre} ciudad={empresa.ciudad} />

      {/* Body: side-nav + canvas + concierge panel */}
      <div className="flex flex-1 min-h-0">
        <PortalSideNav />

        <CinematicCanvas
          empresaNombre={empresa.nombre}
          featuredProperties={featuredProperties}
        />

        <ConciergePanel onSend={sendMessage} />
      </div>

      {/* Scheduling modal — rendered at root so it overlays everything */}
      {schedulingProperty && <SchedulingOverlay />}
    </div>
  )
}
