-- ============================================================
-- RENTMIES RELOADED — Database Migration 001
-- Ejecutar en Supabase SQL Editor
-- ============================================================

-- ============================================
-- INVENTARIO DE PROPIEDADES
-- ============================================
create table if not exists public.propiedades (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  empresa_id uuid not null references public.empresas(id),
  codigo text not null,
  ubicacion text,
  ciudad text,
  area_m2 numeric,
  tipo_inmueble text,
  tipo_negocio text check (tipo_negocio in ('Venta', 'Arriendo', 'Venta/Arriendo')),
  precio numeric,
  precio_administracion numeric,
  descripcion text,
  habitaciones integer,
  banos integer,
  parqueaderos integer,
  estrato integer,
  antiguedad text,
  estado text default 'activo' check (estado in ('activo', 'inactivo', 'vendido', 'arrendado')),
  imagenes text[] default '{}',
  codigo_portal text,
  enlace_portal text,
  caracteristicas jsonb default '{}',
  metadata jsonb default '{}',
  unique(empresa_id, codigo)
);

-- ============================================
-- AGENTES HUMANOS
-- ============================================
create table if not exists public.agentes (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz default now(),
  empresa_id uuid not null references public.empresas(id),
  profile_id uuid references public.profiles(id),
  nombre text not null,
  email text,
  telefono text,
  activo boolean default true,
  metadata jsonb default '{}'
);

-- ============================================
-- ASIGNACIÓN AUTOMÁTICA DE LEADS
-- ============================================
create table if not exists public.asignacion_automatica (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz default now(),
  empresa_id uuid not null references public.empresas(id),
  metodo text not null check (metodo in ('por_dia', 'crm', 'carga_manual')),
  activo boolean default true,
  configuracion jsonb not null default '{}',
  metadata jsonb default '{}'
);

-- ============================================
-- CRM: PIPELINES Y ETAPAS
-- ============================================
create table if not exists public.pipelines (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz default now(),
  empresa_id uuid not null references public.empresas(id),
  nombre text not null,
  descripcion text,
  activo boolean default true,
  orden integer default 0,
  metadata jsonb default '{}'
);

create table if not exists public.pipeline_etapas (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz default now(),
  pipeline_id uuid not null references public.pipelines(id) on delete cascade,
  nombre text not null,
  color text default '#40d99d',
  orden integer not null default 0,
  es_cierre boolean default false,
  es_perdido boolean default false,
  metadata jsonb default '{}'
);

-- ============================================
-- CRM: LEADS
-- ============================================
create table if not exists public.leads (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  empresa_id uuid not null references public.empresas(id),
  pipeline_id uuid not null references public.pipelines(id),
  etapa_id uuid not null references public.pipeline_etapas(id),
  user_conversacion_id uuid references public.user_conversacion(id),
  conversacion_id uuid references public.conversacion(id),
  agente_asignado_id uuid references public.agentes(id),
  nombre text not null,
  telefono text,
  email text,
  origen text,
  etiquetas text[] default '{}',
  propiedad_interes_id uuid references public.propiedades(id),
  numero_citas integer default 0,
  proxima_cita timestamptz,
  valor_estimado numeric,
  notas text,
  activo boolean default true,
  metadata jsonb default '{}'
);

-- ============================================
-- CRM: ACTIVIDADES / HISTORIAL
-- ============================================
create table if not exists public.lead_actividades (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz default now(),
  lead_id uuid not null references public.leads(id) on delete cascade,
  tipo text not null check (tipo in ('nota', 'cita', 'llamada', 'whatsapp', 'email', 'cambio_etapa', 'asignacion', 'documento', 'pqrs', 'automatizacion')),
  descripcion text not null,
  agente_id uuid references public.agentes(id),
  metadata jsonb default '{}'
);

-- ============================================
-- CRM: CITAS
-- ============================================
create table if not exists public.citas (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz default now(),
  empresa_id uuid not null references public.empresas(id),
  lead_id uuid not null references public.leads(id),
  agente_id uuid references public.agentes(id),
  propiedad_id uuid references public.propiedades(id),
  fecha_hora timestamptz not null,
  duracion_minutos integer default 60,
  estado text default 'programada' check (estado in ('programada', 'confirmada', 'realizada', 'cancelada', 'no_asistio')),
  notas text,
  confirmada_por_ia boolean default false,
  metadata jsonb default '{}'
);

