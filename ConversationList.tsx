// ============================================================
// RENTMIES — Módulo de Conversaciones
// components/conversations/ConversationList.tsx
// ============================================================

import React, { useState } from 'react';
import { Input } from '../ui/input';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import { ScrollArea } from '../ui/scroll-area';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '../ui/dialog';
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';
import { Popover, PopoverContent, PopoverTrigger } from '../ui/popover';
import { Calendar as CalendarComponent } from '../ui/calendar';
import { Switch } from '../ui/switch';
import {
  Search, Filter, Plus, Send, Calendar, X,
  MessageSquare, Bot, User, Instagram,
} from 'lucide-react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

import type { Conversation, ConversationFilters, Agent, IAAgent, Tag } from '../../types/conversations';
import { getWindowStatus, formatRelativeTime } from '../../lib/utils';

interface ConversationListProps {
  conversations: Conversation[];
  selectedId: number | null;
  filters: ConversationFilters;
  showFilters: boolean;
  agents: Agent[];
  iaAgents: IAAgent[];
  tags: Tag[];
  onSelect: (id: number) => void;
  onUpdateFilter: <K extends keyof ConversationFilters>(key: K, value: ConversationFilters[K]) => void;
  onResetFilters: () => void;
  onToggleFilters: () => void;
  onStartNewConversation: (phone: string, name: string, instructions: string) => boolean;
  onSetAllManual: (manual: boolean) => void;
}

