-- Portal listing codes: Finca Raíz and Metro Cuadrado
ALTER TABLE public.propiedades
  ADD COLUMN IF NOT EXISTS codigo_finca_raiz  text,
  ADD COLUMN IF NOT EXISTS codigo_metro_cuadrado text;

-- Fast lookups for AI tool calls
CREATE INDEX IF NOT EXISTS idx_propiedades_codigo_fr
  ON public.propiedades (codigo_finca_raiz)
  WHERE codigo_finca_raiz IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_propiedades_codigo_mc
  ON public.propiedades (codigo_metro_cuadrado)
  WHERE codigo_metro_cuadrado IS NOT NULL;

-- Expose in existing portal RPC if it selects codigo_portal
-- (the buscar_propiedades_hibrido RPC in 002_vector_search.sql may need
--  a companion update — add the columns to its SELECT manually if needed)
