'use client'

import { useState, useMemo } from 'react'
import { Download, X, ChevronDown } from 'lucide-react'
import { formatCurrency } from '@/lib/utils'
import type { Propiedad } from '@/lib/types/database'

function PropiedadModal({ prop, onClose }: { prop: Propiedad; onClose: () => void }) {
  const sections = [
    { key: 'desc', label: 'Descripción Inmueble', content: prop.descripcion || 'Sin descripción' },
    { key: 'info', label: 'Información Inmueble', content: [
      prop.habitaciones && `Habitaciones: ${prop.habitaciones}`,
      prop.banos && `Baños: ${prop.banos}`,
      prop.parqueaderos && `Parqueaderos: ${prop.parqueaderos}`,
      prop.area_m2 && `Área: ${prop.area_m2} m²`,
      prop.estrato && `Estrato: ${prop.estrato}`,
      prop.antiguedad && `Antigüedad: ${prop.antiguedad}`,
    ].filter(Boolean).join(' · ') || 'Sin datos' },
    { key: 'portal', label: 'Código Portales', content: prop.codigo_portal || 'Sin código' },
    { key: 'enlace', label: 'Enlaces Relacionados', content: prop.enlace_portal || 'Sin enlace' },
  ]
  const [open, setOpen] = useState<Set<string>>(new Set(['desc']))

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-white rounded-2xl shadow-xl max-w-lg w-full max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
        <div className="p-5 border-b border-[#e5e5e5] flex items-start justify-between">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${prop.tipo_negocio === 'Venta' ? 'bg-[#40d99d]/10 text-[#40d99d]' : 'bg-blue-50 text-blue-600'}`}>{prop.tipo_negocio}</span>
            </div>
            <p className="text-lg font-medium text-[#1a1a1a]">{prop.precio ? formatCurrency(prop.precio) : '—'}</p>
            {prop.precio_administracion && <p className="text-xs text-[#6b7280]">Adm: {formatCurrency(prop.precio_administracion)}/mes</p>}
          </div>
          <button onClick={onClose} className="text-[#6b7280] hover:text-[#1a1a1a]"><X className="w-5 h-5" /></button>
        </div>
        <div className="p-5 space-y-2">
          <p className="text-xs text-[#6b7280] mb-3">{prop.ubicacion} · {prop.ciudad}</p>
          {sections.map(s => (
            <div key={s.key} className="border border-[#e5e5e5] rounded-lg overflow-hidden">
              <button onClick={() => setOpen(p => { const n = new Set(p); n.has(s.key) ? n.delete(s.key) : n.add(s.key); return n })}
                className="w-full flex items-center justify-between px-4 py-3 text-sm font-medium text-[#1a1a1a] hover:bg-[#f8f8f8]">
                {s.label}<ChevronDown className={`w-4 h-4 transition-transform ${open.has(s.key) ? 'rotate-180' : ''}`} />
              </button>
              {open.has(s.key) && <div className="px-4 pb-3 text-sm text-[#6b7280]">{s.content}</div>}
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
      {/* Sub-tabs placeholder */}
      <div className="flex items-center gap-1 bg-[#f0f0f0] rounded-lg p-1 w-fit">
        {['Consultar Inventario','Portales','CRMs'].map((t,i) => (
          <button key={t} className={`px-3 py-1.5 text-xs font-medium rounded-md transition-all ${i===0?'bg-white text-[#1a1a1a] shadow-sm':'text-[#6b7280]'}`}>{t}</button>
        ))}
      </div>

      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-4 text-xs text-[#6b7280]">
          {updatedAt && <span>Última actualización: {updatedAt}</span>}
          <span className="font-medium text-[#1a1a1a]">Número de propiedades: {propiedades.length}</span>
        </div>
        <button className="flex items-center gap-2 px-3 py-2 bg-[#40d99d] text-white text-sm font-medium rounded-lg hover:bg-[#40d99d]/90">
          <Download className="w-4 h-4" /> Descargar Inventario
        </button>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-3 flex-wrap">
        <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Buscar por código o ciudad..."
          className="h-9 px-3 border border-[#e5e5e5] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#40d99d] w-56" />
        <select value={tipoFilter} onChange={e => setTipoFilter(e.target.value)}
          className="h-9 px-3 border border-[#e5e5e5] rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[#40d99d]">
          <option value="">Todos los tipos</option>
          {['Venta','Arriendo','Venta/Arriendo'].map(t => <option key={t} value={t}>{t}</option>)}
        </select>
        {(search || tipoFilter) && <button onClick={() => { setSearch(''); setTipoFilter('') }} className="text-xs text-[#40d99d] hover:underline">Limpiar Filtros</button>}
      </div>

      {/* Table */}
      <div className="bg-white border border-[#e5e5e5] rounded-xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead><tr className="border-b border-[#e5e5e5] bg-[#f8f8f8]">
              {['Código','Ubicación','Área m²','Inmueble','Tipo','Precio'].map(h => (
                <th key={h} className="px-4 py-3 text-left text-xs font-medium text-[#6b7280] uppercase tracking-wide">{h}</th>
              ))}
            </tr></thead>
            <tbody className="divide-y divide-[#e5e5e5]">
              {filtered.length === 0 ? (
                <tr><td colSpan={6} className="px-4 py-8 text-center text-sm text-[#6b7280]">Sin propiedades</td></tr>
              ) : filtered.map(p => (
                <tr key={p.id} onClick={() => setSelected(p)} className="hover:bg-[#f8f8f8] cursor-pointer transition-colors">
                  <td className="px-4 py-3 font-mono text-xs text-[#1a1a1a]">{p.codigo}</td>
                  <td className="px-4 py-3 text-[#6b7280] max-w-[200px] truncate">{p.ubicacion || p.ciudad || '—'}</td>
                  <td className="px-4 py-3 text-[#1a1a1a]">{p.area_m2 ? `${p.area_m2} m²` : '—'}</td>
                  <td className="px-4 py-3 text-[#6b7280]">{p.tipo_inmueble || '—'}</td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${p.tipo_negocio === 'Venta' ? 'bg-[#40d99d]/10 text-[#40d99d]' : p.tipo_negocio === 'Arriendo' ? 'bg-blue-50 text-blue-600' : 'bg-amber-50 text-amber-600'}`}>
                      {p.tipo_negocio || '—'}
                    </span>
                  </td>
                  <td className="px-4 py-3 font-medium text-[#1a1a1a]">{p.precio ? formatCurrency(p.precio) : '—'}</td>
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
