create table if not exists public.portal_sessions (
  id                uuid primary key default gen_random_uuid(),
  created_at        timestamptz default now(),
  empresa_id        uuid not null references public.empresas(id),
  session_id        text not null unique,
  conversacion_id   uuid references public.conversacion(id),
  last_response_id  text,
  filtros_activos   jsonb default '{}',
  metadata          jsonb default '{}'
);

create index if not exists idx_portal_sessions_session on public.portal_sessions(session_id);
create index if not exists idx_portal_sessions_empresa on public.portal_sessions(empresa_id);

alter table public.portal_sessions enable row level security;
create policy "portal_public_access" on public.portal_sessions for all using (true) with check (true);
