'use client'

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'

const MESSAGES = [
  'Buscando propiedades...',
  'Analizando el inventario...',
  'Filtrando por tus preferencias...',
  'Encontrando las mejores opciones...',
]

export function TypingIndicator() {
  const [msgIdx, setMsgIdx] = useState(0)

  useEffect(() => {
    const t = setInterval(() => setMsgIdx((i) => (i + 1) % MESSAGES.length), 2000)
    return () => clearInterval(t)
  }, [])

  return (
    <div className="flex items-center gap-3 py-1">
      <div className="flex items-center gap-1">
        {[0, 1, 2].map((i) => (
          <motion.span
            key={i}
            className="w-2 h-2 rounded-full bg-[#40d99d]"
            animate={{ y: [0, -6, 0] }}
            transition={{ duration: 0.6, repeat: Infinity, delay: i * 0.15, ease: 'easeInOut' }}
          />
        ))}
      </div>
      <motion.span
        key={msgIdx}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="text-sm text-[#6b7280]"
      >
        {MESSAGES[msgIdx]}
      </motion.span>
    </div>
  )
}
