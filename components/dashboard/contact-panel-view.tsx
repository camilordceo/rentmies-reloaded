'use client'

import { useState } from 'react'
import {
  User, MapPin, DollarSign, Home, Building2,
  Calendar, Clock, ChevronDown, ChevronRight,
  Phone, Mail, CheckCircle2, ChevronLeft,
} from 'lucide-react'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'
import type { ConversationWithContact, Contact } from '@/lib/types'

const CRM_STAGES = [
  { id: 'lead-nuevo', name: 'Lead Nuevo' },
  { id: 'calificado', name: 'Calificado' },
  { id: 'propuesta', name: 'Propuesta' },
  { id: 'negociacion', name: 'Negociación' },
  { id: 'ganado', name: 'Ganado' },
  { id: 'perdido', name: 'Perdido' },
]

interface ContactPanelViewProps {
  conversation: ConversationWithContact
  contacts: Contact[]
  onUpdateCRMStage: (convId: string, stage: string) => void
  onUpdateAppointment: (convId: string, date: Date | undefined, time: string) => void
  onBack: () => void
}

export function ContactPanelView({
  conversation: conv,
  onUpdateCRMStage,
  onUpdateAppointment,
  onBack,
}: ContactPanelViewProps) {
  const [openSections, setOpenSections] = useState<Set<string>>(
    new Set(['lead', 'crm', 'appointment'])
  )

  const contact = conv.contacts

  const toggle = (key: string) => {
    setOpenSections((prev) => {
      const next = new Set(prev)
      next.has(key) ? next.delete(key) : next.add(key)
      return next
    })
  }

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="p-3 border-b border-[#e5e5e5] flex items-center gap-2 flex-shrink-0">
        <button
          className="lg:hidden p-1.5 hover:bg-[#f0f0f0] rounded-lg transition-colors"
          onClick={onBack}
        >
          <ChevronLeft className="w-4 h-4 text-[#6b7280]" />
        </button>
        <h3 className="text-sm font-medium text-[#1a1a1a]">Información del contacto</h3>
      </div>

      {/* Scrollable content */}
      <div className="flex-1 overflow-y-auto p-3 space-y-1">
        {/* Lead info */}
        <Section
          id="lead"
          label="Lead"
          icon={<User className="w-3.5 h-3.5" />}
          isOpen={openSections.has('lead')}
          onToggle={() => toggle('lead')}
        >
          <div className="space-y-2.5">
            {contact?.phone && (
              <InfoRow icon={<Phone className="w-3 h-3" />} label="Teléfono" value={contact.phone} />
            )}
            {contact?.email && (
              <InfoRow icon={<Mail className="w-3 h-3" />} label="Email" value={contact.email} />
            )}
            {contact?.location && (
              <InfoRow icon={<MapPin className="w-3 h-3" />} label="Ciudad" value={contact.location} />
            )}
            {conv.business_type && (
              <InfoRow icon={<Building2 className="w-3 h-3" />} label="Negocio" value={conv.business_type} />
            )}
            {conv.property_interest && (
              <InfoRow icon={<Home className="w-3 h-3" />} label="Interés" value={conv.property_interest} />
            )}
            {conv.budget && (
              <InfoRow icon={<DollarSign className="w-3 h-3" />} label="Presupuesto" value={conv.budget} />
            )}
            {conv.portal && (
              <InfoRow icon={<Building2 className="w-3 h-3" />} label="Portal" value={conv.portal} />
            )}
          </div>
        </Section>

        {/* CRM Stage */}
        <Section
          id="crm"
          label="Etapa CRM"
          icon={<CheckCircle2 className="w-3.5 h-3.5" />}
          isOpen={openSections.has('crm')}
          onToggle={() => toggle('crm')}
        >
          <select
            value={conv.crm_stage ?? 'lead-nuevo'}
            onChange={(e) => onUpdateCRMStage(conv.id, e.target.value)}
            className="w-full h-8 px-2.5 text-xs rounded-lg border border-[#e5e5e5] bg-white text-[#1a1a1a] focus:outline-none focus:border-[#40d99d] focus:ring-1 focus:ring-[#40d99d]"
          >
            {CRM_STAGES.map((s) => (
              <option key={s.id} value={s.id}>{s.name}</option>
            ))}
          </select>
        </Section>

        {/* Appointment */}
        <Section
          id="appointment"
          label="Cita agendada"
          icon={<Calendar className="w-3.5 h-3.5" />}
          isOpen={openSections.has('appointment')}
          onToggle={() => toggle('appointment')}
        >
          {conv.appointment_date ? (
            <div className="space-y-1.5">
              <div className="flex items-center gap-2 p-2 bg-[#40d99d]/10 rounded-lg">
                <Calendar className="w-3.5 h-3.5 text-[#40d99d] flex-shrink-0" />
                <div>
                  <p className="text-xs font-medium text-[#1a1a1a]">
                    {format(new Date(conv.appointment_date), "d 'de' MMMM, yyyy", { locale: es })}
                  </p>
                  {conv.appointment_time && (
                    <p className="text-[11px] text-[#6b7280] flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {conv.appointment_time}
                    </p>
                  )}
                </div>
              </div>
              <button
                onClick={() => onUpdateAppointment(conv.id, undefined, '')}
                className="text-xs text-red-500 hover:underline"
              >
                Cancelar cita
              </button>
            </div>
          ) : (
            <p className="text-xs text-[#6b7280]">Sin cita agendada</p>
          )}
        </Section>

        {/* Consulted properties */}
        {conv.consulted_properties?.length > 0 && (
          <Section
            id="properties"
            label="Propiedades consultadas"
            icon={<Home className="w-3.5 h-3.5" />}
            isOpen={openSections.has('properties')}
            onToggle={() => toggle('properties')}
          >
            <div className="flex flex-wrap gap-1.5">
              {conv.consulted_properties.map((code: string) => (
                <span
                  key={code}
                  className="text-[11px] px-2 py-0.5 bg-[#f0f0f0] rounded font-mono text-[#1a1a1a]"
                >
                  {code}
                </span>
              ))}
            </div>
          </Section>
        )}
      </div>
    </div>
  )
}

function Section({
  id, label, icon, isOpen, onToggle, children,
}: {
  id: string
  label: string
  icon: React.ReactNode
  isOpen: boolean
  onToggle: () => void
  children: React.ReactNode
}) {
  return (
    <div className="border border-[#e5e5e5] rounded-lg overflow-hidden">
      <button
        onClick={onToggle}
        className="flex items-center justify-between w-full px-3 py-2.5 hover:bg-[#f8f8f8] transition-colors"
      >
        <div className="flex items-center gap-2">
          <span className="text-[#6b7280]">{icon}</span>
          <span className="text-xs font-medium text-[#1a1a1a]">{label}</span>
        </div>
        {isOpen
          ? <ChevronDown className="w-3.5 h-3.5 text-[#6b7280]" />
          : <ChevronRight className="w-3.5 h-3.5 text-[#6b7280]" />}
      </button>
      {isOpen && (
        <div className="px-3 pb-3 pt-1">
          {children}
        </div>
      )}
    </div>
  )
}

function InfoRow({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="flex items-start gap-2">
      <span className="text-[#6b7280] mt-0.5 flex-shrink-0">{icon}</span>
      <div className="min-w-0">
        <p className="text-[10px] text-[#6b7280] uppercase tracking-wide">{label}</p>
        <p className="text-xs text-[#1a1a1a] break-words">{value}</p>
      </div>
    </div>
  )
}
