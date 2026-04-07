import { NextRequest, NextResponse } from 'next/server'

const CALLBELL_TOKEN = process.env.CALLBELL_TOKEN!
const NOTIFY_PHONE = process.env.PARTNERSHIPS_NOTIFY_PHONE || '+573103565492'
const CALLBELL_CHANNEL = process.env.CALLBELL_CHANNEL_UUID || 'a2e109f41ee2458bb6c08'

export async function POST(req: NextRequest) {
  try {
    const data = await req.json()

    const {
      full_name, email, brokerage_name, city,
      avg_sales_month, avg_closing_price, num_agents,
      phone, marketing_channels, growth_challenge,
    } = data

    // Validate required fields server-side
    const missing = [full_name, email, brokerage_name, city, avg_sales_month, avg_closing_price, num_agents, phone]
      .some(v => !v || String(v).trim() === '')
    if (missing) {
      return NextResponse.json({ error: 'Faltan campos obligatorios' }, { status: 400 })
    }

    // Build WhatsApp message
    const msg = [
      '🏢 *Nueva aplicación de alianza*',
      '',
      `👤 ${full_name}`,
      `🏠 ${brokerage_name}`,
      `📍 ${city}`,
      `📊 Ventas/mes: ${avg_sales_month}`,
      `💰 Precio promedio: ${avg_closing_price}`,
      `👥 Asesores: ${num_agents}`,
      `📱 ${phone}`,
      `📧 ${email}`,
      '',
      `📣 Canales: ${marketing_channels || 'N/A'}`,
      `🎯 Reto: ${growth_challenge || 'N/A'}`,
    ].join('\n')

    const waRes = await fetch('https://api.callbell.eu/v1/messages/send', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${CALLBELL_TOKEN}`,
      },
      body: JSON.stringify({
        to: NOTIFY_PHONE,
        from: 'whatsapp',
        type: 'text',
        channel_uuid: CALLBELL_CHANNEL,
        content: { text: msg },
      }),
    })

    if (!waRes.ok) {
      const body = await waRes.text()
      console.error('Callbell error:', waRes.status, body)
      return NextResponse.json({ error: 'Error al enviar notificación' }, { status: 500 })
    }

    return NextResponse.json({ ok: true })
  } catch (err) {
    console.error('partnerships route error:', err)
    return NextResponse.json({ error: 'Error interno' }, { status: 500 })
  }
}