export function ConversationList({
  conversations,
  selectedId,
  filters,
  showFilters,
  agents,
  iaAgents,
  tags,
  onSelect,
  onUpdateFilter,
  onResetFilters,
  onToggleFilters,
  onStartNewConversation,
  onSetAllManual,
}: ConversationListProps) {
  const [isNewConvOpen, setIsNewConvOpen] = useState(false);
  const [newPhone, setNewPhone] = useState('');
  const [newName, setNewName] = useState('');
  const [newInstructions, setNewInstructions] = useState('');
  const [globalManual, setGlobalManual] = useState(false);

  const handleCreateConversation = () => {
    const ok = onStartNewConversation(newPhone, newName, newInstructions);
    if (ok) {
      setIsNewConvOpen(false);
      setNewPhone('');
      setNewName('');
      setNewInstructions('');
    }
  };

  const handleGlobalManual = (val: boolean) => {
    setGlobalManual(val);
    onSetAllManual(val);
  };

  const activeFilterCount = [
    filters.channel !== 'all',
    filters.agentId !== 'all',
    filters.iaAgentId !== 'all',
    filters.stage !== 'all',
    filters.tagId !== 'all',
    filters.mode !== 'all',
    filters.alert !== 'all',
    filters.dateFrom || filters.dateTo,
  ].filter(Boolean).length;

  return (
    <div className="flex flex-col bg-white rounded-lg border border-brand-light-gray shadow-sm overflow-hidden h-full">
      {/* Header: Search + Actions */}
      <div className="p-3 md:p-4 border-b border-brand-light-gray flex-shrink-0 space-y-3">
        {/* Row 1: Search */}
        <div className="flex items-center gap-2">
          <Select value={filters.searchType} onValueChange={(v: any) => onUpdateFilter('searchType', v)}>
            <SelectTrigger className="w-24 h-9 text-xs bg-white flex-shrink-0">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todo</SelectItem>
              <SelectItem value="name">Nombre</SelectItem>
              <SelectItem value="phone">Teléfono</SelectItem>
              <SelectItem value="keyword">Palabras</SelectItem>
            </SelectContent>
          </Select>

          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Buscar..."
              value={filters.search}
              onChange={(e) => onUpdateFilter('search', e.target.value)}
              className="pl-9 bg-brand-medium-gray/50 border-0 text-sm h-9"
            />
            {filters.search && (
              <button
                onClick={() => onUpdateFilter('search', '')}
                className="absolute right-3 top-1/2 -translate-y-1/2"
              >
                <X className="w-3.5 h-3.5 text-muted-foreground hover:text-brand-black" />
              </button>
            )}
          </div>

          <Button
            variant="outline"
            size="sm"
            onClick={onToggleFilters}
            className={`relative flex-shrink-0 h-9 ${showFilters ? 'bg-brand-teal/10 border-brand-teal' : ''}`}
          >
            <Filter className="w-4 h-4" />
            {activeFilterCount > 0 && (
              <span className="absolute -top-1.5 -right-1.5 w-4 h-4 bg-brand-teal text-white text-[10px] rounded-full flex items-center justify-center font-medium">
                {activeFilterCount}
              </span>
            )}
          </Button>

          {/* New Conversation */}
          <Dialog open={isNewConvOpen} onOpenChange={setIsNewConvOpen}>
            <DialogTrigger asChild>
              <Button size="sm" className="bg-brand-teal hover:bg-brand-teal/90 text-white flex-shrink-0 h-9">
                <Plus className="w-4 h-4" />
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle>Iniciar nueva conversación</DialogTitle>
                <DialogDescription>
                  Ingresa los datos del contacto. La IA generará el primer mensaje.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-1.5">
                  <Label htmlFor="new-phone">Teléfono del contacto</Label>
                  <Input
                    id="new-phone"
                    placeholder="Ej: 573001234567"
                    value={newPhone}
                    onChange={(e) => setNewPhone(e.target.value)}
                  />
                  <p className="text-xs text-muted-foreground">Sin el símbolo +</p>
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="new-name">Nombre del contacto</Label>
                  <Input
                    id="new-name"
                    placeholder="Nombre completo"
                    value={newName}
                    onChange={(e) => setNewName(e.target.value)}
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="new-instructions">Instrucciones para la IA</Label>
                  <Textarea
                    id="new-instructions"
                    placeholder='Ej: "Saluda al cliente y preséntale el apartamento de 3 hab en el norte. Invítalo a agendar una visita."'
                    value={newInstructions}
                    onChange={(e) => setNewInstructions(e.target.value)}
                    className="min-h-[100px]"
                  />
                </div>
              </div>
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setIsNewConvOpen(false)}>Cancelar</Button>
                <Button
                  onClick={handleCreateConversation}
                  className="bg-brand-teal hover:bg-brand-teal/90 text-white"
                >
                  <Send className="w-4 h-4 mr-2" />
                  Enviar
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {/* Row 2: Global manual toggle */}
        <div className="flex items-center justify-between px-1">
          <div className="flex items-center gap-2">
            <Bot className="w-3.5 h-3.5 text-brand-teal" />
            <span className="text-xs text-muted-foreground">Modo global IA</span>
          </div>
          <div className="flex items-center gap-2">
            <span className={`text-xs font-medium ${globalManual ? 'text-brand-black' : 'text-muted-foreground'}`}>
              {globalManual ? 'Manual' : 'IA'}
            </span>
            <Switch
              checked={globalManual}
              onCheckedChange={handleGlobalManual}
              className="data-[state=checked]:bg-brand-teal"
            />
          </div>
        </div>

        {/* Filters panel */}
        {showFilters && (
          <div className="space-y-2 pt-3 border-t border-brand-light-gray">
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Filtros</span>
              <button
                onClick={onResetFilters}
                className="text-xs text-brand-teal hover:underline"
              >
                Limpiar todo
              </button>
            </div>

            <Select value={filters.channel as string} onValueChange={(v: any) => onUpdateFilter('channel', v)}>
              <SelectTrigger className="h-9 text-xs bg-white">
                <SelectValue placeholder="Canal" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos los canales</SelectItem>
                <SelectItem value="whatsapp">WhatsApp</SelectItem>
                <SelectItem value="instagram">Instagram</SelectItem>
              </SelectContent>
            </Select>

            <Select value={filters.agentId as string} onValueChange={(v: any) => onUpdateFilter('agentId', v === 'all' ? 'all' : v === 'unassigned' ? 'unassigned' : parseInt(v))}>
              <SelectTrigger className="h-9 text-xs bg-white">
                <SelectValue placeholder="Agente" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos los agentes</SelectItem>
                <SelectItem value="unassigned">Sin asignar (IA)</SelectItem>
                {agents.map((a) => (
                  <SelectItem key={a.id} value={a.id.toString()}>{a.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={filters.iaAgentId as string} onValueChange={(v: any) => onUpdateFilter('iaAgentId', v === 'all' ? 'all' : parseInt(v))}>
              <SelectTrigger className="h-9 text-xs bg-white">
                <SelectValue placeholder="Agente IA" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos los agentes IA</SelectItem>
                {iaAgents.map((a) => (
                  <SelectItem key={a.id} value={a.id.toString()}>{a.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={filters.stage as string} onValueChange={(v: any) => onUpdateFilter('stage', v)}>
              <SelectTrigger className="h-9 text-xs bg-white">
                <SelectValue placeholder="Etapa" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas las etapas</SelectItem>
                <SelectItem value="contacto-inicial">Contacto inicial</SelectItem>
                <SelectItem value="interesado">Interesado</SelectItem>
                <SelectItem value="cotizacion-enviada">Cotización enviada</SelectItem>
                <SelectItem value="cita-agendada">Cita agendada</SelectItem>
                <SelectItem value="cerrado">Cerrado</SelectItem>
              </SelectContent>
            </Select>

            <Select value={filters.tagId as string} onValueChange={(v: any) => onUpdateFilter('tagId', v === 'all' ? 'all' : parseInt(v))}>
              <SelectTrigger className="h-9 text-xs bg-white">
                <SelectValue placeholder="Etiqueta" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas las etiquetas</SelectItem>
                {tags.map((t) => (
                  <SelectItem key={t.id} value={t.id.toString()}>{t.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={filters.mode as string} onValueChange={(v: any) => onUpdateFilter('mode', v)}>
              <SelectTrigger className="h-9 text-xs bg-white">
                <SelectValue placeholder="Modo" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos los modos</SelectItem>
                <SelectItem value="ia">IA</SelectItem>
                <SelectItem value="manual">Manual</SelectItem>
              </SelectContent>
            </Select>

            <Select value={filters.alert as string} onValueChange={(v: any) => onUpdateFilter('alert', v)}>
              <SelectTrigger className="h-9 text-xs bg-white">
                <SelectValue placeholder="Alertas" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas las alertas</SelectItem>
                <SelectItem value="ultima-hora">Última hora para responder</SelectItem>
                <SelectItem value="requiere-plantilla">Requiere plantilla</SelectItem>
              </SelectContent>
            </Select>

            {/* Date range */}
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={`h-9 text-xs justify-start text-left font-normal bg-white w-full ${filters.dateFrom || filters.dateTo ? 'border-brand-teal' : ''}`}
                >
                  <Calendar className="mr-2 h-3.5 w-3.5 flex-shrink-0" />
                  <span className="truncate">
                    {filters.dateFrom
                      ? filters.dateTo
                        ? `${format(filters.dateFrom, 'dd MMM', { locale: es })} - ${format(filters.dateTo, 'dd MMM yyyy', { locale: es })}`
                        : format(filters.dateFrom, 'dd MMM yyyy', { locale: es })
                      : 'Rango de fechas'}
                  </span>
                  {(filters.dateFrom || filters.dateTo) && (
                    <X
                      className="ml-auto h-3 w-3 hover:text-destructive"
                      onClick={(e) => {
                        e.stopPropagation();
                        onUpdateFilter('dateFrom', undefined);
                        onUpdateFilter('dateTo', undefined);
                      }}
                    />
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <CalendarComponent
                  mode="range"
                  selected={{ from: filters.dateFrom, to: filters.dateTo }}
                  onSelect={(range: any) => {
                    onUpdateFilter('dateFrom', range?.from);
                    onUpdateFilter('dateTo', range?.to);
                  }}
                  numberOfMonths={1}
                  locale={es}
                />
              </PopoverContent>
            </Popover>
          </div>
        )}
      </div>

      {/* Count */}
      <div className="px-4 py-2 flex items-center justify-between flex-shrink-0 border-b border-brand-light-gray">
        <span className="text-xs text-muted-foreground">
          {conversations.length} conversación{conversations.length !== 1 ? 'es' : ''}
        </span>
      </div>

      {/* List */}
      <ScrollArea className="flex-1">
        <div className="p-1.5 space-y-0.5">
          {conversations.length === 0 ? (
            <div className="text-center py-16">
              <MessageSquare className="w-10 h-10 text-gray-300 mx-auto mb-3" />
              <p className="text-sm text-muted-foreground">No hay conversaciones</p>
              {activeFilterCount > 0 && (
                <button onClick={onResetFilters} className="text-xs text-brand-teal mt-2 hover:underline">
                  Limpiar filtros
                </button>
              )}
            </div>
          ) : (
            conversations.map((conv) => (
              <ConversationItem
                key={conv.id}
                conversation={conv}
                isSelected={selectedId === conv.id}
                onSelect={() => onSelect(conv.id)}
              />
            ))
          )}
        </div>
      </ScrollArea>
    </div>
  );
}

// ─── Individual conversation row ─────────────────────────

function ConversationItem({
  conversation: conv,
  isSelected,
  onSelect,
}: {
  conversation: Conversation;
  isSelected: boolean;
  onSelect: () => void;
}) {
  const ws = getWindowStatus(conv.lastClientResponse);

  return (
    <div
      onClick={onSelect}
      className={`p-3 rounded-lg cursor-pointer transition-all border-2 ${
        isSelected
          ? 'bg-gray-100 border-gray-300'
          : conv.appointmentDate
          ? 'bg-brand-teal/10 border-brand-teal hover:bg-brand-teal/20'
          : 'hover:bg-brand-medium-gray/50 border-transparent'
      }`}
    >
      <div className="flex items-start gap-3">
        {/* Avatar */}
        <div className="relative flex-shrink-0">
          <Avatar className="w-10 h-10">
            <AvatarImage src={conv.avatar} />
            <AvatarFallback className="bg-brand-medium-gray text-brand-black text-sm font-medium">
              {conv.customerName.split(' ').map((n) => n[0]).slice(0, 2).join('')}
            </AvatarFallback>
          </Avatar>
          {/* Channel badge */}
          <div className="absolute -bottom-0.5 -right-0.5">
            <ChannelBadge channel={conv.channel} />
          </div>
          {/* Window status dot */}
          {ws.dotColor && (
            <span className={`absolute -top-0.5 -left-0.5 w-3 h-3 rounded-full border-2 border-white ${ws.dotColor}`} />
          )}
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-2 mb-0.5">
            <p className="font-medium text-sm text-brand-black truncate">{conv.customerName}</p>
            <div className="flex items-center gap-1.5 flex-shrink-0">
              {conv.unread > 0 && (
                <span className="w-5 h-5 bg-brand-teal text-white text-[10px] rounded-full flex items-center justify-center font-medium">
                  {conv.unread}
                </span>
              )}
              <span className="text-[11px] text-muted-foreground">{formatRelativeTime(conv.timestamp)}</span>
            </div>
          </div>

          <p className="text-xs text-muted-foreground truncate mb-1.5">{conv.lastMessage}</p>

          <div className="flex items-center gap-1.5 flex-wrap">
            {/* Mode badge */}
            <span className={`inline-flex items-center gap-1 text-[10px] px-1.5 py-0.5 rounded font-medium ${
              conv.mode === 'ia'
                ? 'bg-brand-teal/10 text-brand-teal'
                : 'bg-brand-medium-gray text-brand-black'
            }`}>
              {conv.mode === 'ia' ? <Bot className="w-2.5 h-2.5" /> : <User className="w-2.5 h-2.5" />}
              {conv.mode === 'ia' ? 'IA' : 'Manual'}
            </span>

            {/* Window alert */}
            {ws.label && (
              <span className={`inline-flex items-center text-[10px] px-1.5 py-0.5 rounded font-medium ${
                ws.dotColor === 'bg-amber-500' ? 'bg-amber-50 text-amber-600' : 'bg-blue-50 text-blue-600'
              }`}>
                {ws.label}
              </span>
            )}

            {/* First tag */}
            {conv.tags[0] && (
              <span className="text-[10px] px-1.5 py-0.5 rounded bg-brand-medium-gray text-brand-black">
                {conv.tags[0]}
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function ChannelBadge({ channel }: { channel: string }) {
  if (channel === 'whatsapp') {
    return (
      <div className="w-4 h-4 rounded-full bg-[#25D366] flex items-center justify-center">
        <svg viewBox="0 0 24 24" fill="white" className="w-2.5 h-2.5">
          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" />
        </svg>
      </div>
    );
  }
  return (
    <div className="w-4 h-4 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
      <Instagram className="w-2 h-2 text-white" />
    </div>
  );
}
