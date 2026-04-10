import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { createTransaction, generateReference, getPublicKey } from '@/lib/api/wompi'
import { PLANES } from '@/lib/constants'

export async function POST(req: NextRequest) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { plan, empresa_id } = await req.json()
  if (!plan || !empresa_id) return NextResponse.json({ error: 'plan y empresa_id requeridos' }, { status: 400 })

  const planData = PLANES[plan as keyof typeof PLANES]
  if (!planData) return NextResponse.json({ error: 'Plan inválido' }, { status: 400 })

  const reference = generateReference(empresa_id, plan)
  const amountInCents = planData.precio * 100

  try {
    const publicKey = getPublicKey()
    // Build Wompi checkout URL directly (redirect flow)
    const params = new URLSearchParams({
      'public-key': publicKey,
      currency: 'COP',
      'amount-in-cents': String(amountInCents),
      reference,
      'redirect-url': `${process.env.NEXT_PUBLIC_APP_URL}/pagos?status=done`,
    })
    const checkout_url = `https://checkout.wompi.co/p/?${params.toString()}`

    // Register pending payment
    const db = createAdminClient()
    await db.from('pagos').insert({
      empresa_id,
      monto: amountInCents,
      moneda: 'COP',
      estado: 'pendiente',
      wompi_reference: reference,
      descripcion: `Suscripción ${planData.nombre} — Rentmies`,
      metadata: { plan },
    })

    return NextResponse.json({ checkout_url, reference })
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}
