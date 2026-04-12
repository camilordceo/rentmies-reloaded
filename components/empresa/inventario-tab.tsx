'use client'

import { useState, useMemo } from 'react'
import { Download, X, ChevronDown } from 'lucide-react'
import { formatCurrency } from '@/lib/utils'
import type { Propiedad } from '@/lib/types/database'

function PropiedadModal({ prop, onClose }: { prop: Propiedad; onClose: () => void }) {
  const sections = [
    { key: 'desc', label: 'Descripción Inmueble', content: prop.descripcion || 'Sin descripción' },
    {
      key: 'info', label: 'Información Inmueble', content: [
        prop.habitaciones && `Habitaciones: ${prop.habitaciones}`,
        prop.banos && `Baños: ${prop.banos}`,
        prop.parqueaderos && `Parqueaderos: ${prop.parqueaderos}`,
        prop.area_m2 && `Área: ${prop.area_m2} m²`,
        prop.estrato && `Estrato: ${prop.estrato}`,
        prop.antiguedad && `Antigüedad: ${prop.antiguedad}`,
      ].filter(Boolean).join(' · ') || 'Sin datos',
    },
    { key: 'portal', label: 'Código Portales', content: prop.codigo_portal || 'Sin código' },
    { key: 'enlace', label: 'Enlaces Relacionados', content: prop.enlace_portal || 'Sin enlace' },
  ]
  const [open, setOpen] = useState<Set<string>>(new Set(['desc']))

  return (
    <div className="fixed inset-0 bg-on-surface/40 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-surface-container-lowest rounded-2xl shadow-editorial max-w-lg w-full max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
        <div className="p-5 flex items-start justify-between">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${prop.tipo_negocio === 'Venta' ? 'bg-brand-teal/10 text-brand-teal' : 'bg-blue-50 text-blue-600'}`}>
                {prop.tipo_negocio}
              </span>
              {prop.codigo && (
                <span className="text-[10px] font-mono text-on-surface/40">{prop.codigo}</span>
              )}
            </div>
            <p className="text-2xl font-semibold text-authority-green">{prop.precio ? formatCurrency(prop.precio) : '—'}</p>
            {prop.precio_administracion && (
              <p className="text-xs text-on-surface/50 mt-0.5">Adm: {formatCurrency(prop.precio_administracion)}/mes</p>
            )}
          </div>
          <button onClick={onClose} className="text-on-surface/40 hover:text-on-surface transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>
        <div className="px-5 pb-5 space-y-2">
          <p className="text-xs text-on-surface/50 mb-4">{prop.ubicacion} · {prop.ciudad}</p>
          {sections.map(s => (
            <div key={s.key} className="bg-surface-container rounded-xl overflow-hidden">
              <button
                onClick={() => setOpen(p => { const n = new Set(p); n.has(s.key) ? n.delete(s.key) : n.add(s.key); return n })}
                className="w-full flex items-center justify-between px-4 py-3 text-sm font-semibold text-on-surface hover:bg-surface-container-high transition-colors"
              >
                {s.label}
                <ChevronDown className={`w-4 h-4 text-on-surface/40 transition-transform ${open.has(s.key) ? 'rotate-180' : ''}`} />
              </button>
              {open.has(s.key) && (
                <div className="px-4 pb-3 text-sm text-on-surface/60 leading-relaxed">{s.content}</div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export function InventarioTab({ propiedades, updatedAt }: { propiedades: Propiedad[]; updatedAt?: string }) {
  const [search, setSearch] = useState('')
  const [tipoFilter, setTipoFilter] = useState('')
  const [selected, setSelected] = useState<Propiedad | null>(null)

  const filtered = useMemo(() => propiedades.filter(p => {
    const matchSearch = !search || p.codigo?.toLowerCase().includes(search.toLowerCase()) || p.ciudad?.toLowerCase().includes(search.toLowerCase()) || p.ubicacion?.toLowerCase().includes(search.toLowerCase())
    const matchTipo = !tipoFilter || p.tipo_negocio === tipoFilter
    return matchSearch && matchTipo
  }), [propiedades, search, tipoFilter])

  return (
    <div className="space-y-4">
      {/* Sub-tabs */}
      <div className="flex items-center gap-1 bg-surface-container rounded-xl p-1 w-fit">
        {['Consultar Inventario', 'Portales', 'CRMs'].map((t, i) => (
          <button
            key={t}
            className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-all ${i === 0 ? 'bg-surface-container-lowest text-on-surface shadow-editorial' : 'text-on-surface/50 hover:text-on-surface'}`}
          >
            {t}
          </button>
        ))}
      </div>

      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-4">
          {updatedAt && <span className="text-xs text-on-surface/40">Actualizado: {updatedAt}</span>}
          <span className="text-xs font-semibold text-on-surface">{propiedades.length} propiedades</span>
        </div>
        <button className="flex items-center gap-2 px-4 py-2 bg-authority-green text-white text-sm font-semibold rounded-lg hover:bg-authority-green/90 transition-all">
          <Download className="w-3.5 h-3.5" /> Descargar Inventario
        </button>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-3 flex-wrap">
        <input
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Buscar por código o ciudad..."
          className="h-9 px-3 bg-surface-container rounded-lg text-sm text-on-surface placeholder:text-on-surface/35 outline-none focus:ring-2 focus:ring-brand-teal/30 transition-all w-56"
        />
        <select
          value={tipoFilter}
          onChange={e => setTipoFilter(e.target.value)}
          className="h-9 px-3 bg-surface-container rounded-lg text-sm text-on-surface outline-none focus:ring-2 focus:ring-brand-teal/30 transition-all"
        >
          <option value="">Todos los tipos</option>
          {['Venta', 'Arriendo', 'Venta/Arriendo'].map(t => <option key={t} value={t}>{t}</option>)}
        </select>
        {(search || tipoFilter) && (
          <button onClick={() => { setSearch(''); setTipoFilter('') }} className="text-xs text-brand-teal hover:text-authority-green font-medium transition-colors">
            Limpiar filtros
          </button>
        )}
      </div>

      {/* Table */}
      <div className="bg-surface-container-lowest rounded-xl overflow-hidden shadow-editorial">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-surface-container">
                {['Código', 'Ubicación', 'Área m²', 'Inmueble', 'Tipo', 'Precio'].map(h => (
                  <th key={h} className="px-4 py-3 text-left text-[10px] font-bold uppercase tracking-widest text-on-surface/40">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-10 text-center text-sm text-on-surface/40">Sin propiedades</td>
                </tr>
              ) : filtered.map((p, i) => (
                <tr
                  key={p.id}
                  onClick={() => setSelected(p)}
                  className={`cursor-pointer transition-colors hover:bg-surface-container-low ${i > 0 ? 'border-t border-outline-variant/10' : ''}`}
                >
                  <td className="px-4 py-3 font-mono text-xs text-on-surface/70">{p.codigo}</td>
                  <td className="px-4 py-3 text-on-surface/60 max-w-[200px] truncate">{p.ubicacion || p.ciudad || '—'}</td>
                  <td className="px-4 py-3 text-on-surface/70">{p.area_m2 ? `${p.area_m2} m²` : '—'}</td>
                  <td className="px-4 py-3 text-on-surface/60">{p.tipo_inmueble || '—'}</td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${p.tipo_negocio === 'Venta' ? 'bg-brand-teal/10 text-brand-teal' : p.tipo_negocio === 'Arriendo' ? 'bg-blue-50 text-blue-600' : 'bg-amber-50 text-amber-600'}`}>
                      {p.tipo_negocio || '—'}
                    </span>
                  </td>
                  <td className="px-4 py-3 font-semibold text-authority-green">{p.precio ? formatCurrency(p.precio) : '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {selected && <PropiedadModal prop={selected} onClose={() => setSelected(null)} />}
    </div>
  )
}
