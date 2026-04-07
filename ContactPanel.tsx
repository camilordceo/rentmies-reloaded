// ============================================================
// RENTMIES — Módulo de Conversaciones
// components/conversations/ContactPanel.tsx
// ============================================================

import React, { useState } from 'react';
import { ScrollArea } from '../ui/scroll-area';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '../ui/collapsible';
import { Popover, PopoverContent, PopoverTrigger } from '../ui/popover';
import { Calendar as CalendarComponent } from '../ui/calendar';
import { Label } from '../ui/label';
import {
  User, MapPin, DollarSign, Home, Building2,
  Calendar, Clock, ChevronDown, ChevronRight,
  Phone, Mail, Tag, X, Plus, CheckCircle2,
  Bot, UserCircle,
} from 'lucide-react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

import type { Conversation, Agent, IAAgent, Tag as TagType, CRMStage } from '../../types/conversations';
import { CRM_STAGES } from '../../lib/mock-data';
import { formatTime12h, parseTime12h, formatTime24h } from '../../lib/utils';

interface ContactPanelProps {
  conversation: Conversation;
  agents: Agent[];
  iaAgents: IAAgent[];
  tags: TagType[];
  onUpdateCRMStage: (convId: number, stage: CRMStage) => void;
  onUpdateAppointment: (convId: number, date: Date | undefined, time: string) => void;
  onAddTag: (convId: number, tagName: string) => void;
  onRemoveTag: (convId: number, tagName: string) => void;
}

