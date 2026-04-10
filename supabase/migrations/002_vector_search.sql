-- ============================================================
-- 002_vector_search.sql
-- pgvector + hybrid search for propiedades
-- Run in: Supabase SQL Editor
-- ============================================================

-- 1. Enable pgvector extension
create extension if not exists vector;

-- 2. Add embedding column to propiedades
alter table public.propiedades
  add column if not exists embedding vector(1536);

-- 3. IVFFlat index for cosine similarity search
create index if not exists idx_propiedades_embedding
  on public.propiedades
  using ivfflat (embedding vector_cosine_ops)
  with (lists = 100);

-- 4. Hybrid search function: SQL filters + optional vector similarity
create or replace function public.buscar_propiedades_hibrido(
  p_empresa_id       uuid,
  p_embedding        vector(1536) default null,
  p_tipo_inmueble    text         default null,
  p_tipo_negocio     text         default null,
  p_ciudad           text         default null,
  p_precio_min       numeric      default null,
  p_precio_max       numeric      default null,
  p_habitaciones_min integer      default null,
  p_area_min         numeric      default null,
  p_codigo           text         default null,
  p_limite           integer      default 5
)
returns table (
  id                   uuid,
  codigo               text,
  ubicacion            text,
  ciudad               text,
  area_m2              numeric,
  tipo_inmueble        text,
  tipo_negocio         text,
  precio               numeric,
  precio_administracion numeric,
  descripcion          text,
  habitaciones         integer,
  banos                integer,
  parqueaderos         integer,
  imagenes             text[],
  enlace_portal        text,
  codigo_portal        text,
  caracteristicas      jsonb,
  similarity           float
)
language plpgsql
as $$
begin
  return query
  select
    p.id,
    p.codigo,
    p.ubicacion,
    p.ciudad,
    p.area_m2,
    p.tipo_inmueble,
    p.tipo_negocio,
    p.precio,
    p.precio_administracion,
    p.descripcion,
    p.habitaciones,
    p.banos,
    p.parqueaderos,
    p.imagenes,
    p.enlace_portal,
    p.codigo_portal,
    p.caracteristicas,
    case
      when p_embedding is not null and p.embedding is not null
        then 1 - (p.embedding <=> p_embedding)
      else 0.5
    end::float as similarity
  from public.propiedades p
  where p.empresa_id = p_empresa_id
    and p.estado = 'activo'
    and (p_tipo_inmueble    is null or p.tipo_inmueble ilike p_tipo_inmueble)
    and (p_tipo_negocio     is null or p.tipo_negocio  ilike '%' || p_tipo_negocio || '%')
    and (p_ciudad           is null or p.ubicacion     ilike '%' || p_ciudad || '%'
                                    or p.ciudad        ilike '%' || p_ciudad || '%')
    and (p_precio_min       is null or p.precio >= p_precio_min)
    and (p_precio_max       is null or p.precio <= p_precio_max)
    and (p_habitaciones_min is null or p.habitaciones >= p_habitaciones_min)
    and (p_area_min         is null or p.area_m2 >= p_area_min)
    and (p_codigo           is null or p.codigo = p_codigo or p.codigo_portal = p_codigo)
  order by
    case
      when p_embedding is not null and p.embedding is not null
        then 1 - (p.embedding <=> p_embedding)
      else 0
    end desc,
    p.created_at desc
  limit p_limite;
end;
$$;
