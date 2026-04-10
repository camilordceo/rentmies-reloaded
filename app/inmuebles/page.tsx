export const dynamic = 'force-dynamic'

import { createAdminClient } from '@/lib/supabase/admin'
import { PortalClient } from '@/components/portal/portal-client'

export default async function InmueblesPage() {
  const db = createAdminClient()

  const { data: destacadas } = await db
    .from('propiedades')
    .select('id,codigo,ubicacion,ciudad,tipo_inmueble,tipo_negocio,precio,area_m2,habitaciones,banos,imagenes,enlace_portal')
    .eq('estado', 'activo')
    .order('created_at', { ascending: false })
    .limit(12)

  return (
    <PortalClient
      empresa={null}
      destacadas={destacadas || []}
    />
  )
}
