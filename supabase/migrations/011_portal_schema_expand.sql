-- 011_portal_schema_expand.sql
-- Adds Domus/portal codes, broker fields, and Rentmies Portal empresa.
-- Also updates buscar_propiedades_hibrido to expose new columns.

-- ─── 1. New columns on propiedades ─────────────────────────────────────────

ALTER TABLE public.propiedades
  ADD COLUMN IF NOT EXISTS codigo_domus          text,
  ADD COLUMN IF NOT EXISTS codigo_identificador  text,
  ADD COLUMN IF NOT EXISTS broker_email          text,
  ADD COLUMN IF NOT EXISTS broker_name           text,
  ADD COLUMN IF NOT EXISTS zona                  text,
  ADD COLUMN IF NOT EXISTS video_url             text,
  ADD COLUMN IF NOT EXISTS ficha_tecnica_url     text,
  ADD COLUMN IF NOT EXISTS id_assistant_prop     text;  -- per-property Domus assistant

-- Fast lookups for all portal codes
CREATE INDEX IF NOT EXISTS idx_prop_codigo_domus  ON public.propiedades (codigo_domus)         WHERE codigo_domus IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_prop_codigo_id     ON public.propiedades (codigo_identificador)  WHERE codigo_identificador IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_prop_ciudad_trgm   ON public.propiedades USING gin (ciudad gin_trgm_ops);
CREATE INDEX IF NOT EXISTS idx_prop_ubicacion_trgm ON public.propiedades USING gin (ubicacion gin_trgm_ops);

-- Enable trigram extension for fuzzy text search (idempotent)
CREATE EXTENSION IF NOT EXISTS pg_trgm;

-- ─── 2. Rentmies Portal empresa ─────────────────────────────────────────────

INSERT INTO public.empresas (id, nombre, plan, activa, configuracion)
VALUES (
  '00000000-0000-0000-0000-000000000002',
  'Rentmies Portal',
  'pro',
  true,
  '{"portal": true, "assistant_id": "asst_IbHsOSuSAByiX59OujkQmUbw"}'
)
ON CONFLICT (id) DO UPDATE SET activa = true, configuracion = excluded.configuracion;

-- ─── 3. Updated buscar_propiedades_hibrido ──────────────────────────────────
-- Changes: includes new code columns, optional empresa_id (NULL = global),
-- exposes cashback_amount/cashback_rate/estrato/empresa_id, searches all codes.

CREATE OR REPLACE FUNCTION public.buscar_propiedades_hibrido(
  p_empresa_id          uuid    DEFAULT NULL,
  p_embedding           vector(1536) DEFAULT NULL,
  p_tipo_inmueble       text    DEFAULT NULL,
  p_tipo_negocio        text    DEFAULT NULL,
  p_ciudad              text    DEFAULT NULL,
  p_precio_min          numeric DEFAULT NULL,
  p_precio_max          numeric DEFAULT NULL,
  p_habitaciones_min    integer DEFAULT NULL,
  p_area_min            numeric DEFAULT NULL,
  p_codigo              text    DEFAULT NULL,
  p_barrio              text    DEFAULT NULL,
  p_limite              integer DEFAULT 5
)
RETURNS TABLE (
  id                    uuid,
  codigo                text,
  codigo_finca_raiz     text,
  codigo_metro_cuadrado text,
  codigo_domus          text,
  codigo_identificador  text,
  ubicacion             text,
  ciudad                text,
  zona                  text,
  area_m2               numeric,
  tipo_inmueble         text,
  tipo_negocio          text,
  precio                numeric,
  precio_administracion numeric,
  descripcion           text,
  habitaciones          integer,
  banos                 integer,
  parqueaderos          integer,
  estrato               integer,
  imagenes              text[],
  enlace_portal         text,
  ficha_tecnica_url     text,
  video_url             text,
  codigo_portal         text,
  caracteristicas       jsonb,
  cashback_amount       numeric,
  cashback_rate         numeric,
  empresa_id            uuid,
  similarity            float
)
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT
    p.id,
    p.codigo,
    p.codigo_finca_raiz,
    p.codigo_metro_cuadrado,
    p.codigo_domus,
    p.codigo_identificador,
    p.ubicacion,
    p.ciudad,
    p.zona,
    p.area_m2,
    p.tipo_inmueble,
    p.tipo_negocio,
    p.precio,
    p.precio_administracion,
    p.descripcion,
    p.habitaciones,
    p.banos,
    p.parqueaderos,
    p.estrato,
    p.imagenes,
    p.enlace_portal,
    p.ficha_tecnica_url,
    p.video_url,
    p.codigo_portal,
    p.caracteristicas,
    p.cashback_amount,
    p.cashback_rate,
    p.empresa_id,
    CASE
      WHEN p_embedding IS NOT NULL AND p.embedding IS NOT NULL
        THEN 1 - (p.embedding <=> p_embedding)
      ELSE 0.5
    END::float AS similarity
  FROM public.propiedades p
  WHERE
    (p_empresa_id IS NULL OR p.empresa_id = p_empresa_id)
    AND p.estado = 'activo'
    AND (p_tipo_inmueble    IS NULL OR p.tipo_inmueble ILIKE p_tipo_inmueble)
    AND (p_tipo_negocio     IS NULL OR p.tipo_negocio  ILIKE '%' || p_tipo_negocio || '%')
    AND (
      p_ciudad IS NULL
      OR p.ciudad    ILIKE '%' || p_ciudad || '%'
      OR p.ubicacion ILIKE '%' || p_ciudad || '%'
      OR p.zona      ILIKE '%' || p_ciudad || '%'
    )
    AND (p_barrio IS NULL OR p.ubicacion ILIKE '%' || p_barrio || '%')
    AND (p_precio_min       IS NULL OR p.precio >= p_precio_min)
    AND (p_precio_max       IS NULL OR p.precio <= p_precio_max)
    AND (p_habitaciones_min IS NULL OR p.habitaciones >= p_habitaciones_min)
    AND (p_area_min         IS NULL OR p.area_m2 >= p_area_min)
    AND (
      p_codigo IS NULL
      OR p.codigo                = p_codigo
      OR p.codigo_portal         = p_codigo
      OR p.codigo_finca_raiz     = p_codigo
      OR p.codigo_metro_cuadrado = p_codigo
      OR p.codigo_domus          = p_codigo
      OR p.codigo_identificador  = p_codigo
    )
  ORDER BY
    CASE
      WHEN p_embedding IS NOT NULL AND p.embedding IS NOT NULL
        THEN 1 - (p.embedding <=> p_embedding)
      ELSE 0
    END DESC,
    p.precio DESC NULLS LAST
  LIMIT p_limite;
END;
$$;
