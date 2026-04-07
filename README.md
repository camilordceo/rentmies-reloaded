# Rentmies — Módulo de Conversaciones

Módulo limpio y estructurado para conectar APIs fácilmente.

## Estructura

```
src/
├── types/
│   └── conversations.ts      ← Todos los TypeScript types/interfaces
│
├── lib/
│   ├── mock-data.ts           ← Datos de prueba (reemplazar por API calls)
│   └── utils.ts               ← Funciones puras (filtros, formateo, etc.)
│
├── hooks/
│   └── useConversations.ts    ← Estado + acciones centralizadas
│
└── components/conversations/
    ├── Conversaciones.tsx     ← Componente principal (entry point)
    ├── ConversationList.tsx   ← Panel izquierdo: lista + filtros
    ├── ChatPanel.tsx          ← Panel central: mensajes + input
    └── ContactPanel.tsx       ← Panel derecho: info lead + CRM
```

## Cómo conectar la API

Todos los puntos de integración están marcados con `// TODO:` en el código.

### 1. Reemplazar datos mock → `lib/mock-data.ts`

```ts
// ANTES (mock)
export const MOCK_CONVERSATIONS = [...];

// DESPUÉS (API real con React Query)
export async function fetchConversations(): Promise<Conversation[]> {
  const res = await fetch('/api/conversations');
  return res.json();
}
```

### 2. Reemplazar acciones en el hook → `hooks/useConversations.ts`

Cada acción tiene un comentario con el endpoint:

```ts
const sendMessage = useCallback((text: string) => {
  // TODO: POST /conversations/:id/messages { text }
  //
  // Con React Query:
  // sendMessageMutation.mutate({ conversationId: selectedId, text })
  ...
}, [selectedId]);
```

### 3. Recomendación: usar React Query

```bash
npm install @tanstack/react-query
```

```ts
// hooks/useConversations.ts con React Query
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

export function useConversations() {
  const queryClient = useQueryClient();

  const { data: conversations = [] } = useQuery({
    queryKey: ['conversations'],
    queryFn: fetchConversations,
    refetchInterval: 5000, // polling cada 5s (o usar WebSocket)
  });

  const sendMessageMutation = useMutation({
    mutationFn: ({ id, text }: { id: number; text: string }) =>
      fetch(`/api/conversations/${id}/messages`, {
        method: 'POST',
        body: JSON.stringify({ text }),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['conversations'] });
    },
  });

  ...
}
```

## Endpoints esperados de la API

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| GET | `/conversations` | Lista de conversaciones |
| GET | `/conversations/:id/messages` | Mensajes de una conversación |
| POST | `/conversations` | Crear nueva conversación |
| POST | `/conversations/:id/messages` | Enviar mensaje de texto |
| POST | `/conversations/:id/templates` | Enviar plantilla (reactivar) |
| PUT | `/conversations/:id/mode` | Cambiar modo IA/Manual |
| PUT | `/conversations/:id/agent` | Asignar agente |
| PUT | `/conversations/:id/crm-stage` | Actualizar etapa CRM |
| PUT | `/conversations/:id/appointment` | Actualizar cita |
| POST | `/conversations/:id/tags` | Agregar etiqueta |
| DELETE | `/conversations/:id/tags/:name` | Eliminar etiqueta |
| GET | `/tags` | Lista de etiquetas |
| POST | `/tags` | Crear etiqueta |
| DELETE | `/tags/:id` | Eliminar etiqueta |

## Stack tecnológico

- **React 18** + **TypeScript**
- **Tailwind CSS** con paleta de marca Rentmies
- **shadcn/ui** para componentes base
- **date-fns** para manejo de fechas
- **sonner** para notificaciones toast

## Paleta de colores de marca

```css
--brand-teal-green: #40d99d;   /* Primario */
--brand-mint-green: #4fffb4;   /* Acento */
--brand-light-gray: #e5e5e5;   /* Borders */
--brand-medium-gray: #f0f0f0;  /* Backgrounds */
--brand-black: #1a1a1a;        /* Texto */
```
