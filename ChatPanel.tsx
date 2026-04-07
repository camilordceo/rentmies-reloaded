// ============================================================
// RENTMIES — Módulo de Conversaciones
// components/conversations/ChatPanel.tsx
// ============================================================

import React, { useState, useRef, useEffect } from 'react';
import { ScrollArea } from '../ui/scroll-area';
import { Input } from '../ui/input';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import { Textarea } from '../ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../ui/dialog';
import { Label } from '../ui/label';
import {
  Send, Phone, Bot, User, ChevronLeft,
  Paperclip, Smile, Mic, Play, Pause,
  FileText, Download, AlertTriangle, Sparkles,
  MoreVertical,
} from 'lucide-react';
import { Switch } from '../ui/switch';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

import type { Conversation, Message, Agent, IAAgent } from '../../types/conversations';
import type { TemplatesByCategory, TemplateCategory } from '../../types/conversations';
import { getWindowStatus, interpolateTemplate } from '../../lib/utils';
import { MOCK_TEMPLATES, TEMPLATE_VARIABLE_LABELS } from '../../lib/mock-data';

interface ChatPanelProps {
  conversation: Conversation;
  messages: Message[];
  agents: Agent[];
  iaAgents: IAAgent[];
  onSendMessage: (text: string) => void;
  onSendTemplate: (text: string) => void;
  onToggleMode: (id: number) => void;
  onAssignAgent: (convId: number, agentId: number | null) => void;
  onBack: () => void;
}

