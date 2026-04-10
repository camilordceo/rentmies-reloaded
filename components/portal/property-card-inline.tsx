'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { MapPin, Bed, Bath, Car, Maximize2, ChevronLeft, ChevronRight, Calendar, ExternalLink } from 'lucide-react'
import Image from 'next/image'

function formatCOP(n: number | null | undefined) {
  if (!n) return '—'
  if (n >= 1_000_000_000) return `$${(n / 1_000_000_000).toFixed(2).replace(/\.?0+$/, '')}B`
  if (n >= 1_000_000) return `$${Math.round(n / 1_000_000).toLocaleString('es-CO')}M`
  return `$${n.toLocaleString('es-CO')}`
}

interface PropertyCardInlineProps {
  property: any
  index: number
  onSchedule: (property: any) => void
}

export function PropertyCardInline({ property: p, index, onSchedule }: PropertyCardInlineProps) {
  const [photoIdx, setPhotoIdx] = useState(0)
  const photos: string[] = p.imagenes ?? []
  const hasPhotos = photos.length > 0

  return (
    <motion.div
      initial={{ opacity: 0, y: 16, scale: 0.97 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ type: 'spring', damping: 22, stiffness: 280, delay: index * 0.1 }}
      whileHover={{ y: -3, boxShadow: '0 8px 32px rgba(0,0,0,0.09)' }}
      className="bg-white rounded-2xl border border-[#e5e5e5] overflow-hidden max-w-sm w-full"
    >
      {/* Photo carousel */}
      <div className="relative h-44 bg-[#f0f0f0]">
        {hasPhotos ? (
          <>
            <Image
              src={photos[photoIdx]}
              alt={p.ubicacion ?? ''}
              fill
              className="object-cover"
              sizes="384px"
            />
            {photos.length > 1 && (
              <>
                <button
                  onClick={() => setPhotoIdx((i) => (i - 1 + photos.length) % photos.length)}
                  className="absolute left-2 top-1/2 -translate-y-1/2 w-7 h-7 rounded-full bg-white/80 flex items-center justify-center hover:bg-white transition-colors"
                >
                  <ChevronLeft className="w-4 h-4 text-[#1a1a1a]" />
                </button>
                <button
                  onClick={() => setPhotoIdx((i) => (i + 1) % photos.length)}
                  className="absolute right-2 top-1/2 -translate-y-1/2 w-7 h-7 rounded-full bg-white/80 flex items-center justify-center hover:bg-white transition-colors"
                >
                  <ChevronRight className="w-4 h-4 text-[#1a1a1a]" />
                </button>
                <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1">
                  {photos.slice(0, 5).map((_, i) => (
                    <button
                      key={i}
                      onClick={() => setPhotoIdx(i)}
                      className={`w-1.5 h-1.5 rounded-full transition-colors ${i === photoIdx ? 'bg-[#40d99d]' : 'bg-white/70'}`}
                    />
                  ))}
                </div>
              </>
            )}
          </>
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <Maximize2 className="w-8 h-8 text-[#e5e5e5]" />
          </div>
        )}
        <span className="absolute top-2 left-2 text-[10px] font-semibold px-2 py-0.5 rounded-full bg-white/90 text-[#1a1a1a]">
          {p.negocio ?? p.tipo_negocio}
        </span>
      </div>

      {/* Info */}
      <div className="p-4">
        <div className="flex items-start justify-between gap-2 mb-1">
          <div>
            <p className="text-lg font-semibold text-[#1a1a1a] leading-tight">
              {formatCOP(p.precio)}
            </p>
            {p.administracion && (
              <p className="text-xs text-[#6b7280]">Adm. {p.administracion}/mes</p>
            )}
          </div>
          <span className="text-xs text-[#6b7280] bg-[#f0f0f0] px-2 py-0.5 rounded-full whitespace-nowrap">
            #{p.codigo}
          </span>
        </div>

        <div className="flex items-center gap-1 mb-2">
          <MapPin className="w-3.5 h-3.5 text-[#40d99d] flex-shrink-0" />
          <p className="text-sm text-[#6b7280] truncate">{p.ubicacion ?? p.ciudad}</p>
        </div>

        <div className="flex items-center gap-3 text-sm text-[#6b7280] mb-3">
          {(p.habitaciones || p.hab) && (
            <span className="flex items-center gap-1">
              <Bed className="w-3.5 h-3.5" />
              {p.habitaciones ?? p.hab}
            </span>
          )}
          {p.banos && (
            <span className="flex items-center gap-1">
              <Bath className="w-3.5 h-3.5" />
              {p.banos}
            </span>
          )}
          {p.parqueaderos && (
            <span className="flex items-center gap-1">
              <Car className="w-3.5 h-3.5" />
              {p.parqueaderos}
            </span>
          )}
          {(p.area_m2 || p.area) && (
            <span className="flex items-center gap-1">
              <Maximize2 className="w-3.5 h-3.5" />
              {p.area_m2 ?? p.area} m²
            </span>
          )}
        </div>

        {p.descripcion && (
          <p className="text-xs text-[#6b7280] line-clamp-2 mb-3">{p.descripcion}</p>
        )}

        <div className="flex gap-2">
          {p.enlace && (
            <a
              href={p.enlace}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 flex items-center justify-center gap-1.5 text-xs font-medium px-3 py-2 rounded-xl border border-[#e5e5e5] text-[#1a1a1a] hover:border-[#40d99d] hover:text-[#40d99d] transition-colors"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              Ver detalle
            </a>
          )}
          <button
            onClick={() => onSchedule(p)}
            className="flex-1 flex items-center justify-center gap-1.5 text-xs font-medium px-3 py-2 rounded-xl bg-[#40d99d] text-white hover:bg-[#40d99d]/90 transition-colors"
          >
            <Calendar className="w-3.5 h-3.5" />
            Agendar visita
          </button>
        </div>
      </div>
    </motion.div>
  )
}
