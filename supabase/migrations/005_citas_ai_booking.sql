-- ============================================================
-- 005_citas_ai_booking.sql
-- Allow AI agent to book appointments without an existing lead.
-- Adds flexible fields for AI-originated bookings.
-- ============================================================

-- Make lead_id nullable so the AI agent can create a cita
-- before a CRM lead exists. Agents manually link later.
alter table public.citas
  alter column lead_id drop not null;

-- Fields set by the AI agent when no lead/agente exists yet
alter table public.citas
  add column if not exists nombre_contacto text,
  add column if not exists telefono text;