export function ChatPanel({
  conversation,
  messages,
  agents,
  iaAgents,
  onSendMessage,
  onSendTemplate,
  onToggleMode,
  onAssignAgent,
  onBack,
}: ChatPanelProps) {
  const [input, setInput] = useState('');
  const [isTemplateOpen, setIsTemplateOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<TemplateCategory | ''>('');
  const [selectedTemplateId, setSelectedTemplateId] = useState('');
  const [templateVars, setTemplateVars] = useState<Record<string, string>>({});
  const [playingId, setPlayingId] = useState<number | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  const ws = getWindowStatus(conversation.lastClientResponse);
  const isWindowClosed = ws.status === 'closed';

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = () => {
    if (!input.trim()) return;
    onSendMessage(input.trim());
    setInput('');
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const currentTemplates = selectedCategory ? MOCK_TEMPLATES[selectedCategory] ?? [] : [];
  const currentTemplate = currentTemplates.find((t) => t.id === selectedTemplateId);
  const previewMessage = currentTemplate
    ? interpolateTemplate(currentTemplate.message, templateVars)
    : '';

  const canSendTemplate =
    !!currentTemplate &&
    (currentTemplate.variables.length === 0 ||
      currentTemplate.variables.every((v) => !!templateVars[v]?.trim()));

  const handleSendTemplateConfirm = () => {
    if (!canSendTemplate) return;
    onSendTemplate(previewMessage);
    setIsTemplateOpen(false);
    setSelectedCategory('');
    setSelectedTemplateId('');
    setTemplateVars({});
  };

  return (
    <div className="flex flex-col bg-white rounded-lg border border-brand-light-gray shadow-sm overflow-hidden h-full">
      {/* Header */}
      <div className="p-3 border-b border-brand-light-gray flex-shrink-0">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="sm" className="md:hidden p-1 h-auto" onClick={onBack}>
            <ChevronLeft className="w-5 h-5" />
          </Button>

          <Avatar className="w-9 h-9 flex-shrink-0">
            <AvatarImage src={conversation.avatar} />
            <AvatarFallback className="bg-brand-medium-gray text-brand-black text-sm font-medium">
              {conversation.customerName.split(' ').map((n) => n[0]).slice(0, 2).join('')}
            </AvatarFallback>
          </Avatar>

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <p className="font-medium text-sm text-brand-black truncate">{conversation.customerName}</p>
              <StageBadge stage={conversation.stage} />
            </div>
            <p className="text-xs text-muted-foreground">{conversation.phone}</p>
          </div>

          {/* Mode toggle */}
          <div className="flex items-center gap-2 flex-shrink-0">
            <span className="text-xs text-muted-foreground hidden sm:block">
              {conversation.mode === 'ia' ? 'IA' : 'Manual'}
            </span>
            <Switch
              checked={conversation.mode === 'manual'}
              onCheckedChange={() => onToggleMode(conversation.id)}
              className="data-[state=checked]:bg-brand-teal"
            />
            {conversation.mode === 'ia' ? (
              <Bot className="w-4 h-4 text-brand-teal" />
            ) : (
              <User className="w-4 h-4 text-brand-black" />
            )}
          </div>

          {/* Agent select */}
          <Select
            value={conversation.agentId?.toString() ?? 'none'}
            onValueChange={(v) => onAssignAgent(conversation.id, v === 'none' ? null : parseInt(v))}
          >
            <SelectTrigger className="w-32 h-8 text-xs flex-shrink-0">
              <SelectValue placeholder="Asignar" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="none">Sin asignar</SelectItem>
              {agents.map((a) => (
                <SelectItem key={a.id} value={a.id.toString()}>{a.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* 24h window banner */}
      {ws.status !== 'open' && (
        <div className={`px-4 py-2.5 flex-shrink-0 ${
          ws.status === 'warning' ? 'bg-amber-50 border-b border-amber-200' : 'bg-blue-50 border-b border-blue-200'
        }`}>
          <div className="flex items-start gap-2">
            <AlertTriangle className={`w-4 h-4 mt-0.5 flex-shrink-0 ${ws.status === 'warning' ? 'text-amber-600' : 'text-blue-600'}`} />
            <div>
              <p className={`text-xs font-medium ${ws.status === 'warning' ? 'text-amber-700' : 'text-blue-700'}`}>
                {ws.label}
              </p>
              {ws.bannerDesc && (
                <p className="text-xs text-blue-600 mt-0.5">{ws.bannerDesc}</p>
              )}
            </div>
            {isWindowClosed && (
              <Button
                size="sm"
                variant="outline"
                className="ml-auto flex-shrink-0 h-7 text-xs border-blue-300 text-blue-700 hover:bg-blue-100"
                onClick={() => setIsTemplateOpen(true)}
              >
                <Sparkles className="w-3 h-3 mr-1" />
                Plantilla
              </Button>
            )}
          </div>
        </div>
      )}

      {/* Messages */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-3">
        {messages.length === 0 ? (
          <div className="h-full flex items-center justify-center">
            <p className="text-sm text-muted-foreground">No hay mensajes aún</p>
          </div>
        ) : (
          messages.map((msg) => (
            <MessageBubble
              key={msg.id}
              message={msg}
              isPlaying={playingId === msg.id}
              onToggleAudio={(id) => setPlayingId((prev) => (prev === id ? null : id))}
            />
          ))
        )}
      </div>

      {/* Input */}
      <div className="p-3 border-t border-brand-light-gray flex-shrink-0">
        {isWindowClosed ? (
          <div className="text-center py-3">
            <p className="text-xs text-muted-foreground mb-2">La ventana de 24h está cerrada</p>
            <Button
              onClick={() => setIsTemplateOpen(true)}
              className="bg-brand-teal hover:bg-brand-teal/90 text-white text-sm"
            >
              <Sparkles className="w-4 h-4 mr-2" />
              Usar plantilla para reactivar
            </Button>
          </div>
        ) : (
          <div className="flex items-end gap-2">
            <div className="flex items-center gap-1 flex-shrink-0">
              <button className="p-1.5 hover:bg-brand-medium-gray rounded-md text-muted-foreground hover:text-brand-black transition-colors">
                <Paperclip className="w-4 h-4" />
              </button>
              <button className="p-1.5 hover:bg-brand-medium-gray rounded-md text-muted-foreground hover:text-brand-black transition-colors">
                <Smile className="w-4 h-4" />
              </button>
              <button className="p-1.5 hover:bg-brand-medium-gray rounded-md text-muted-foreground hover:text-brand-black transition-colors">
                <Mic className="w-4 h-4" />
              </button>
            </div>

            <Textarea
              placeholder={conversation.mode === 'ia' ? 'IA está respondiendo automáticamente...' : 'Escribe un mensaje...'}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              disabled={conversation.mode === 'ia'}
              className="flex-1 min-h-[40px] max-h-[120px] resize-none text-sm"
              rows={1}
            />

            <div className="flex items-center gap-1 flex-shrink-0">
              <Button
                size="sm"
                variant="outline"
                onClick={() => setIsTemplateOpen(true)}
                className="h-9 px-2 text-xs"
                title="Usar plantilla"
              >
                <Sparkles className="w-3.5 h-3.5" />
              </Button>
              <Button
                onClick={handleSend}
                disabled={!input.trim() || conversation.mode === 'ia'}
                className="h-9 bg-brand-teal hover:bg-brand-teal/90 text-white"
              >
                <Send className="w-4 h-4" />
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Template Dialog */}
      <Dialog open={isTemplateOpen} onOpenChange={setIsTemplateOpen}>
        <DialogContent className="max-w-2xl h-[80vh] flex flex-col">
          <DialogHeader>
            <DialogTitle>Seleccionar plantilla</DialogTitle>
          </DialogHeader>
          <div className="flex gap-4 flex-1 min-h-0">
            {/* Categories */}
            <div className="w-44 flex-shrink-0 space-y-1">
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">Categoría</p>
              {(Object.keys(MOCK_TEMPLATES) as TemplateCategory[]).map((cat) => (
                <button
                  key={cat}
                  onClick={() => { setSelectedCategory(cat); setSelectedTemplateId(''); setTemplateVars({}); }}
                  className={`w-full text-left text-xs px-3 py-2 rounded-lg transition-all ${
                    selectedCategory === cat
                      ? 'bg-brand-teal/10 text-brand-teal font-medium'
                      : 'hover:bg-brand-medium-gray/50 text-brand-black'
                  }`}
                >
                  {CATEGORY_LABELS[cat]}
                </button>
              ))}
            </div>

            {/* Template list */}
            <div className="flex-1 flex flex-col min-w-0 border-l border-brand-light-gray pl-4 space-y-1 overflow-y-auto">
              {!selectedCategory ? (
                <div className="flex items-center justify-center h-full">
                  <p className="text-sm text-muted-foreground">Selecciona una categoría</p>
                </div>
              ) : (
                currentTemplates.map((t) => (
                  <div
                    key={t.id}
                    onClick={() => {
                      setSelectedTemplateId(t.id);
                      const initial: Record<string, string> = {};
                      t.variables.forEach((v) => { initial[v] = templateVars[v] ?? ''; });
                      setTemplateVars(initial);
                    }}
                    className={`p-3 rounded-lg border-2 cursor-pointer transition-all ${
                      selectedTemplateId === t.id
                        ? 'border-brand-teal bg-brand-teal/5'
                        : 'border-brand-light-gray hover:border-brand-teal/50'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2 mb-1.5">
                      <p className="font-medium text-sm">{t.name}</p>
                      {t.variables.length > 0 && (
                        <Badge className="bg-purple-100 text-purple-700 border-purple-200 text-xs">
                          {t.variables.length} var
                        </Badge>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground line-clamp-2">{t.message}</p>
                  </div>
                ))
              )}
            </div>

            {/* Preview + variables */}
            <div className="w-56 flex-shrink-0 border-l border-brand-light-gray pl-4 flex flex-col overflow-y-auto">
              {!currentTemplate ? (
                <div className="flex items-center justify-center h-full">
                  <p className="text-xs text-muted-foreground text-center">Selecciona una plantilla</p>
                </div>
              ) : (
                <div className="space-y-4">
                  <div>
                    <p className="text-xs font-semibold mb-2">Vista previa</p>
                    <div className="p-3 bg-brand-medium-gray/30 rounded-lg text-xs whitespace-pre-wrap leading-relaxed">
                      {previewMessage}
                    </div>
                  </div>

                  {currentTemplate.variables.length > 0 && (
                    <div className="space-y-3">
                      <p className="text-xs font-semibold">Variables</p>
                      {currentTemplate.variables.map((v) => (
                        <div key={v} className="space-y-1">
                          <Label className="text-xs">{TEMPLATE_VARIABLE_LABELS[v] ?? v}</Label>
                          <Input
                            value={templateVars[v] ?? ''}
                            onChange={(e) => setTemplateVars((prev) => ({ ...prev, [v]: e.target.value }))}
                            className="h-8 text-xs"
                            placeholder={TEMPLATE_VARIABLE_LABELS[v]}
                          />
                        </div>
                      ))}
                    </div>
                  )}

                  <Button
                    onClick={handleSendTemplateConfirm}
                    disabled={!canSendTemplate}
                    className="w-full bg-brand-teal hover:bg-brand-teal/90 text-white text-sm"
                  >
                    <Send className="w-3.5 h-3.5 mr-2" />
                    Enviar
                  </Button>
                </div>
              )}
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// ─── Message bubble ───────────────────────────────────────

function MessageBubble({
  message: msg,
  isPlaying,
  onToggleAudio,
}: {
  message: Message;
  isPlaying: boolean;
  onToggleAudio: (id: number) => void;
}) {
  const isIncoming = msg.sender === 'customer';

  return (
    <div className={`flex ${isIncoming ? 'justify-start' : 'justify-end'}`}>
      <div className={`max-w-[75%] ${isIncoming ? '' : 'items-end'} flex flex-col gap-1`}>
        {/* Sender label */}
        {(msg.sender === 'ia' || msg.sender === 'agent') && (
          <div className={`flex items-center gap-1 ${isIncoming ? '' : 'justify-end'}`}>
            {msg.sender === 'ia' ? (
              <><Bot className="w-3 h-3 text-brand-teal" /><span className="text-[10px] text-brand-teal font-medium">IA</span></>
            ) : (
              <><User className="w-3 h-3 text-brand-black" /><span className="text-[10px] text-brand-black font-medium">Agente</span></>
            )}
          </div>
        )}

        {/* Bubble */}
        <div className={`rounded-2xl px-3.5 py-2.5 ${
          isIncoming
            ? 'bg-brand-medium-gray text-brand-black rounded-tl-sm'
            : msg.sender === 'ia'
            ? 'bg-brand-teal/15 text-brand-black rounded-tr-sm'
            : 'bg-brand-black text-white rounded-tr-sm'
        }`}>
          {msg.type === 'text' && (
            <p className="text-sm whitespace-pre-wrap leading-relaxed">{msg.text}</p>
          )}

          {msg.type === 'audio' && (
            <div className="flex items-center gap-2.5">
              <button
                onClick={() => onToggleAudio(msg.id)}
                className={`w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 ${
                  isIncoming ? 'bg-brand-teal text-white' : msg.sender === 'ia' ? 'bg-brand-teal text-white' : 'bg-white/20 text-white'
                }`}
              >
                {isPlaying ? <Pause className="w-3 h-3" /> : <Play className="w-3 h-3 ml-0.5" />}
              </button>
              <div className="flex gap-px items-end h-6">
                {Array.from({ length: 20 }).map((_, i) => (
                  <div
                    key={i}
                    className={`w-0.5 rounded-full ${isIncoming ? 'bg-brand-teal/50' : 'bg-current opacity-50'}`}
                    style={{ height: `${Math.random() * 16 + 4}px` }}
                  />
                ))}
              </div>
              <span className="text-xs opacity-70">{msg.duration}</span>
            </div>
          )}

          {msg.type === 'document' && (
            <div className="flex items-center gap-2.5">
              <div className={`w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0 ${
                isIncoming ? 'bg-brand-teal/20' : 'bg-white/20'
              }`}>
                <FileText className="w-5 h-5" />
              </div>
              <div className="min-w-0">
                <p className="text-xs font-medium truncate">{msg.fileName}</p>
                <p className="text-[11px] opacity-60">{msg.fileSize}</p>
              </div>
              <button className={`p-1.5 rounded-md flex-shrink-0 ${isIncoming ? 'hover:bg-brand-teal/10' : 'hover:bg-white/10'}`}>
                <Download className="w-3.5 h-3.5" />
              </button>
            </div>
          )}
        </div>

        {/* Timestamp */}
        <span className={`text-[10px] text-muted-foreground px-1 ${isIncoming ? '' : 'text-right'}`}>
          {format(msg.timestamp, 'HH:mm', { locale: es })}
        </span>
      </div>
    </div>
  );
}

// ─── Stage badge ──────────────────────────────────────────

const STAGE_CONFIG = {
  'contacto-inicial': { label: 'Contacto inicial', className: 'bg-gray-100 text-gray-600 border-gray-200' },
  'interesado': { label: 'Interesado', className: 'bg-blue-100 text-blue-700 border-blue-200' },
  'cotizacion-enviada': { label: 'Cotización enviada', className: 'bg-purple-100 text-purple-700 border-purple-200' },
  'cita-agendada': { label: 'Cita agendada', className: 'bg-orange-100 text-orange-700 border-orange-200' },
  'cerrado': { label: 'Cerrado', className: 'bg-teal-100 text-teal-700 border-teal-200' },
} as const;

function StageBadge({ stage }: { stage: string }) {
  const cfg = STAGE_CONFIG[stage as keyof typeof STAGE_CONFIG] ?? STAGE_CONFIG['contacto-inicial'];
  return (
    <Badge className={`text-[10px] px-1.5 py-0 h-4 border ${cfg.className}`}>
      {cfg.label}
    </Badge>
  );
}

// ─── Category labels ──────────────────────────────────────

const CATEGORY_LABELS: Record<TemplateCategory, string> = {
  'retomar-conversacion': 'Retomar conversación',
  'preguntar-interes': 'Preguntar interés',
  'confirmar-visita': 'Confirmar visita',
  'modificar-visita': 'Modificar visita',
  'inmueble-alternativo': 'Inmueble alternativo',
};
