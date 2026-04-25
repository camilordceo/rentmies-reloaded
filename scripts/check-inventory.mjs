/**
 * scripts/check-inventory.mjs
 *
 * Quick CLI to verify Supabase inventory state — answers "is the seed loaded?".
 * Usage: node scripts/check-inventory.mjs
 */

import { readFileSync } from 'fs'
import { createClient } from '@supabase/supabase-js'

const envRaw = readFileSync('.env.local', 'utf-8')
const env = Object.fromEntries(
  envRaw.split('\n')
    .filter(l => l && !l.startsWith('#') && l.includes('='))
    .map(l => { const [k, ...v] = l.split('='); return [k.trim(), v.join('=').trim()] })
)

const SUPABASE_URL = env['NEXT_PUBLIC_SUPABASE_URL']
const SERVICE_KEY = env['SUPABASE_SERVICE_ROLE_KEY']

if (!SUPABASE_URL || !SERVICE_KEY) {
  console.error('Missing Supabase credentials in .env.local')
  process.exit(1)
}

const db = createClient(SUPABASE_URL, SERVICE_KEY)
const PORTAL_EMPRESA_ID = '00000000-0000-0000-0000-000000000002'

console.log('🔎 Checking inventory state...\n')

// 1. Total counts
const [
  { count: totalCount },
  { count: activeCount },
  { count: portalCount },
  { count: withFR },
  { count: withMC },
  { count: withDomus },
  { count: withImages },
] = await Promise.all([
  db.from('propiedades').select('id', { count: 'exact', head: true }),
  db.from('propiedades').select('id', { count: 'exact', head: true }).eq('estado', 'activo'),
  db.from('propiedades').select('id', { count: 'exact', head: true }).eq('empresa_id', PORTAL_EMPRESA_ID),
  db.from('propiedades').select('id', { count: 'exact', head: true }).not('codigo_finca_raiz', 'is', null),
  db.from('propiedades').select('id', { count: 'exact', head: true }).not('codigo_metro_cuadrado', 'is', null),
  db.from('propiedades').select('id', { count: 'exact', head: true }).not('codigo_domus', 'is', null),
  db.from('propiedades').select('id', { count: 'exact', head: true }).not('imagenes', 'eq', '{}'),
])

console.log('📦 propiedades')
console.log(`   Total:        ${totalCount}`)
console.log(`   Activos:      ${activeCount}`)
console.log(`   Portal:       ${portalCount} (empresa_id ${PORTAL_EMPRESA_ID})`)
console.log(`   con FR:       ${withFR}`)
console.log(`   con MC:       ${withMC}`)
console.log(`   con Domus:    ${withDomus}`)
console.log(`   con imágenes: ${withImages}`)

// 2. Portal empresa
const { data: emp } = await db
  .from('empresas')
  .select('id, nombre, plan, activa, configuracion')
  .eq('id', PORTAL_EMPRESA_ID)
  .maybeSingle()

console.log('\n🏢 empresa portal')
if (!emp) {
  console.log('   ❌ NO EXISTE — corre migration 011 o el seed primero')
} else {
  console.log(`   ✓ ${emp.nombre} (plan: ${emp.plan}, activa: ${emp.activa})`)
}

// 3. Sample property to verify columns
const { data: sample } = await db
  .from('propiedades')
  .select('codigo, codigo_finca_raiz, codigo_metro_cuadrado, codigo_domus, ubicacion, ciudad, precio, tipo_negocio, estado, imagenes')
  .eq('estado', 'activo')
  .limit(1)
  .maybeSingle()

console.log('\n🏠 muestra')
if (!sample) {
  console.log('   ❌ Sin propiedades activas')
} else {
  console.log(`   código:       ${sample.codigo}`)
  console.log(`   FR:           ${sample.codigo_finca_raiz ?? '—'}`)
  console.log(`   MC:           ${sample.codigo_metro_cuadrado ?? '—'}`)
  console.log(`   Domus:        ${sample.codigo_domus ?? '—'}`)
  console.log(`   ubicación:    ${sample.ubicacion}`)
  console.log(`   precio:       ${sample.precio} (${sample.tipo_negocio})`)
  console.log(`   imágenes:     ${(sample.imagenes ?? []).length}`)
}

// 4. Verdict
console.log('\n──')
if (activeCount === 0) {
  console.log('🚨 INVENTARIO VACÍO — corre `node scripts/seed-portal.mjs`')
} else if (withFR + withMC + withDomus === 0) {
  console.log('⚠  Inventario presente pero sin códigos de portal — el fallback de extracción no encontrará nada')
} else {
  console.log(`✅ Inventario OK — ${activeCount} propiedades activas listas para EMA`)
}
