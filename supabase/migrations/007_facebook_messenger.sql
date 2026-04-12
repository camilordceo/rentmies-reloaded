-- ============================================================
-- RENTMIES RELOADED — Migration 007
-- Facebook Messenger Platform integration
-- Run in Supabase SQL Editor
-- ============================================================

-- ─── 1. Extend agentes_ia canal constraint ───────────────────────────────────

alter table public.agentes_ia
  drop constraint if exists agentes_ia_canal_check;

alter table public.agentes_ia
  add constraint agentes_ia_canal_check
  check (canal in ('whatsapp', 'voz', 'web_chat', 'facebook_messenger'));

-- ─── 2. Facebook Pages (one per empresa, could be multiple) ─────────────────

create table if not exists public.facebook_pages (
  id                  uuid primary key default gen_random_uuid(),
  empresa_id          uuid not null references public.empresas(id) on delete cascade,
  page_id             text not null unique,        -- Facebook Page ID (numeric string)
  page_name           text,                         -- Human-readable page name
  page_access_token   text not null,                -- Per-page token (long-lived)
  is_active           boolean not null default true,
  connected_at        timestamptz not null default now(),
  created_at          timestamptz not null default now(),
  updated_at          timestamptz not null default now()
);

alter table public.facebook_pages enable row level security;

-- Empresa members can see and manage their own pages
create policy "empresas_own_facebook_pages" on public.facebook_pages
  for all
  using (
    empresa_id in (
      select empresa_id from public.profiles
      where id = auth.uid() and empresa_id is not null
    )
  );

-- Admin can see all
create policy "admin_all_facebook_pages" on public.facebook_pages
  for all
  using (
    exists (
      select 1 from public.profiles
      where id = auth.uid() and rol = 'admin'
    )
  );

create index idx_facebook_pages_page_id      on public.facebook_pages(page_id);
create index idx_facebook_pages_empresa_id   on public.facebook_pages(empresa_id);

-- ─── 3. Facebook Conversations ──────────────────────────────────────────────

create table if not exists public.facebook_conversations (
  id                  uuid primary key default gen_random_uuid(),
  empresa_id          uuid not null references public.empresas(id),
  facebook_page_id    uuid references public.facebook_pages(id) on delete set null,
  lead_id             uuid references public.leads(id) on delete set null,
  user_psid           text not null,               -- Page-Scoped User ID
  user_name           text,                         -- From Profile API
  status              text not null default 'active'
                        check (status in ('active', 'closed', 'ai_handling', 'human_handling')),
  last_message_at     timestamptz,
  window_expires_at   timestamptz,                  -- 24h window expiry
  metadata            jsonb not null default '{}',  -- referral data, listing info, etc.
  created_at          timestamptz not null default now(),
  updated_at          timestamptz not null default now(),
  -- One active conversation per PSID per empresa
  unique (user_psid, empresa_id)
);

alter table public.facebook_conversations enable row level security;

create policy "empresas_own_fb_conversations" on public.facebook_conversations
  for all
  using (
    empresa_id in (
      select empresa_id from public.profiles
      where id = auth.uid() and empresa_id is not null
    )
  );

create policy "admin_all_fb_conversations" on public.facebook_conversations
  for all
  using (
    exists (
      select 1 from public.profiles
      where id = auth.uid() and rol = 'admin'
    )
  );

create index idx_fb_conv_empresa     on public.facebook_conversations(empresa_id);
create index idx_fb_conv_psid        on public.facebook_conversations(user_psid, empresa_id);
create index idx_fb_conv_last_msg    on public.facebook_conversations(last_message_at desc);
create index idx_fb_conv_status      on public.facebook_conversations(empresa_id, status);

-- ─── 4. Facebook Messages ───────────────────────────────────────────────────

create table if not exists public.facebook_messages (
  id                  uuid primary key default gen_random_uuid(),
  conversation_id     uuid not null references public.facebook_conversations(id) on delete cascade,
  empresa_id          uuid not null references public.empresas(id),
  direction           text not null check (direction in ('inbound', 'outbound')),
  message_text        text,
  message_mid         text,                         -- Meta message ID (mid.$...)
  sender_type         text check (sender_type in ('lead', 'agent', 'ai')),
  metadata            jsonb not null default '{}',
  created_at          timestamptz not null default now()
);

alter table public.facebook_messages enable row level security;

create policy "empresas_own_fb_messages" on public.facebook_messages
  for all
  using (
    empresa_id in (
      select empresa_id from public.profiles
      where id = auth.uid() and empresa_id is not null
    )
  );

create policy "admin_all_fb_messages" on public.facebook_messages
  for all
  using (
    exists (
      select 1 from public.profiles
      where id = auth.uid() and rol = 'admin'
    )
  );

create index idx_fb_msg_conv    on public.facebook_messages(conversation_id, created_at desc);
create index idx_fb_msg_empresa on public.facebook_messages(empresa_id);

-- ─── 5. Auto-update updated_at triggers ─────────────────────────────────────

create or replace function public.update_updated_at_column()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger trg_facebook_pages_updated_at
  before update on public.facebook_pages
  for each row execute function public.update_updated_at_column();

create trigger trg_facebook_conversations_updated_at
  before update on public.facebook_conversations
  for each row execute function public.update_updated_at_column();
