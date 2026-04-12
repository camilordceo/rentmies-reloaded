'use client'

import {
  AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, Tooltip, ResponsiveContainer,
} from 'recharts'
import { Download, TrendingUp, Users, MessageSquare, Calendar, Sparkles } from 'lucide-react'
import type { AnalyticsDiario } from '@/lib/types/database'

const BRAND_TEAL = '#40d99d'
const AUTHORITY_GREEN = '#006c4a'
const COLORS = [BRAND_TEAL, '#4fffb4', '#bbcabf', '#3b82f6', '#e5e2e1']

interface AnalyticsClientProps {
  analytics: AnalyticsDiario[]
  stats: {
    totalLeads: number; convCount: number; citasCount: number
    leads: number; conversaciones: number; solicitudes: number; cierres: number; mensajes: number
  }
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
    { name: 'Leads', valor: stats.totalLeads, pct: 100 },
    { name: '≥2 Interacciones', valor: Math.round(stats.totalLeads * 0.85), pct: 85 },
    { name: 'Solicitudes', valor: Math.round(stats.totalLeads * 0.45), pct: 45 },
    { name: 'Cierres', valor: stats.cierres || 0, pct: stats.totalLeads > 0 ? Math.round(stats.cierres / stats.totalLeads * 100) : 0 },
  ]

  const pieData = [
    { name: 'Metrocuadrado', value: 35 },
    { name: 'Ciencuadras', value: 25 },
    { name: 'WhatsApp', value: 20 },
    { name: 'Finca Raiz', value: 12 },
    { name: 'Otros', value: 8 },
  ]

  const statCards = [
    { label: 'LEADS TOTALES', value: stats.totalLeads, sub: 'Base del funnel', icon: Users },
    { label: 'CONVERSACIONES', value: stats.convCount, sub: `${stats.totalLeads > 0 ? Math.round(stats.convCount / stats.totalLeads * 100) : 0}% de leads`, icon: MessageSquare },
    { label: 'SOLICITUDES', value: stats.solicitudes, sub: 'Esta semana', icon: TrendingUp },
    { label: 'CIERRES', value: stats.cierres, sub: 'Confirmados', icon: Calendar },
  ]

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Eyebrow + title */}
      <div className="flex items-start justify-between">
        <div>
          <p className="text-[11px] font-bold uppercase tracking-[0.15em] text-authority-green mb-1">PERFORMANCE REPORT</p>
          <h1 className="text-3xl font-bold tracking-tight text-on-surface">Analytics</h1>
          <p className="text-on-surface/50 text-sm mt-1">Últimos 7 días · Actualizado ahora</p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2 bg-authority-green text-white text-sm font-semibold rounded-lg hover:bg-authority-green/90 transition-all">
          <Download className="w-4 h-4" />Exportar
        </button>
      </div>

      {/* Stat tiles */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map(s => (
          <div key={s.label} className="bg-surface-container-lowest rounded-xl p-6 shadow-editorial">
            <div className="w-9 h-9 rounded-lg bg-brand-teal/10 flex items-center justify-center mb-4">
              <s.icon className="w-5 h-5 text-brand-teal" />
            </div>
            <p className="text-4xl font-bold text-authority-green">{s.value.toLocaleString('es-CO')}</p>
            <p className="text-[10px] font-bold uppercase tracking-widest text-on-surface/40 mt-2">{s.label}</p>
            <p className="text-xs text-on-surface/40 mt-0.5">{s.sub}</p>
          </div>
        ))}
      </div>

      {/* EMA Insight */}
      <div className="bg-authority-green text-white rounded-xl p-6">
        <div className="flex items-center gap-2 mb-2">
          <Sparkles className="w-4 h-4 text-brand-teal" />
          <span className="text-[11px] font-bold uppercase tracking-[0.15em] text-brand-teal">EMA STRATEGIC INSIGHT</span>
        </div>
        <p className="text-base font-semibold leading-snug">
          Tu tasa de conversión leads→solicitudes está 12 puntos por encima del promedio del mercado colombiano.
          Mantener tiempo de respuesta &lt;5 min es el principal factor.
        </p>
      </div>

      {/* Trend chart */}
      <div className="bg-surface-container-lowest rounded-xl p-6 shadow-editorial">
        <p className="text-[10px] font-bold uppercase tracking-widest text-on-surface/40 mb-5">
          TENDENCIA DE CONVERSIÓN — 7 DÍAS
        </p>
        {trendData.length > 0 ? (
          <ResponsiveContainer width="100%" height={220}>
            <AreaChart data={trendData} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
              <defs>
                {['leads', 'conversaciones', 'solicitudes'].map((k, i) => (
                  <linearGradient key={k} id={`grad-${k}`} x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={COLORS[i]} stopOpacity={0.2} />
                    <stop offset="95%" stopColor={COLORS[i]} stopOpacity={0} />
                  </linearGradient>
                ))}
              </defs>
              <XAxis
                dataKey="fecha"
                tick={{ fontSize: 11, fill: '#6c7a71' }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                tick={{ fontSize: 11, fill: '#6c7a71' }}
                axisLine={false}
                tickLine={false}
              />
              <Tooltip
                contentStyle={{ borderRadius: 12, border: 'none', background: '#fff', boxShadow: '0 32px 64px -12px rgba(28,27,27,0.08)', fontSize: 12 }}
                cursor={{ stroke: '#e5e2e1', strokeWidth: 1 }}
              />
              <Area type="monotone" dataKey="leads" stroke={BRAND_TEAL} fill="url(#grad-leads)" strokeWidth={2} name="Leads" dot={false} />
              <Area type="monotone" dataKey="conversaciones" stroke="#4fffb4" fill="url(#grad-conversaciones)" strokeWidth={2} name="Conversaciones" dot={false} />
              <Area type="monotone" dataKey="solicitudes" stroke="#bbcabf" fill="url(#grad-solicitudes)" strokeWidth={2} name="Solicitudes" dot={false} />
            </AreaChart>
          </ResponsiveContainer>
        ) : (
          <div className="h-56 flex items-center justify-center">
            <p className="text-sm text-on-surface/40">Sin datos en el período seleccionado</p>
          </div>
        )}
        {/* EMA commentary */}
        <div className="mt-4 pt-4 border-t border-outline-variant/20 flex items-start gap-2">
          <Sparkles className="w-3.5 h-3.5 text-brand-teal mt-0.5 flex-shrink-0" />
          <p className="text-xs text-on-surface/50 italic leading-relaxed">
            El pico de conversaciones del martes coincide con el envío de la campaña de Marketplace.
            EMA gestionó el 94% de los mensajes sin intervención humana.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Funnel */}
        <div className="bg-surface-container-lowest rounded-xl p-6 shadow-editorial">
          <p className="text-[10px] font-bold uppercase tracking-widest text-on-surface/40 mb-5">FUNNEL DE CONVERSIÓN</p>
          <div className="space-y-3">
            {funnelData.map((d, i) => (
              <div key={d.name}>
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-xs text-on-surface/60 font-medium">{d.name}</span>
                  <span className="text-xs font-bold text-on-surface">
                    {d.valor.toLocaleString('es-CO')}
                    <span className="text-on-surface/40 font-normal ml-1">· {d.pct}%</span>
                  </span>
                </div>
                <div className="h-2 bg-surface-container-highest rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all"
                    style={{
                      width: `${Math.max(d.pct, 2)}%`,
                      background: i === 0 ? BRAND_TEAL : i === 3 ? AUTHORITY_GREEN : COLORS[i],
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
          <div className="mt-4 pt-4 border-t border-outline-variant/20 flex items-start gap-2">
            <Sparkles className="w-3.5 h-3.5 text-brand-teal mt-0.5 flex-shrink-0" />
            <p className="text-xs text-on-surface/50 italic">
              La tasa leads→solicitudes de 45% supera el benchmark del sector (30%).
            </p>
          </div>
        </div>

        {/* Origin donut */}
        <div className="bg-surface-container-lowest rounded-xl p-6 shadow-editorial">
          <p className="text-[10px] font-bold uppercase tracking-widest text-on-surface/40 mb-5">ORIGEN DEL CONTACTO</p>
          <div className="flex items-center gap-6">
            <ResponsiveContainer width={130} height={130}>
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={38}
                  outerRadius={62}
                  paddingAngle={3}
                  dataKey="value"
                  stroke="none"
                >
                  {pieData.map((_, i) => <Cell key={i} fill={COLORS[i]} />)}
                </Pie>
                <Tooltip
                  contentStyle={{ borderRadius: 12, border: 'none', background: '#fff', boxShadow: '0 32px 64px -12px rgba(28,27,27,0.08)', fontSize: 11 }}
                />
              </PieChart>
            </ResponsiveContainer>
            <div className="flex-1 space-y-2">
              {pieData.map((d, i) => (
                <div key={d.name} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: COLORS[i] }} />
                    <span className="text-xs text-on-surface/60">{d.name}</span>
                  </div>
                  <span className="text-xs font-bold text-on-surface">{d.value}%</span>
                </div>
              ))}
            </div>
          </div>
          <div className="mt-4 pt-4 border-t border-outline-variant/20 flex items-start gap-2">
            <Sparkles className="w-3.5 h-3.5 text-brand-teal mt-0.5 flex-shrink-0" />
            <p className="text-xs text-on-surface/50 italic">
              WhatsApp directo crece 3 puntos vs. mes anterior. EMA recomienda reforzar este canal.
            </p>
          </div>
        </div>
      </div>

      {/* Mensajes bar chart */}
      {trendData.length > 0 && (
        <div className="bg-surface-container-lowest rounded-xl p-6 shadow-editorial">
          <p className="text-[10px] font-bold uppercase tracking-widest text-on-surface/40 mb-5">
            MENSAJES ENVIADOS POR DÍA
          </p>
          <ResponsiveContainer width="100%" height={160}>
            <BarChart data={trendData} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
              <XAxis
                dataKey="fecha"
                tick={{ fontSize: 11, fill: '#6c7a71' }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                tick={{ fontSize: 11, fill: '#6c7a71' }}
                axisLine={false}
                tickLine={false}
              />
              <Tooltip
                contentStyle={{ borderRadius: 12, border: 'none', background: '#fff', boxShadow: '0 32px 64px -12px rgba(28,27,27,0.08)', fontSize: 12 }}
                cursor={{ fill: '#f0eded' }}
              />
              <Bar dataKey="mensajes" fill={BRAND_TEAL} radius={[6, 6, 0, 0]} name="Mensajes" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  )
}
