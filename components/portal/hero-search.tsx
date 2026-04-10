'use client'

import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Search, Mic, Bot } from 'lucide-react'
import { PropertyCardFeatured } from './property-card-featured'

const SUGGESTIONS = [
  'Apartamento con terraza en El Poblado',
  'Casa familiar cerca de colegios en Chía',
  'Oficina en el norte de Bogotá',
  'Finca de recreo en Guatapé',
  'Apartamento moderno en Medellín',
  'Casa con piscina en La Calera',
]

const TYPEWRITER_PHRASES = [
  'Busco un apartamento con terraza en El Poblado...',
  'Quiero una casa cerca a colegios en Chía...',
  'Necesito una oficina en el norte de Bogotá...',
  'Me gustaría una finca en Guatapé por menos de 2 mil millones...',
]

function useTypewriter(phrases: string[]) {
  const [text, setText] = useState('')
  const [phraseIdx, setPhraseIdx] = useState(0)
  const [typing, setTyping] = useState(true)

  useEffect(() => {
    const phrase = phrases[phraseIdx]
    let timeout: NodeJS.Timeout

    if (typing) {
      if (text.length < phrase.length) {
        timeout = setTimeout(() => setText(phrase.slice(0, text.length + 1)), 45)
      } else {
        timeout = setTimeout(() => setTyping(false), 2800)
      }
    } else {
      if (text.length > 0) {
        timeout = setTimeout(() => setText(text.slice(0, -1)), 20)
      } else {
        setPhraseIdx((i) => (i + 1) % phrases.length)
        setTyping(true)
      }
    }

    return () => clearTimeout(timeout)
  }, [text, typing, phraseIdx, phrases])

  return text
}

interface HeroSearchProps {
  empresa: { id: string; nombre: string; ciudad: string | null } | null
  destacadas: any[]
  onSearch: (query: string) => void
}

export function HeroSearch({ empresa, destacadas, onSearch }: HeroSearchProps) {
  const [query, setQuery] = useState('')
  const inputRef = useRef<HTMLInputElement>(null)
  const placeholder = useTypewriter(TYPEWRITER_PHRASES)

  function handleSubmit(e?: React.FormEvent) {
    e?.preventDefault()
    if (query.trim()) onSearch(query.trim())
  }

  function handleSuggestion(s: string) {
    setQuery(s)
    setTimeout(() => onSearch(s), 100)
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Navbar */}
      <nav className="fixed top-0 left-0 right-0 z-50 h-14 bg-white/80 backdrop-blur-md border-b border-[#e5e5e5] flex items-center px-6">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 bg-[#40d99d] rounded-lg flex items-center justify-center">
            <Bot className="w-4 h-4 text-white" />
          </div>
          <span className="font-medium text-[#1a1a1a] text-sm">{empresa?.nombre ?? 'Rentmies'}</span>
        </div>
      </nav>

      {/* Hero */}
      <div className="pt-14 flex flex-col items-center justify-center min-h-[80vh] px-4 text-center">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
          className="max-w-2xl w-full"
        >
          <motion.h1
            className="text-4xl md:text-5xl font-semibold text-[#1a1a1a] tracking-tight mb-2"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.05, duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
          >
            Encuentra tu próximo hogar
          </motion.h1>
          <motion.p
            className="text-xl text-[#6b7280] mb-10"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15, duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
          >
            con inteligencia artificial
          </motion.p>

          {/* Search bar */}
          <motion.form
            onSubmit={handleSubmit}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.25, duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
            className="relative"
          >
            <div className="flex items-center bg-white border border-[#e5e5e5] rounded-full shadow-sm hover:shadow-md transition-shadow px-5 py-3.5 gap-3">
              <Search className="w-5 h-5 text-[#6b7280] flex-shrink-0" />
              <input
                ref={inputRef}
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder={placeholder}
                className="flex-1 text-[15px] text-[#1a1a1a] placeholder:text-[#9ca3af] bg-transparent outline-none"
                onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
              />
              {query && (
                <button
                  type="submit"
                  className="flex-shrink-0 w-9 h-9 bg-[#40d99d] rounded-full flex items-center justify-center hover:bg-[#40d99d]/90 transition-colors"
                >
                  <Search className="w-4 h-4 text-white" />
                </button>
              )}
            </div>
          </motion.form>

          {/* Suggestions */}
          <motion.div
            className="flex flex-wrap gap-2 justify-center mt-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
          >
            {SUGGESTIONS.map((s, i) => (
              <motion.button
                key={s}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 + i * 0.06 }}
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => handleSuggestion(s)}
                className="text-xs px-3 py-1.5 rounded-full border border-[#e5e5e5] text-[#6b7280] hover:border-[#40d99d] hover:text-[#40d99d] transition-colors bg-white"
              >
                {s}
              </motion.button>
            ))}
          </motion.div>
        </motion.div>
      </div>

      {/* Featured properties */}
      {destacadas.length > 0 && (
        <div className="pb-16 px-4 max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
          >
            <p className="text-xs font-semibold text-[#6b7280] uppercase tracking-wider mb-4">
              Propiedades destacadas
            </p>
            <div className="flex gap-4 overflow-x-auto pb-4 snap-x snap-mandatory scrollbar-hide">
              {destacadas.map((p, i) => (
                <motion.div
                  key={p.id}
                  className="snap-start flex-shrink-0"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.65 + i * 0.07 }}
                >
                  <PropertyCardFeatured property={p} />
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      )}
    </div>
  )
}