export function ContactPanel({
  conversation: conv,
  agents,
  iaAgents,
  tags,
  onUpdateCRMStage,
  onUpdateAppointment,
  onAddTag,
  onRemoveTag,
}: ContactPanelProps) {
  const [openSections, setOpenSections] = useState<Set<string>>(
    new Set(['lead', 'crm', 'appointment'])
  );
  const [selectedTag, setSelectedTag] = useState('');

  // Appointment time state
  const parsedTime = parseTime12h(conv.appointmentTime);
  const [apptHour, setApptHour] = useState(parsedTime.hour);
  const [apptMinute, setApptMinute] = useState(parsedTime.minute);
  const [apptPeriod, setApptPeriod] = useState(parsedTime.period);

  const toggle = (key: string) => {
    setOpenSections((prev) => {
      const next = new Set(prev);
      next.has(key) ? next.delete(key) : next.add(key);
      return next;
    });
  };

  const handleApptDateChange = (date: Date | undefined) => {
    const time = formatTime24h(apptHour, apptMinute, apptPeriod);
    onUpdateAppointment(conv.id, date, time);
  };

  const handleApptTimeChange = (h: string, m: string, p: string) => {
    setApptHour(h);
    setApptMinute(m);
    setApptPeriod(p);
    if (conv.appointmentDate) {
      onUpdateAppointment(conv.id, conv.appointmentDate, formatTime24h(h, m, p));
    }
  };

  const assignedAgent = agents.find((a) => a.id === conv.agentId);
  const assignedIAAgent = iaAgents.find((a) => a.id === conv.iaAgentId);
  const availableTagsToAdd = tags
    .map((t) => t.name)
    .filter((name) => !conv.tags.includes(name));

  return (
    <ScrollArea className="h-full">
      <div className="p-4 space-y-2">
        {/* ─── Lead Info ─────────────────────────────────── */}
        <Section
          id="lead"
          label="Información del lead"
          icon={<User className="w-3.5 h-3.5" />}
          isOpen={openSections.has('lead')}
          onToggle={() => toggle('lead')}
        >
          <div className="space-y-2.5">
            <InfoRow icon={<Phone className="w-3 h-3" />} label="Teléfono" value={conv.phone} />
            {conv.email && <InfoRow icon={<Mail className="w-3 h-3" />} label="Email" value={conv.email} />}
            {conv.location && <InfoRow icon={<MapPin className="w-3 h-3" />} label="Ciudad" value={conv.location} />}
            {conv.businessType && <InfoRow icon={<Building2 className="w-3 h-3" />} label="Tipo de negocio" value={conv.businessType} />}
            {conv.propertyInterest && <InfoRow icon={<Home className="w-3 h-3" />} label="Interés" value={conv.propertyInterest} />}
            {conv.budget && <InfoRow icon={<DollarSign className="w-3 h-3" />} label="Presupuesto" value={conv.budget} />}
            {conv.portal && <InfoRow icon={<Building2 className="w-3 h-3" />} label="Portal" value={conv.portal} />}
          </div>
        </Section>

        {/* ─── Agent ─────────────────────────────────────── */}
        <Section
          id="agent"
          label="Agente asignado"
          icon={<UserCircle className="w-3.5 h-3.5" />}
          isOpen={openSections.has('agent')}
          onToggle={() => toggle('agent')}
        >
          {conv.mode === 'ia' ? (
            <div className="flex items-center gap-2 p-2 bg-brand-teal/5 rounded-lg">
              <Bot className="w-4 h-4 text-brand-teal flex-shrink-0" />
              <div>
                <p className="text-xs font-medium text-brand-teal">Modo IA activo</p>
                {assignedIAAgent && (
                  <p className="text-[11px] text-muted-foreground">{assignedIAAgent.name}</p>
                )}
              </div>
            </div>
          ) : assignedAgent ? (
            <div className="flex items-center gap-2 p-2 bg-brand-medium-gray/30 rounded-lg">
              <div className="w-7 h-7 rounded-full bg-brand-teal/10 flex items-center justify-center flex-shrink-0">
                <span className="text-[10px] font-semibold text-brand-teal">{assignedAgent.avatar}</span>
              </div>
              <div>
                <p className="text-xs font-medium text-brand-black">{assignedAgent.name}</p>
                <p className="text-[11px] text-muted-foreground">Agente inmobiliario</p>
              </div>
            </div>
          ) : (
            <p className="text-xs text-muted-foreground py-1">Sin asignar</p>
          )}
        </Section>

        {/* ─── CRM Stage ─────────────────────────────────── */}
        <Section
          id="crm"
          label="Etapa CRM"
          icon={<CheckCircle2 className="w-3.5 h-3.5" />}
          isOpen={openSections.has('crm')}
          onToggle={() => toggle('crm')}
        >
          <Select
            value={conv.crmStage}
            onValueChange={(v) => onUpdateCRMStage(conv.id, v as CRMStage)}
          >
            <SelectTrigger className="h-8 text-xs bg-white">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {CRM_STAGES.map((s) => (
                <SelectItem key={s.id} value={s.id} className="text-xs">
                  {s.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </Section>

        {/* ─── Appointment ───────────────────────────────── */}
        <Section
          id="appointment"
          label="Cita agendada"
          icon={<Calendar className="w-3.5 h-3.5" />}
          isOpen={openSections.has('appointment')}
          onToggle={() => toggle('appointment')}
        >
          <div className="space-y-2">
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  className={`w-full justify-start text-xs h-8 ${conv.appointmentDate ? 'border-brand-teal text-brand-black' : ''}`}
                >
                  <Calendar className="w-3.5 h-3.5 mr-2 flex-shrink-0" />
                  {conv.appointmentDate
                    ? format(conv.appointmentDate, "d 'de' MMMM, yyyy", { locale: es })
                    : 'Seleccionar fecha'}
                  {conv.appointmentDate && (
                    <X
                      className="ml-auto w-3 h-3 text-muted-foreground hover:text-destructive"
                      onClick={(e) => {
                        e.stopPropagation();
                        onUpdateAppointment(conv.id, undefined, '');
                      }}
                    />
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <CalendarComponent
                  mode="single"
                  selected={conv.appointmentDate}
                  onSelect={handleApptDateChange}
                  locale={es}
                />
              </PopoverContent>
            </Popover>

            {conv.appointmentDate && (
              <div className="flex items-center gap-2">
                <Clock className="w-3.5 h-3.5 text-muted-foreground flex-shrink-0" />
                <Select value={apptHour} onValueChange={(v) => handleApptTimeChange(v, apptMinute, apptPeriod)}>
                  <SelectTrigger className="h-7 text-xs flex-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Array.from({ length: 12 }, (_, i) => (i + 1).toString().padStart(2, '0')).map((h) => (
                      <SelectItem key={h} value={h} className="text-xs">{h}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <span className="text-xs">:</span>
                <Select value={apptMinute} onValueChange={(v) => handleApptTimeChange(apptHour, v, apptPeriod)}>
                  <SelectTrigger className="h-7 text-xs flex-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {['00', '15', '30', '45'].map((m) => (
                      <SelectItem key={m} value={m} className="text-xs">{m}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Select value={apptPeriod} onValueChange={(v) => handleApptTimeChange(apptHour, apptMinute, v)}>
                  <SelectTrigger className="h-7 text-xs w-16">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="AM" className="text-xs">AM</SelectItem>
                    <SelectItem value="PM" className="text-xs">PM</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}
          </div>
        </Section>

        {/* ─── Tags ──────────────────────────────────────── */}
        <Section
          id="tags"
          label="Etiquetas"
          icon={<Tag className="w-3.5 h-3.5" />}
          isOpen={openSections.has('tags')}
          onToggle={() => toggle('tags')}
        >
          <div className="space-y-2">
            <div className="flex flex-wrap gap-1.5">
              {conv.tags.map((tagName) => {
                const tag = tags.find((t) => t.name === tagName);
                return (
                  <span
                    key={tagName}
                    className={`inline-flex items-center gap-1 text-[11px] px-2 py-0.5 rounded-full border font-medium ${tag?.color ?? 'bg-gray-100 text-gray-700 border-gray-200'}`}
                  >
                    {tagName}
                    <button onClick={() => onRemoveTag(conv.id, tagName)} className="ml-0.5 hover:opacity-70">
                      <X className="w-2.5 h-2.5" />
                    </button>
                  </span>
                );
              })}
              {conv.tags.length === 0 && (
                <p className="text-xs text-muted-foreground">Sin etiquetas</p>
              )}
            </div>

            {availableTagsToAdd.length > 0 && (
              <div className="flex gap-1.5">
                <Select value={selectedTag} onValueChange={setSelectedTag}>
                  <SelectTrigger className="h-7 text-xs flex-1">
                    <SelectValue placeholder="Agregar..." />
                  </SelectTrigger>
                  <SelectContent>
                    {availableTagsToAdd.map((name) => (
                      <SelectItem key={name} value={name} className="text-xs">{name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Button
                  size="sm"
                  variant="outline"
                  className="h-7 px-2"
                  onClick={() => {
                    if (selectedTag) {
                      onAddTag(conv.id, selectedTag);
                      setSelectedTag('');
                    }
                  }}
                  disabled={!selectedTag}
                >
                  <Plus className="w-3 h-3" />
                </Button>
              </div>
            )}
          </div>
        </Section>

        {/* ─── Consulted properties ──────────────────────── */}
        {conv.consultedProperties.length > 0 && (
          <Section
            id="properties"
            label="Propiedades consultadas"
            icon={<Home className="w-3.5 h-3.5" />}
            isOpen={openSections.has('properties')}
            onToggle={() => toggle('properties')}
          >
            <div className="flex flex-wrap gap-1.5">
              {conv.consultedProperties.map((code) => (
                <span
                  key={code}
                  className="text-[11px] px-2 py-0.5 bg-brand-medium-gray rounded font-mono text-brand-black"
                >
                  {code}
                </span>
              ))}
            </div>
          </Section>
        )}
      </div>
    </ScrollArea>
  );
}

// ─── Collapsible section wrapper ─────────────────────────

function Section({
  id, label, icon, isOpen, onToggle, children,
}: {
  id: string;
  label: string;
  icon: React.ReactNode;
  isOpen: boolean;
  onToggle: () => void;
  children: React.ReactNode;
}) {
  return (
    <Collapsible open={isOpen} onOpenChange={onToggle}>
      <CollapsibleTrigger className="flex items-center justify-between w-full p-2.5 rounded-lg hover:bg-brand-medium-gray/40 transition-colors group">
        <div className="flex items-center gap-2">
          <span className="text-muted-foreground group-hover:text-brand-teal transition-colors">{icon}</span>
          <span className="text-xs font-semibold text-brand-black">{label}</span>
        </div>
        {isOpen
          ? <ChevronDown className="w-3.5 h-3.5 text-muted-foreground" />
          : <ChevronRight className="w-3.5 h-3.5 text-muted-foreground" />}
      </CollapsibleTrigger>
      <CollapsibleContent>
        <div className="px-2.5 pb-3 pt-1">{children}</div>
      </CollapsibleContent>
    </Collapsible>
  );
}

// ─── Info row ─────────────────────────────────────────────

function InfoRow({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="flex items-start gap-2">
      <span className="text-muted-foreground mt-0.5 flex-shrink-0">{icon}</span>
      <div className="min-w-0">
        <p className="text-[10px] text-muted-foreground uppercase tracking-wide leading-tight">{label}</p>
        <p className="text-xs text-brand-black break-words">{value}</p>
      </div>
    </div>
  );
}
