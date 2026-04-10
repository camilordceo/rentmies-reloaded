-- WhaRentmies: cache WhatsApp number validations (30-day TTL)
-- Avoids repeated validation API calls (wharentmies charges per call)
create table if not exists public.phone_validations (
  id            uuid primary key default gen_random_uuid(),
  phone         text unique not null,
  e164          text not null,
  country_code  text not null,
  is_valid_whatsapp boolean,
  validated_via text check (validated_via in ('wharentmies','meta','local')),
  validated_at  timestamptz default now(),
  expires_at    timestamptz default (now() + interval '30 days')
);

create index if not exists idx_phone_validations_phone on public.phone_validations (phone);
create index if not exists idx_phone_validations_expires on public.phone_validations (expires_at);
