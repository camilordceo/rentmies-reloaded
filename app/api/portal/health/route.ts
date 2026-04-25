import { NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'

export const dynamic = 'force-dynamic'

/**
 * GET /api/portal/health
 * Quick inventory pulse — counts that help debug "EMA isn't finding anything"
 * without opening the Supabase console. Public so it can be hit from the atlas.
 */
export async function GET() {
  const db = createAdminClient()

  const [activeRes, totalRes, withCodesRes, portalEmpresaRes] = await Promise.all([
    db.from('propiedades').select('id', { count: 'exact', head: true }).eq('estado', 'activo'),
    db.from('propiedades').select('id', { count: 'exact', head: true }),
    db.from('propiedades').select('id', { count: 'exact', head: true })
      .or('codigo_finca_raiz.not.is.null,codigo_metro_cuadrado.not.is.null,codigo_domus.not.is.null'),
    db.from('empresas').select('id, nombre, plan, activa, configuracion')
      .eq('id', '00000000-0000-0000-0000-000000000002')
      .maybeSingle(),
  ])

  return NextResponse.json({
    active: activeRes.count ?? 0,
    total: totalRes.count ?? 0,
    with_portal_codes: withCodesRes.count ?? 0,
    portal_empresa: portalEmpresaRes.data ?? null,
    portal_empresa_exists: !!portalEmpresaRes.data,
  })
}
