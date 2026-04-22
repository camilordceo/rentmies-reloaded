-- Migration 009: Cashback Engine + Ofertas + User Intents
-- Powers the Living Atlas portal: cashback claims, buyer offers, intent persistence

-- ─── Extend propiedades with cashback columns ─────────────────────────────────
ALTER TABLE public.propiedades
  ADD COLUMN IF NOT EXISTS cashback_rate numeric DEFAULT 0.01,
  ADD COLUMN IF NOT EXISTS cashback_amount numeric GENERATED ALWAYS AS (
    CASE
      WHEN tipo_negocio = 'Arriendo' AND precio IS NOT NULL THEN precio * 0.10
      WHEN precio IS NOT NULL THEN precio * 0.01
      ELSE NULL
    END
  ) STORED;

-- ─── Cashback claims ──────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.cashback_claims (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  comprador_id    uuid REFERENCES public.compradores(id),
  empresa_id      uuid NOT NULL REFERENCES public.empresas(id),
  propiedad_id    uuid REFERENCES public.propiedades(id),
  tipo_negocio    text NOT NULL CHECK (tipo_negocio IN ('Venta','Arriendo')),
  valor_inmueble  numeric NOT NULL,
  cashback_rate   numeric NOT NULL,
  cashback_amount numeric NOT NULL,
  estado          text NOT NULL DEFAULT 'pendiente'
    CHECK (estado IN ('pendiente','aprobado','pagado','rechazado')),
  aprobado_por    uuid REFERENCES auth.users(id),
  pagado_at       timestamptz,
  wompi_reference text,
  metadata        jsonb DEFAULT '{}',
  created_at      timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_cashback_claims_comprador ON public.cashback_claims(comprador_id);
CREATE INDEX IF NOT EXISTS idx_cashback_claims_empresa   ON public.cashback_claims(empresa_id);

ALTER TABLE public.cashback_claims ENABLE ROW LEVEL SECURITY;

CREATE POLICY "comprador_own_claims" ON public.cashback_claims
  FOR SELECT USING (
    comprador_id IN (SELECT id FROM public.compradores WHERE profile_id = auth.uid())
  );

CREATE POLICY "empresa_admin_claims" ON public.cashback_claims
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND rol IN ('admin','empresa_admin')
    )
  );

-- ─── Ofertas (buyer proposals from the Atlas portal) ─────────────────────────
CREATE TABLE IF NOT EXISTS public.ofertas (
  id                uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  comprador_id      uuid REFERENCES public.compradores(id),
  empresa_id        uuid NOT NULL REFERENCES public.empresas(id),
  propiedad_id      uuid NOT NULL REFERENCES public.propiedades(id),
  nombre_contacto   text NOT NULL,
  telefono          text NOT NULL,
  email             text,
  tipo_negocio      text NOT NULL CHECK (tipo_negocio IN ('Venta','Arriendo')),
  monto_oferta      numeric NOT NULL,
  mensaje           text,
  cashback_estimado numeric,
  estado            text DEFAULT 'nueva'
    CHECK (estado IN ('nueva','vista','contactada','negociando','aceptada','rechazada')),
  admin_notified    boolean DEFAULT false,
  metadata          jsonb DEFAULT '{}',
  created_at        timestamptz DEFAULT now(),
  updated_at        timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_ofertas_propiedad ON public.ofertas(propiedad_id);
CREATE INDEX IF NOT EXISTS idx_ofertas_empresa   ON public.ofertas(empresa_id);
CREATE INDEX IF NOT EXISTS idx_ofertas_nueva     ON public.ofertas(estado) WHERE estado = 'nueva';

ALTER TABLE public.ofertas ENABLE ROW LEVEL SECURITY;

-- Anyone can submit an offer from the public portal
CREATE POLICY "public_insert_ofertas" ON public.ofertas
  FOR INSERT WITH CHECK (true);

-- Compradores see their own offers
CREATE POLICY "comprador_own_ofertas" ON public.ofertas
  FOR SELECT USING (
    comprador_id IN (SELECT id FROM public.compradores WHERE profile_id = auth.uid())
  );

-- Staff see offers for their empresa
CREATE POLICY "empresa_staff_ofertas" ON public.ofertas
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND rol IN ('admin','empresa_admin','agente')
    )
  );

-- ─── User intents (persisted per session for AI context) ─────────────────────
CREATE TABLE IF NOT EXISTS public.user_intents (
  id         uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id text NOT NULL,
  profile_id uuid REFERENCES auth.users(id),
  intents    text[] NOT NULL DEFAULT '{}',
  metadata   jsonb DEFAULT '{}',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(session_id)
);

CREATE INDEX IF NOT EXISTS idx_user_intents_session ON public.user_intents(session_id);

ALTER TABLE public.user_intents ENABLE ROW LEVEL SECURITY;

CREATE POLICY "public_user_intents" ON public.user_intents
  FOR ALL USING (true) WITH CHECK (true);
