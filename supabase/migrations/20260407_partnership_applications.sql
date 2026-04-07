-- Partnership applications table
create table if not exists public.partnership_applications (
  id          uuid primary key default gen_random_uuid(),
  created_at  timestamptz not null default now(),

  full_name         text not null,
  email             text not null,
  brokerage_name    text not null,
  city              text not null,
  num_agents        text not null,
  phone             text not null,
  marketing_channels text,
  growth_challenge  text,

  -- internal tracking
  status      text not null default 'pending' check (status in ('pending','contacted','approved','rejected')),
  notes       text
);

-- RLS: only service role can read/write (form submits via service key)
alter table public.partnership_applications enable row level security;

-- No public access — all access goes through the API route with service role
