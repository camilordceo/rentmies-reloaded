export const dynamic = 'force-dynamic'

import { notFound } from 'next/navigation'
import { createAdminClient } from '@/lib/supabase/admin'
import { PortalClient } from '@/components/portal/portal-client'

export default async function PortalPage({ params }: { params: { empresa_slug: string } }) {
  const db = createAdminClient()

  const { data: empresa } = await db
    .from('empresas')
    .select('id, nombre, ciudad, activo')
    .eq('id', params.empresa_slug)
    .eq('activo', true)
    .single()

  if (!empresa) notFound()

  // Featured properties
  const { data: destacadas } = await db
    .from('propiedades')
    .select('id, codigo, ubicacion, ciudad, tipo_inmueble, tipo_negocio, precio, area_m2, habitaciones, banos, imagenes, enlace_portal')
    .eq('empresa_id', empresa.id)
    .eq('estado', 'activo')
    .order('created_at', { ascending: false })
    .limit(8)

  return (
    <PortalClient
      empresa={{ id: empresa.id, nombre: empresa.nombre, ciudad: empresa.ciudad }}
      destacadas={destacadas || []}
    />
  )
}
