'use client'

import { motion } from 'framer-motion'
import { MapPin, Maximize2 } from 'lucide-react'
import Image from 'next/image'

function formatCOP(n: number | null) {
  if (!n) return '—'
  if (n >= 1_000_000_000) return `$${(n / 1_000_000_000).toFixed(1)}B`
  if (n >= 1_000_000) return `$${Math.round(n / 1_000_000)}M`
  return `$${n.toLocaleString('es-CO')}`
}

export function PropertyCardFeatured({ property: p }: { property: any }) {
  const img = p.imagenes?.[0]

  return (
    <motion.div
      whileHover={{ y: -4, boxShadow: '0 8px 30px rgba(0,0,0,0.10)' }}
      transition={{ type: 'spring', stiffness: 400, damping: 25 }}
      className="w-56 bg-white rounded-2xl border border-[#e5e5e5] overflow-hidden cursor-pointer"
    >
      <div className="relative h-36 bg-[#f0f0f0]">
        {img ? (
          <Image src={img} alt={p.ubicacion ?? ''} fill className="object-cover" sizes="224px" />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <Maximize2 className="w-6 h-6 text-[#e5e5e5]" />
          </div>
        )}
        {p.tipo_negocio && (
          <span className="absolute top-2 left-2 text-[10px] font-semibold px-2 py-0.5 rounded-full bg-white/90 text-[#1a1a1a]">
            {p.tipo_negocio}
          </span>
        )}
      </div>
      <div className="p-3">
        <p className="text-sm font-semibold text-[#1a1a1a]">{formatCOP(p.precio)}</p>
        <div className="flex items-center gap-1 mt-0.5">
          <MapPin className="w-3 h-3 text-[#6b7280]" />
          <p className="text-xs text-[#6b7280] truncate">{p.ubicacion ?? p.ciudad}</p>
        </div>
        <div className="flex items-center gap-2 mt-1.5 text-xs text-[#6b7280]">
          {p.habitaciones && <span>{p.habitaciones} hab</span>}
          {p.area_m2 && <span>·</span>}
          {p.area_m2 && <span>{p.area_m2} m²</span>}
        </div>
      </div>
    </motion.div>
  )
}
