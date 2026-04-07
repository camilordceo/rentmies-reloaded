// ============================================================
// RENTMIES — Módulo de Conversaciones
// components/conversations/Conversaciones.tsx
//
// Componente principal. Orquesta los 3 paneles:
//   1. ConversationList  — lista izquierda
//   2. ChatPanel         — chat central
//   3. ContactPanel      — info del lead (derecha)
//
// También incluye las tabs de Etiquetas y Bloqueados.
// ============================================================

import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Badge } from '../ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import { ScrollArea } from '../ui/scroll-area';
import { MessageSquare, Tag, Ban, Plus, Trash2, X, UserX } from 'lucide-react';
import { toast } from 'sonner';

import { useConversations } from '../../hooks/useConversations';
import { ConversationList } from './ConversationList';
import { ChatPanel } from './ChatPanel';
import { ContactPanel } from './ContactPanel';
import type { CRMStage } from '../../types/conversations';

export function Conversaciones() {
  const [mainTab, setMainTab] = useState('conversaciones');
  const [newTagName, setNewTagName] = useState('');

  const {
    conversations,
    messages,
    tags,
    agents,
    iaAgents,
    selected,
    selectedId,
    filters,
    showFilters,
    showMobileChat,
    selectConversation,
    setShowMobileChat,
    setShowFilters,
    sendMessage,
    sendTemplate,
    toggleMode,
    setAllManual,
    assignAgent,
    updateCRMStage,
    updateAppointment,
    addTag,
    removeTag,
    createTag,
    deleteTag,
    startNewConversation,
    updateFilter,
    resetFilters,
  } = useConversations();

  const handleCreateTag = () => {
    if (!newTagName.trim()) {
      toast.error('Ingresa un nombre para la etiqueta');
      return;
    }
    const ok = createTag(newTagName.trim());
    if (ok) {
      toast.success(`Etiqueta "${newTagName}" creada`);
      setNewTagName('');
    }
  };

  return (
    <div className="h-[calc(100vh-120px)] md:h-[calc(100vh-140px)] flex flex-col">
      {/* ─── Main tabs ─────────────────────────────────── */}
      <div className="mb-4 flex-shrink-0">
        <div className="bg-brand-medium-gray/30 rounded-xl p-1">
          {/* Mobile: Select */}
          <div className="md:hidden">
            <Select value={mainTab} onValueChange={setMainTab}>
              <SelectTrigger className="w-full h-11 bg-white border-2 border-brand-teal rounded-lg">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="conversaciones">Conversaciones</SelectItem>
                <SelectItem value="etiquetas">Etiquetas</SelectItem>
                <SelectItem value="bloqueados">Bloqueados</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Desktop: Tabs */}
          <TabsList className="hidden md:grid w-full grid-cols-3 bg-transparent border-0 p-0 h-auto gap-1">
            {[
              { value: 'conversaciones', label: 'Conversaciones', icon: MessageSquare },
              { value: 'etiquetas', label: 'Etiquetas', icon: Tag },
              { value: 'bloqueados', label: 'Bloqueados', icon: Ban },
            ].map(({ value, label, icon: Icon }) => (
              <button
                key={value}
                onClick={() => setMainTab(value)}
                className={`flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg transition-all border-2 text-sm font-medium ${
                  mainTab === value
                    ? 'bg-white text-brand-black shadow-md border-brand-teal'
                    : 'bg-transparent text-gray-600 border-transparent hover:text-brand-black hover:bg-white/50'
                }`}
              >
                <Icon className="w-4 h-4" />
                {label}
              </button>
            ))}
          </TabsList>
        </div>
      </div>

      {/* ─── Conversaciones tab ────────────────────────── */}
      {mainTab === 'conversaciones' && (
        <div className="flex-1 flex gap-3 min-h-0">
          {/* Left: List */}
          <div className={`${showMobileChat ? 'hidden md:flex' : 'flex'} flex-col w-full md:w-80 lg:w-96 flex-shrink-0`}>
            <ConversationList
              conversations={conversations}
              selectedId={selectedId}
              filters={filters}
              showFilters={showFilters}
              agents={agents}
              iaAgents={iaAgents}
              tags={tags}
              onSelect={(id) => {
                selectConversation(id);
                toast.dismiss(); // clear any pending toasts
              }}
              onUpdateFilter={updateFilter}
              onResetFilters={resetFilters}
              onToggleFilters={() => setShowFilters(!showFilters)}
              onStartNewConversation={(phone, name, instructions) => {
                const ok = startNewConversation(phone, name, instructions);
                if (ok) toast.success('Conversación iniciada');
                else toast.error('Completa todos los campos');
                return ok;
              }}
              onSetAllManual={(manual) => {
                setAllManual(manual);
                toast.success(`Modo ${manual ? 'Manual' : 'IA'} activado para todas las conversaciones`);
              }}
            />
          </div>

          {/* Center: Chat */}
          <div className={`${showMobileChat ? 'flex' : 'hidden md:flex'} flex-1 min-w-0 flex-col`}>
            {selected ? (
              <ChatPanel
                conversation={selected}
                messages={messages}
                agents={agents}
                iaAgents={iaAgents}
                onSendMessage={(text) => {
                  sendMessage(text);
                  toast.success('Mensaje enviado');
                }}
                onSendTemplate={(text) => {
                  sendTemplate(text);
                  toast.success('Plantilla enviada', { description: 'Conversación reactivada' });
                }}
                onToggleMode={(id) => {
                  toggleMode(id);
                  const conv = conversations.find((c) => c.id === id);
                  toast.success(`Modo cambiado a ${conv?.mode === 'ia' ? 'Manual' : 'IA'}`);
                }}
                onAssignAgent={(id, agentId) => {
                  assignAgent(id, agentId);
                  toast.success(agentId ? 'Agente asignado' : 'Agente removido');
                }}
                onBack={() => setShowMobileChat(false)}
              />
            ) : (
              <div className="flex-1 flex items-center justify-center bg-white rounded-lg border border-brand-light-gray shadow-sm">
                <div className="text-center">
                  <MessageSquare className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                  <p className="text-sm text-muted-foreground font-medium">Selecciona una conversación</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Elige una conversación de la lista para verla aquí
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Right: Contact info */}
          {selected && (
            <div className={`${showMobileChat ? 'hidden lg:flex' : 'hidden'} lg:flex flex-col w-64 xl:w-72 flex-shrink-0 bg-white rounded-lg border border-brand-light-gray shadow-sm`}>
              <div className="px-4 py-3 border-b border-brand-light-gray flex-shrink-0">
                <p className="text-xs font-semibold text-brand-black">Detalle del lead</p>
              </div>
              <div className="flex-1 min-h-0">
                <ContactPanel
                  conversation={selected}
                  agents={agents}
                  iaAgents={iaAgents}
                  tags={tags}
                  onUpdateCRMStage={(id, stage) => {
                    updateCRMStage(id, stage);
                    toast.success('Etapa CRM actualizada');
                  }}
                  onUpdateAppointment={(id, date, time) => {
                    updateAppointment(id, date, time);
                    toast.success('Cita actualizada');
                  }}
                  onAddTag={(id, name) => {
                    addTag(id, name);
                    toast.success(`Etiqueta "${name}" agregada`);
                  }}
                  onRemoveTag={(id, name) => {
                    removeTag(id, name);
                    toast.success(`Etiqueta "${name}" eliminada`);
                  }}
                />
              </div>
            </div>
          )}
        </div>
      )}

      {/* ─── Etiquetas tab ─────────────────────────────── */}
      {mainTab === 'etiquetas' && (
        <div className="flex-1 bg-white rounded-lg border border-brand-light-gray shadow-sm overflow-hidden">
          <div className="p-4 border-b border-brand-light-gray flex items-center justify-between">
            <div>
              <h2 className="text-sm font-semibold text-brand-black">Etiquetas</h2>
              <p className="text-xs text-muted-foreground mt-0.5">
                Organiza tus conversaciones con etiquetas personalizadas
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Input
                placeholder="Nueva etiqueta..."
                value={newTagName}
                onChange={(e) => setNewTagName(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleCreateTag()}
                className="h-8 text-sm w-40"
              />
              <Button
                size="sm"
                onClick={handleCreateTag}
                className="bg-brand-teal hover:bg-brand-teal/90 text-white h-8"
              >
                <Plus className="w-3.5 h-3.5 mr-1" />
                Crear
              </Button>
            </div>
          </div>
          <ScrollArea className="flex-1 h-[calc(100%-65px)]">
            <div className="p-4 space-y-2">
              {tags.length === 0 ? (
                <div className="text-center py-12">
                  <Tag className="w-10 h-10 text-gray-300 mx-auto mb-3" />
                  <p className="text-sm text-muted-foreground">No hay etiquetas</p>
                </div>
              ) : (
                tags.map((tag) => (
                  <div
                    key={tag.id}
                    className="flex items-center justify-between p-3 border border-brand-light-gray rounded-lg hover:border-brand-teal/50 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <span className={`text-xs px-2.5 py-1 rounded-full border font-medium ${tag.color}`}>
                        {tag.name}
                      </span>
                      <span className="text-xs text-muted-foreground">{tag.count} conversaciones</span>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-7 w-7 p-0 hover:bg-red-50 hover:text-red-600"
                      onClick={() => {
                        deleteTag(tag.id);
                        toast.success(`Etiqueta "${tag.name}" eliminada`);
                      }}
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </Button>
                  </div>
                ))
              )}
            </div>
          </ScrollArea>
        </div>
      )}

      {/* ─── Bloqueados tab ────────────────────────────── */}
      {mainTab === 'bloqueados' && (
        <div className="flex-1 bg-white rounded-lg border border-brand-light-gray shadow-sm overflow-hidden">
          <div className="p-4 border-b border-brand-light-gray">
            <h2 className="text-sm font-semibold text-brand-black">Contactos bloqueados</h2>
            <p className="text-xs text-muted-foreground mt-0.5">
              Contactos que no pueden iniciar nuevas conversaciones
            </p>
          </div>
          <ScrollArea className="h-[calc(100%-65px)]">
            <div className="p-4">
              <div className="text-center py-12">
                <UserX className="w-10 h-10 text-gray-300 mx-auto mb-3" />
                <p className="text-sm text-muted-foreground">No hay contactos bloqueados</p>
              </div>
            </div>
          </ScrollArea>
        </div>
      )}
    </div>
  );
}
