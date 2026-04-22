import { NextRequest, NextResponse } from 'next/server'

const EQUIVALENTS_VENTA: Array<{ label: string; fn: (cb: number, precio?: number) => string | number }> = [
  { label: 'Meses de administración pagados', fn: (cb) => Math.round(cb / 350_000) },
  { label: 'Cuotas de crédito hipotecario', fn: (cb) => Math.round(cb / 1_800_000) },
  { label: '% del pie (30%) recuperado', fn: (cb, precio = 0) => ((cb / (precio * 0.3)) * 100).toFixed(1) + '%' },
  { label: 'Viajes a San Andrés para 2', fn: (cb) => Math.round(cb / 2_800_000) },
]

const EQUIVALENTS_ARRIENDO: Array<{ label: string; fn: (cb: number, precio?: number) => string | number }> = [
  { label: 'Meses de arriendo gratis', fn: (cb, precio = 1) => (cb / precio).toFixed(1) },
  { label: 'Pagas 10 meses, vives 12', fn: () => '✓' },
  { label: 'Ahorro vs. portal tradicional', fn: () => '100%' },
  { label: 'Cenas para 2 en restaurante top', fn: (cb) => Math.round(cb / 280_000) },
]

export async function POST(req: NextRequest) {
  const { precio, tipo } = await req.json()
  if (!precio || !tipo) {
    return NextResponse.json({ error: 'precio y tipo son requeridos' }, { status: 400 })
  }

  const rate = tipo === 'Arriendo' ? 0.10 : 0.01
  const cashback_amount = Math.round(precio * rate)

  const equivalents =
    tipo === 'Arriendo'
      ? EQUIVALENTS_ARRIENDO.map((eq) => ({
          label: eq.label,
          value: eq.fn(cashback_amount, precio),
        }))
      : EQUIVALENTS_VENTA.map((eq) => ({
          label: eq.label,
          value: eq.fn(cashback_amount, precio),
        }))

  const equivalent_text =
    tipo === 'Arriendo'
      ? `= ${(cashback_amount / precio).toFixed(1)} meses gratis`
      : `= ${Math.round(cashback_amount / 2_800_000)} viajes a San Andrés`

  return NextResponse.json({
    cashback_amount,
    rate,
    equivalent_text,
    equivalents,
  })
}
