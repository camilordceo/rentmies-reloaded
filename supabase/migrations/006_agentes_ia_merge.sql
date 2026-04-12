-- ============================================================
-- 006_agentes_ia_merge.sql
-- Consolidate whatsapp_ai into agentes_ia.
-- whatsapp_ai is the legacy table; agentes_ia is canonical.
-- ============================================================

-- Add empresa_nombre for admin panel display without a JOIN
alter table public.agentes_ia
  add column if not exists empresa_nombre text;

-- Copy any whatsapp_ai rows that don't already exist in agentes_ia
-- (matched by empresa_id + numero_whatsapp + canal='whatsapp')
insert into public.agentes_ia (
  empresa_id,
  empresa_nombre,
  nombre,
  canal,
  assistant_id,
  channel_uuid_callbell,
  numero_whatsapp,
  activo,
  metadata
)
select
  w.empresa_id,
  w.empresa_nombre,
  coalesce(w.nombre_agente, 'Agente WhatsApp') as nombre,
  'whatsapp'                                   as canal,
  w.assistant_id,
  w.channel_uuid_callbell,
  w.numero_whatsapp,
  w.activo,
  coalesce(w.configuracion_extra, '{}')::jsonb  as metadata
from public.whatsapp_ai w
where not exists (
  select 1 from public.agentes_ia a
  where a.empresa_id     = w.empresa_id
    and a.numero_whatsapp = w.numero_whatsapp
    and a.canal           = 'whatsapp'
);

-- NOTE: whatsapp_ai is kept as read-only archive.
-- Drop it in a future migration once conversacion FK is confirmed migrated.
