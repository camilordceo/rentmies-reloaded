/**
 * scripts/seed-portal.mjs
 * Upserts inventario-portal.json (7,452 properties) into Supabase propiedades.
 *
 * Usage: node scripts/seed-portal.mjs
 * Requires: NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in .env.local
 */

import { readFileSync } from 'fs'
import { createClient } from '@supabase/supabase-js'

// ── Load env ────────────────────────────────────────────────────────────────
const envRaw = readFileSync('.env.local', 'utf-8')
const env = Object.fromEntries(
  envRaw.split('\n')
    .filter(l => l && !l.startsWith('#') && l.includes('='))
    .map(l => { const [k, ...v] = l.split('='); return [k.trim(), v.join('=').trim()] })
)

const SUPABASE_URL = env['NEXT_PUBLIC_SUPABASE_URL']
const SERVICE_KEY = env['SUPABASE_SERVICE_ROLE_KEY']
const PORTAL_EMPRESA_ID = '00000000-0000-0000-0000-000000000002'

if (!SUPABASE_URL || !SERVICE_KEY) {
  console.error('Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env.local')
  process.exit(1)
}

const db = createClient(SUPABASE_URL, SERVICE_KEY)

// ── Normalise tipo_negocio ──────────────────────────────────────────────────
function normalizeTipo(raw = '') {
  const v = raw.toUpperCase().trim()
  if (v === 'VENTA') return 'Venta'
  if (v === 'ARRIENDO') return 'Arriendo'
  if (v.includes('ARRIENDO') && v.includes('VENTA')) return 'Venta/Arriendo'
  return 'Venta'
}

// ── Build imagenes array ────────────────────────────────────────────────────
function buildImagenes(r) {
  return [r.image_link_1, r.image_link_2, r.image_link_3]
    .filter(Boolean)
    .filter(url => url.startsWith('http'))
}

// ── Map JSON row → propiedades row ──────────────────────────────────────────
function mapRow(r) {
  const tipo_negocio = normalizeTipo(r.tipo_transaccion_negocio)
  const precio = tipo_negocio === 'Arriendo'
    ? (Number(r.valor_arriendo) || null)
    : (Number(r.valor_venta) || null)

  return {
    empresa_id: PORTAL_EMPRESA_ID,
    // Use Codigo__Domus as primary code (unique key)
    codigo: String(r.Codigo__Domus),
    codigo_domus: String(r.Codigo__Domus),
    codigo_finca_raiz: r.codigo_finca_raiz || null,
    codigo_metro_cuadrado: r.codigo_metro_cuadrado || null,
    codigo_identificador: r.Codigo_Identificador_Inmueble || null,
    // Location
    ubicacion: [r.nombre_barrio, r.nombre_ciudad].filter(Boolean).join(', '),
    ciudad: r.nombre_ciudad?.trim() || null,
    zona: r.zona || null,
    // Property details
    tipo_inmueble: 'Apartamento', // JSON has no explicit field; all are residential units
    tipo_negocio,
    precio,
    precio_administracion: Number(r.valor_administracion) || null,
    area_m2: Number(r.area_construida) || null,
    banos: Number(r.numero_banos) || null,
    descripcion: r.descripcion_inmueble_propiedad || null,
    estado: 'activo',
    imagenes: buildImagenes(r),
    // Portal links
    enlace_portal: r.ficha_tecnica || null,
    ficha_tecnica_url: r.ficha_tecnica || null,
    video_url: r.video || null,
    // Broker info
    broker_email: r.broker_email || null,
    broker_name: r.Broker_Name || null,
    // Per-property assistant (Domus integration)
    id_assistant_prop: r.id_assistant || null,
    // Extra portal URLs stored in metadata
    metadata: {
      url_engel: r['Url Engel'] || null,
      url_century21: r.Url_Century21 || null,
      antiguedad: r.antiguedad || null,
      area_total_m2: Number(r.area_total_m2) || null,
    },
  }
}

// ── Main ────────────────────────────────────────────────────────────────────
async function main() {
  console.log('📦 Loading inventario-portal.json...')
  const raw = readFileSync('inventario-portal.json', 'utf-8')
  const data = JSON.parse(raw)
  const arr = Array.isArray(data) ? data : Object.values(data)[0]
  console.log(`✓ ${arr.length} properties loaded`)

  // Ensure portal empresa exists
  const { error: empErr } = await db.from('empresas').upsert(
    { id: PORTAL_EMPRESA_ID, nombre: 'Rentmies Portal', plan: 'pro', activa: true,
      configuracion: { portal: true, assistant_id: 'asst_IbHsOSuSAByiX59OujkQmUbw' } },
    { onConflict: 'id' }
  )
  if (empErr) { console.error('Empresa upsert failed:', empErr.message); process.exit(1) }
  console.log('✓ Rentmies Portal empresa ready')

  // Upsert in batches of 100
  const BATCH = 100
  let inserted = 0, errors = 0

  for (let i = 0; i < arr.length; i += BATCH) {
    const batch = arr.slice(i, i + BATCH).map(mapRow)
    const { error } = await db
      .from('propiedades')
      .upsert(batch, { onConflict: 'empresa_id,codigo', ignoreDuplicates: false })

    if (error) {
      console.error(`❌ Batch ${i}–${i + BATCH}: ${error.message}`)
      errors += batch.length
    } else {
      inserted += batch.length
      process.stdout.write(`\r⬆  ${inserted} / ${arr.length} upserted`)
    }
  }

  console.log(`\n\n✅ Done — ${inserted} upserted, ${errors} errors`)
}

main().catch(err => { console.error(err); process.exit(1) })
