export const dynamic = 'force-dynamic'

import { notFound } from 'next/navigation'
import { createAdminClient } from '@/lib/supabase/admin'
import { PortalV2 } from '@/components/portal/v2/portal-v2'
import type { PropertyItem } from '@/store/portal-agent-store'

export default async function PortalPage({ params }: { params: { empresa_slug: string } }) {
  const db = createAdminClient()

  const { data: empresa } = await db
    .from('empresas')
    .select('id, nombre, ciudad, activo')
    .eq('id', params.empresa_slug)
    .eq('activo', true)
    .single()

  if (!empresa) notFound()

  // Featured properties for initial canvas
  const { data: destacadas } = await db
    .from('propiedades')
    .select(
      'id, codigo, ubicacion, ciudad, tipo_inmueble, tipo_negocio, precio, area_m2, habitaciones, banos, parqueaderos, estrato, descripcion, imagenes, enlace_portal, codigo_portal'
    )
    .eq('empresa_id', empresa.id)
    .eq('estado', 'activo')
    .order('created_at', { ascending: false })
    .limit(9)

  const featuredProperties: PropertyItem[] = (destacadas ?? []).map((p) => ({
    id: p.id,
    codigo: p.codigo,
    ubicacion: p.ubicacion,
    ciudad: p.ciudad,
    tipo_inmueble: p.tipo_inmueble,
    tipo_negocio: p.tipo_negocio,
    precio: p.precio,
    area_m2: p.area_m2,
    habitaciones: p.habitaciones,
    banos: p.banos,
    parqueaderos: p.parqueaderos,
    estrato: p.estrato,
    descripcion: p.descripcion,
    imagenes: p.imagenes ?? [],
    enlace_portal: p.enlace_portal,
    codigo_portal: p.codigo_portal,
  }))

  return (
    <PortalV2
      empresa={{ id: empresa.id, nombre: empresa.nombre, ciudad: empresa.ciudad }}
      featuredProperties={featuredProperties}
    />
  )
}
