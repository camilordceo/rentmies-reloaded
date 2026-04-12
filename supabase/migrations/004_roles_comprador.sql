-- ============================================================
-- 004_roles_comprador.sql
-- Extends role system + comprador profile table
-- ============================================================

-- Add new role values (if using text enum constraint update it)
-- ASSUMPTION: rol column is text, not a pg enum — safe to just insert new values

-- Comprador profile table (buyers/renters who register from the portal)
create table if not exists public.compradores (
  id              uuid primary key default gen_random_uuid(),
  profile_id      uuid not null references auth.users(id) on delete cascade,
  empresa_id      uuid references public.empresas(id),  -- null = any empresa
  nombre          text not null,
  telefono        text,
  email           text,
  documento_tipo  text check (documento_tipo in ('CC','CE','NIT','Pasaporte')),
  documento_num   text,
  ciudad          text,
  tipo_interes    text check (tipo_interes in ('compra','arriendo','ambos')) default 'ambos',
  presupuesto_min numeric,
  presupuesto_max numeric,
  activo          boolean default true,
  created_at      timestamptz default now(),
  updated_at      timestamptz default now(),
  unique(profile_id)
);

create index if not exists idx_compradores_profile on public.compradores(profile_id);
create index if not exists idx_compradores_empresa on public.compradores(empresa_id);

alter table public.compradores enable row level security;
create policy "comprador_own" on public.compradores
  for all using (profile_id = auth.uid()) with check (profile_id = auth.uid());
create policy "empresa_admin_read" on public.compradores
  for select using (
    exists (
      select 1 from public.profiles p
      where p.id = auth.uid()
      and p.rol in ('admin','empresa_admin')
      and (p.empresa_id = compradores.empresa_id or p.rol = 'admin')
    )
  );

-- Link citas to comprador profile
alter table public.citas
  add column if not exists comprador_id uuid references public.compradores(id),
  add column if not exists estado text default 'pendiente'
    check (estado in ('pendiente','confirmada','cancelada','realizada'));

-- Pagos table for compradores (rent payments, fees, etc.)
create table if not exists public.pagos_comprador (
  id              uuid primary key default gen_random_uuid(),
  comprador_id    uuid not null references public.compradores(id),
  empresa_id      uuid not null references public.empresas(id),
  concepto        text not null,  -- 'arriendo', 'administracion', 'multa', 'otro'
  monto           numeric not null,
  moneda          text default 'COP',
  estado          text default 'pendiente'
    check (estado in ('pendiente','procesando','pagado','fallido','reembolsado')),
  wompi_reference text,
  wompi_id        text,
  periodo_mes     text,  -- 'YYYY-MM'
  descripcion     text,
  propiedad_id    uuid references public.propiedades(id),
  comprobante_url text,
  created_at      timestamptz default now(),
  pagado_at       timestamptz
);

create index if not exists idx_pagos_comprador_cid on public.pagos_comprador(comprador_id);
create index if not exists idx_pagos_comprador_empresa on public.pagos_comprador(empresa_id);

alter table public.pagos_comprador enable row level security;
create policy "comprador_own_pagos" on public.pagos_comprador
  for all using (
    comprador_id in (select id from public.compradores where profile_id = auth.uid())
  );
create policy "empresa_admin_pagos" on public.pagos_comprador
  for select using (
    exists (
      select 1 from public.profiles p
      where p.id = auth.uid()
      and p.rol in ('admin','empresa_admin')
      and (p.empresa_id = pagos_comprador.empresa_id or p.rol = 'admin')
    )
  );

-- Solicitudes/PQRS table
create table if not exists public.solicitudes (
  id              uuid primary key default gen_random_uuid(),
  comprador_id    uuid references public.compradores(id),
  empresa_id      uuid not null references public.empresas(id),
  tipo            text not null check (tipo in ('peticion','queja','reclamo','sugerencia','otro')),
  asunto          text not null,
  descripcion     text not null,
  estado          text default 'abierta' check (estado in ('abierta','en_proceso','resuelta','cerrada')),
  respuesta       text,
  propiedad_id    uuid references public.propiedades(id),
  created_at      timestamptz default now(),
  updated_at      timestamptz default now(),
  cerrada_at      timestamptz
);

create index if not exists idx_solicitudes_comprador on public.solicitudes(comprador_id);
create index if not exists idx_solicitudes_empresa on public.solicitudes(empresa_id);

alter table public.solicitudes enable row level security;
create policy "comprador_own_solicitudes" on public.solicitudes
  for all using (
    comprador_id in (select id from public.compradores where profile_id = auth.uid())
  );
create policy "empresa_admin_solicitudes" on public.solicitudes
  for all using (
    exists (
      select 1 from public.profiles p
      where p.id = auth.uid()
      and p.rol in ('admin','empresa_admin','agente')
    )
  );