-- ============================================
-- CRM: AUTOMATIZACIONES
-- ============================================
create table if not exists public.automatizaciones (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz default now(),
  empresa_id uuid not null references public.empresas(id),
  nombre text not null,
  descripcion text,
  trigger_tipo text not null check (trigger_tipo in ('cambio_etapa', 'tiempo', 'evento', 'cita', 'manual')),
  trigger_config jsonb not null default '{}',
  accion_tipo text not null check (accion_tipo in ('enviar_whatsapp', 'enviar_email', 'mover_etapa', 'asignar_agente', 'crear_cita', 'notificar', 'cobrar')),
  accion_config jsonb not null default '{}',
  activo boolean default true,
  pipeline_id uuid references public.pipelines(id),
  metadata jsonb default '{}'
);

-- ============================================
-- ETIQUETAS
-- ============================================
create table if not exists public.etiquetas (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz default now(),
  empresa_id uuid not null references public.empresas(id),
  nombre text not null,
  color text default '#40d99d',
  unique(empresa_id, nombre)
);

-- ============================================
-- AGENTES IA (WhatsApp + Voz)
-- ============================================
create table if not exists public.agentes_ia (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  empresa_id uuid not null references public.empresas(id),
  nombre text not null,
  canal text not null check (canal in ('whatsapp', 'voz', 'web_chat')),
  assistant_id text,
  channel_uuid_callbell text,
  numero_whatsapp text,
  elevenlabs_agent_id text,
  elevenlabs_voice_id text,
  voice_sample_url text,
  instrucciones text,
  archivos_inventario text[] default '{}',
  activo boolean default true,
  ultimo_test timestamptz,
  estadisticas jsonb default '{"mensajes_enviados": 0, "llamadas_realizadas": 0}',
  metadata jsonb default '{}'
);

-- ============================================
-- PAGOS Y SUSCRIPCIONES (Wompi)
-- ============================================
create table if not exists public.suscripciones (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz default now(),
  empresa_id uuid not null references public.empresas(id),
  plan text not null check (plan in ('starter', 'pro', 'enterprise')),
  estado text not null default 'activa' check (estado in ('activa', 'cancelada', 'vencida', 'trial')),
  fecha_inicio timestamptz not null default now(),
  fecha_fin timestamptz,
  wompi_subscription_id text,
  wompi_payment_source_id text,
  monto_mensual numeric not null,
  moneda text default 'COP',
  metadata jsonb default '{}'
);

create table if not exists public.pagos (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz default now(),
  empresa_id uuid not null references public.empresas(id),
  suscripcion_id uuid references public.suscripciones(id),
  monto numeric not null,
  moneda text default 'COP',
  estado text not null check (estado in ('pendiente', 'aprobado', 'rechazado', 'reembolsado')),
  wompi_transaction_id text,
  wompi_reference text unique,
  metodo_pago text,
  descripcion text,
  metadata jsonb default '{}'
);

-- ============================================
-- ANALYTICS: SNAPSHOTS DIARIOS
-- ============================================
create table if not exists public.analytics_diarios (
  id uuid primary key default gen_random_uuid(),
  fecha date not null,
  empresa_id uuid not null references public.empresas(id),
  canal text not null,
  leads_nuevos integer default 0,
  conversaciones integer default 0,
  interacciones integer default 0,
  solicitudes integer default 0,
  cierres integer default 0,
  citas_programadas integer default 0,
  citas_realizadas integer default 0,
  mensajes_enviados integer default 0,
  llamadas_realizadas integer default 0,
  metadata jsonb default '{}',
  unique(fecha, empresa_id, canal)
);

-- ============================================
-- PQRS
-- ============================================
create table if not exists public.pqrs (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz default now(),
  empresa_id uuid not null references public.empresas(id),
  lead_id uuid references public.leads(id),
  tipo text not null check (tipo in ('peticion', 'queja', 'reclamo', 'sugerencia')),
  asunto text not null,
  descripcion text,
  estado text default 'abierto' check (estado in ('abierto', 'en_proceso', 'resuelto', 'cerrado')),
  agente_id uuid references public.agentes(id),
  metadata jsonb default '{}'
);

-- ============================================
-- DOCUMENTOS
-- ============================================
create table if not exists public.documentos (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz default now(),
  empresa_id uuid not null references public.empresas(id),
  lead_id uuid references public.leads(id),
  nombre text not null,
  url text not null,
  tipo text,
  metadata jsonb default '{}'
);

