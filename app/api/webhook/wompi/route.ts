import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { verifyWebhookSignature } from '@/lib/api/wompi'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const signature = req.headers.get('x-event-checksum') || ''

    const timestamp = req.headers.get('x-event-timestamp') || ''
    if (!await verifyWebhookSignature(body, timestamp, signature)) {
      return NextResponse.json({ error: 'Invalid signature' }, { status: 401 })
    }

    const { event, data } = body
    if (event !== 'transaction.updated') return NextResponse.json({ ok: true })

    const tx = data?.transaction
    if (!tx) return NextResponse.json({ ok: true })

    const db = createAdminClient()
    const estado = tx.status === 'APPROVED' ? 'aprobado' : tx.status === 'DECLINED' ? 'rechazado' : 'pendiente'

    // Update payment record
    const { data: pago } = await db
      .from('pagos')
      .update({ estado, wompi_transaction_id: tx.id, metodo_pago: tx.payment_method_type })
      .eq('wompi_reference', tx.reference)
      .select()
      .single()

    // Activate subscription on approval
    if (estado === 'aprobado' && pago) {
      const plan = (pago.metadata as any)?.plan || 'starter'
      const fechaInicio = new Date()
      const fechaFin = new Date(fechaInicio)
      fechaFin.setMonth(fechaFin.getMonth() + 1)

      await db.from('suscripciones').upsert({
        empresa_id: pago.empresa_id,
        plan,
        estado: 'activa',
        fecha_inicio: fechaInicio.toISOString(),
        fecha_fin: fechaFin.toISOString(),
        monto_mensual: tx.amount_in_cents,
        moneda: 'COP',
      }, { onConflict: 'empresa_id' })
    }

    return NextResponse.json({ ok: true })
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}
