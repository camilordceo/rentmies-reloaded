-- WhaRentmies: unified event log for all WhatsApp providers
create table if not exists public.whatsapp_events (
  id                    uuid primary key default gen_random_uuid(),
  provider              text not null check (provider in ('callbell','wharentmies','meta')),
  event_type            text not null,
  external_message_id   text,
  phone                 text not null,
  direction             text check (direction in ('inbound','outbound')),
  content               jsonb not null default '{}',
  status                text,
  raw_payload           jsonb not null default '{}',
  created_at            timestamptz default now(),
  processed_at          timestamptz
);

create index if not exists idx_whatsapp_events_phone on public.whatsapp_events (phone, created_at desc);
create index if not exists idx_whatsapp_events_provider on public.whatsapp_events (provider, event_type);
create index if not exists idx_whatsapp_events_external on public.whatsapp_events (external_message_id) where external_message_id is not null;