-- ============================================
-- ÍNDICES
-- ============================================
create index if not exists idx_propiedades_empresa on public.propiedades(empresa_id);
create index if not exists idx_propiedades_tipo on public.propiedades(tipo_negocio, estado);
create index if not exists idx_agentes_empresa on public.agentes(empresa_id) where activo = true;
create index if not exists idx_leads_pipeline on public.leads(pipeline_id, etapa_id);
create index if not exists idx_leads_empresa on public.leads(empresa_id);
create index if not exists idx_leads_agente on public.leads(agente_asignado_id);
create index if not exists idx_lead_actividades_lead on public.lead_actividades(lead_id, created_at desc);
create index if not exists idx_citas_empresa on public.citas(empresa_id, fecha_hora);
create index if not exists idx_citas_agente on public.citas(agente_id, fecha_hora);
create index if not exists idx_agentes_ia_empresa on public.agentes_ia(empresa_id);
create index if not exists idx_suscripciones_empresa on public.suscripciones(empresa_id) where estado = 'activa';
create index if not exists idx_pagos_empresa on public.pagos(empresa_id, created_at desc);
create index if not exists idx_analytics_empresa_fecha on public.analytics_diarios(empresa_id, fecha desc);
create index if not exists idx_pqrs_lead on public.pqrs(lead_id);
create index if not exists idx_etiquetas_empresa on public.etiquetas(empresa_id);

-- ============================================
-- RLS
-- ============================================
alter table public.propiedades enable row level security;
alter table public.agentes enable row level security;
alter table public.asignacion_automatica enable row level security;
alter table public.pipelines enable row level security;
alter table public.pipeline_etapas enable row level security;
alter table public.leads enable row level security;
alter table public.lead_actividades enable row level security;
alter table public.citas enable row level security;
alter table public.automatizaciones enable row level security;
alter table public.etiquetas enable row level security;
alter table public.agentes_ia enable row level security;
alter table public.suscripciones enable row level security;
alter table public.pagos enable row level security;
alter table public.analytics_diarios enable row level security;
alter table public.pqrs enable row level security;
alter table public.documentos enable row level security;

-- Service role full access
create policy "service_all_propiedades" on public.propiedades for all using (true) with check (true);
create policy "service_all_agentes" on public.agentes for all using (true) with check (true);
create policy "service_all_asignacion" on public.asignacion_automatica for all using (true) with check (true);
create policy "service_all_pipelines" on public.pipelines for all using (true) with check (true);
create policy "service_all_etapas" on public.pipeline_etapas for all using (true) with check (true);
create policy "service_all_leads" on public.leads for all using (true) with check (true);
create policy "service_all_actividades" on public.lead_actividades for all using (true) with check (true);
create policy "service_all_citas" on public.citas for all using (true) with check (true);
create policy "service_all_automatizaciones" on public.automatizaciones for all using (true) with check (true);
create policy "service_all_etiquetas" on public.etiquetas for all using (true) with check (true);
create policy "service_all_agentes_ia" on public.agentes_ia for all using (true) with check (true);
create policy "service_all_suscripciones" on public.suscripciones for all using (true) with check (true);
create policy "service_all_pagos" on public.pagos for all using (true) with check (true);
create policy "service_all_analytics" on public.analytics_diarios for all using (true) with check (true);
create policy "service_all_pqrs" on public.pqrs for all using (true) with check (true);
create policy "service_all_documentos" on public.documentos for all using (true) with check (true);

-- Users: acceso por empresa
create policy "empresa_propiedades" on public.propiedades for all using (
  empresa_id in (select empresa_id from public.profiles where id = auth.uid() and empresa_id is not null)
);
create policy "empresa_agentes" on public.agentes for all using (
  empresa_id in (select empresa_id from public.profiles where id = auth.uid() and empresa_id is not null)
);
create policy "empresa_pipelines" on public.pipelines for all using (
  empresa_id in (select empresa_id from public.profiles where id = auth.uid() and empresa_id is not null)
);
create policy "empresa_leads" on public.leads for all using (
  empresa_id in (select empresa_id from public.profiles where id = auth.uid() and empresa_id is not null)
);
create policy "empresa_citas" on public.citas for all using (
  empresa_id in (select empresa_id from public.profiles where id = auth.uid() and empresa_id is not null)
);
create policy "empresa_agentes_ia" on public.agentes_ia for all using (
  empresa_id in (select empresa_id from public.profiles where id = auth.uid() and empresa_id is not null)
);
create policy "empresa_analytics" on public.analytics_diarios for all using (
  empresa_id in (select empresa_id from public.profiles where id = auth.uid() and empresa_id is not null)
);

-- ============================================
-- TRIGGERS: updated_at
-- ============================================
create or replace function public.update_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql security definer;

create trigger trg_propiedades_updated before update on public.propiedades
  for each row execute function public.update_updated_at();
create trigger trg_leads_updated before update on public.leads
  for each row execute function public.update_updated_at();
create trigger trg_agentes_ia_updated before update on public.agentes_ia
  for each row execute function public.update_updated_at();
