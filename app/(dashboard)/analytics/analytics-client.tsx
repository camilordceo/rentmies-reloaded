'use client'

import { AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'
import { Download, TrendingUp, Users, MessageSquare, Calendar } from 'lucide-react'
import type { AnalyticsDiario } from '@/lib/types/database'

const COLORS = ['#40d99d', '#4fffb4', '#6b7280', '#dc2626']

interface AnalyticsClientProps {
  analytics: AnalyticsDiario[]
  stats: { totalLeads: number; convCount: number; citasCount: number; leads: number; conversaciones: number; solicitudes: number; cierres: number; mensajes: number }
}

export function AnalyticsClient({ analytics, stats }: AnalyticsClientProps) {
  const trendData = analytics.map(d => ({
    fecha: new Date(d.fecha).toLocaleDateString('es-CO', { month: 'short', day: 'numeric' }),
    leads: d.leads_nuevos,
    conversaciones: d.conversaciones,
    solicitudes: d.solicitudes,
    cierres: d.cierres,
    mensajes: d.mensajes_enviados,
  }))

  const funnelData = [
    { name: 'Leads', valor: stats.totalLeads, pct: '100%' },
    { name: '≥2 Interacciones', valor: Math.round(stats.totalLeads * 0.85), pct: '85%' },
    { name: 'Solicitudes', valor: Math.round(stats.totalLeads * 0.45), pct: '45%' },
    { name: 'Cierres', valor: stats.cierres || 0, pct: '0%' },
  ]

  const pieData = [
    { name: 'Metrocuadrado', value: 35 },
    { name: 'Ciencuadras', value: 25 },
    { name: 'WhatsApp', value: 20 },
    { name: 'Finca Raiz', value: 12 },
    { name: 'Otros', value: 8 },
  ]

  const statCards = [
    { label: 'Leads totales', value: stats.totalLeads, sub: 'Base del funnel', icon: Users, color: 'text-blue-600 bg-blue-50' },
    { label: 'Conversaciones', value: stats.convCount, sub: `${stats.totalLeads > 0 ? Math.round(stats.convCount / stats.totalLeads * 100) : 0}% de leads`, icon: MessageSquare, color: 'text-[#40d99d] bg-[#40d99d]/10' },
    { label: 'Solicitudes', value: stats.solicitudes, sub: `${stats.totalLeads > 0 ? Math.round(stats.solicitudes / stats.totalLeads * 100) : 0}% de interacciones`, icon: TrendingUp, color: 'text-amber-600 bg-amber-50' },
    { label: 'Cierres', value: stats.cierres, sub: '0.00% de solicitudes', icon: Calendar, color: 'text-[#6b7280] bg-[#f0f0f0]' },
  ]

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-medium text-[#1a1a1a]">Analytics</h1>
        <button className="flex items-center gap-2 px-4 py-2 bg-[#40d99d] text-white text-sm font-medium rounded-lg hover:bg-[#40d99d]/90 transition-all">
          <Download className="w-4 h-4" />Exportar
        </button>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map(s => (
          <div key={s.label} className="bg-white border border-[#e5e5e5] rounded-xl p-5 shadow-sm">
            <div className={`w-9 h-9 rounded-xl flex items-center justify-center mb-3 ${s.color}`}>
              <s.icon className="w-4 h-4" />
            </div>
            <p className="text-2xl font-medium text-[#1a1a1a]">{s.value.toLocaleString('es-CO')}</p>
            <p className="text-xs text-[#6b7280] mt-0.5">{s.label}</p>
            <p className="text-xs text-[#6b7280] mt-0.5">{s.sub}</p>
          </div>
        ))}
      </div>

      {/* Trend chart */}
      <div className="bg-white border border-[#e5e5e5] rounded-xl p-5 shadow-sm">
        <h3 className="text-sm font-medium text-[#1a1a1a] mb-4">Tendencia de conversión — últimos 7 días</h3>
        {trendData.length > 0 ? (
          <ResponsiveContainer width="100%" height={220}>
            <AreaChart data={trendData}>
              <defs>
                {['leads','conversaciones','solicitudes'].map((k,i) => (
                  <linearGradient key={k} id={`grad-${k}`} x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={COLORS[i]} stopOpacity={0.15}/>
                    <stop offset="95%" stopColor={COLORS[i]} stopOpacity={0}/>
                  </linearGradient>
                ))}
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="fecha" tick={{ fontSize: 11, fill: '#6b7280' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: '#6b7280' }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={{ borderRadius: 8, border: '1px solid #e5e5e5', fontSize: 12 }} />
              <Legend iconSize={8} wrapperStyle={{ fontSize: 12 }} />
              <Area type="monotone" dataKey="leads" stroke="#40d99d" fill="url(#grad-leads)" strokeWidth={2} name="Leads" />
              <Area type="monotone" dataKey="conversaciones" stroke="#4fffb4" fill="url(#grad-conversaciones)" strokeWidth={2} name="Conversaciones" />
              <Area type="monotone" dataKey="solicitudes" stroke="#6b7280" fill="url(#grad-solicitudes)" strokeWidth={2} name="Solicitudes" />
            </AreaChart>
          </ResponsiveContainer>
        ) : (
          <div className="h-56 flex items-center justify-center text-sm text-[#6b7280]">Sin datos en el período seleccionado</div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Funnel */}
        <div className="bg-white border border-[#e5e5e5] rounded-xl p-5 shadow-sm">
          <h3 className="text-sm font-medium text-[#1a1a1a] mb-4">Funnel de conversión</h3>
          <div className="space-y-2">
            {funnelData.map((d, i) => (
              <div key={d.name}>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs text-[#6b7280]">{d.name}</span>
                  <span className="text-xs font-medium text-[#1a1a1a]">{d.valor} · {d.pct}</span>
                </div>
                <div className="h-6 bg-[#f0f0f0] rounded-lg overflow-hidden">
                  <div className="h-full rounded-lg transition-all flex items-center px-2" style={{ width: `${Math.max(parseInt(d.pct), 3)}%`, background: COLORS[i] }}>
                    <span className="text-[10px] text-white font-medium">{d.valor}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Origin */}
        <div className="bg-white border border-[#e5e5e5] rounded-xl p-5 shadow-sm">
          <h3 className="text-sm font-medium text-[#1a1a1a] mb-4">Origen del contacto</h3>
          <div className="flex items-center gap-4">
            <ResponsiveContainer width={140} height={140}>
              <PieChart>
                <Pie data={pieData} cx="50%" cy="50%" innerRadius={40} outerRadius={65} paddingAngle={2} dataKey="value">
                  {pieData.map((_, i) => <Cell key={i} fill={['#40d99d','#4fffb4','#6b7280','#3b82f6','#e5e5e5'][i]} />)}
                </Pie>
                <Tooltip contentStyle={{ borderRadius: 8, border: '1px solid #e5e5e5', fontSize: 11 }} />
              </PieChart>
            </ResponsiveContainer>
            <div className="flex-1 space-y-1.5">
              {pieData.map((d, i) => (
                <div key={d.name} className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <div className="w-2 h-2 rounded-full" style={{ background: ['#40d99d','#4fffb4','#6b7280','#3b82f6','#e5e5e5'][i] }} />
                    <span className="text-xs text-[#6b7280]">{d.name}</span>
                  </div>
                  <span className="text-xs font-medium text-[#1a1a1a]">{d.value}%</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
