'use client'

import { useState } from 'react'
import { toast } from 'sonner'
import { Save, User, Building2, Sparkles, Bot, Volume2 } from 'lucide-react'

interface ConfiguracionClientProps {
  profile: any
  empresa: any
}

const AI_TONE_OPTIONS = [
  { key: 'autoritario', label: 'Autoritario', desc: 'Directo, seguro, cierra rápido.' },
  { key: 'diplomatico', label: 'Diplomático', desc: 'Empático, consultivo, construye confianza.' },
  { key: 'dinamico', label: 'Dinámico', desc: 'Energético, ágil, conversacional.' },
]

export function ConfiguracionClient({ profile, empresa }: ConfiguracionClientProps) {
  const [perfil, setPerfil] = useState({ nombre: profile?.nombre || '', email: profile?.email || '' })
  const [emp, setEmp] = useState({
    nombre: empresa?.nombre || '',
    nit: empresa?.configuracion?.nit || '',
    telefono: empresa?.configuracion?.telefono || '',
    website: empresa?.configuracion?.website || '',
  })
  const [aiTone, setAiTone] = useState<string>('diplomatico')
  const [langComplexity, setLangComplexity] = useState(40)
  const [saving, setSaving] = useState(false)

  async function saveEmpresa() {
    setSaving(true)
    const res = await fetch('/api/empresa', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        nombre: emp.nombre,
        configuracion: { nit: emp.nit, telefono: emp.telefono, website: emp.website },
      }),
    })
    setSaving(false)
    if (res.ok) toast.success('Cambios guardados')
    else toast.error('Error al guardar')
  }

  async function savePerfil() {
    setSaving(true)
    const supabase = (await import('@/lib/supabase/client')).createClient()
    const { error } = await supabase.from('profiles').update({ nombre: perfil.nombre }).eq('id', profile.id)
    setSaving(false)
    if (!error) toast.success('Perfil actualizado')
    else toast.error('Error al actualizar')
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Eyebrow + title */}
      <div>
        <div className="inline-flex items-center px-4 py-1 bg-brand-teal/10 text-authority-green rounded-full mb-3">
          <span className="text-[11px] font-bold uppercase tracking-widest">CONFIGURACIÓN DEL SISTEMA</span>
        </div>
        <h1 className="text-3xl font-bold tracking-tight text-on-surface">Configuración</h1>
      </div>

      {/* Perfil personal */}
      <div className="bg-surface-container-lowest rounded-xl p-6 shadow-editorial">
        <div className="flex items-center gap-2 mb-5">
          <div className="w-8 h-8 rounded-lg bg-surface-container flex items-center justify-center">
            <User className="w-4 h-4 text-on-surface/50" />
          </div>
          <div>
            <p className="text-[10px] font-bold uppercase tracking-widest text-on-surface/30">CUENTA</p>
            <h2 className="text-sm font-semibold text-on-surface">Perfil personal</h2>
          </div>
        </div>
        <div className="space-y-5">
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-on-surface/50">Nombre</label>
            <input
              value={perfil.nombre}
              onChange={e => setPerfil(p => ({ ...p, nombre: e.target.value }))}
              className="w-full h-10 px-3 bg-surface-container rounded-lg text-sm text-on-surface placeholder:text-on-surface/35 outline-none focus:ring-2 focus:ring-brand-teal/30 transition-all"
              placeholder="Tu nombre"
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-on-surface/50">Email</label>
            <input
              value={perfil.email}
              disabled
              className="w-full h-10 px-3 bg-surface-container-highest rounded-lg text-sm text-on-surface/40 cursor-not-allowed"
            />
          </div>
        </div>
        <button
          onClick={savePerfil}
          disabled={saving}
          className="mt-6 flex items-center gap-2 px-4 py-2 bg-on-surface text-white text-sm font-semibold rounded-lg hover:bg-on-surface/90 disabled:opacity-50 transition-all"
        >
          <Save className="w-3.5 h-3.5" />Guardar perfil
        </button>
      </div>

      {/* Empresa */}
      <div className="bg-surface-container-lowest rounded-xl p-6 shadow-editorial">
        <div className="flex items-center gap-2 mb-5">
          <div className="w-8 h-8 rounded-lg bg-brand-teal/10 flex items-center justify-center">
            <Building2 className="w-4 h-4 text-brand-teal" />
          </div>
          <div>
            <p className="text-[10px] font-bold uppercase tracking-widest text-on-surface/30">ORGANIZACIÓN</p>
            <h2 className="text-sm font-semibold text-on-surface">Empresa</h2>
          </div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          {[
            { key: 'nombre', label: 'Nombre empresa', placeholder: 'Rentmies Inmobiliaria' },
            { key: 'nit', label: 'NIT', placeholder: '900.123.456-7' },
            { key: 'telefono', label: 'Teléfono', placeholder: '+57 300 000 0000' },
            { key: 'website', label: 'Sitio web', placeholder: 'https://miempresa.co' },
          ].map(({ key, label, placeholder }) => (
            <div key={key} className="space-y-1.5">
              <label className="text-xs font-medium text-on-surface/50">{label}</label>
              <input
                value={(emp as any)[key]}
                onChange={e => setEmp(p => ({ ...p, [key]: e.target.value }))}
                placeholder={placeholder}
                className="w-full h-10 px-3 bg-surface-container rounded-lg text-sm text-on-surface placeholder:text-on-surface/35 outline-none focus:ring-2 focus:ring-brand-teal/30 transition-all"
              />
            </div>
          ))}
        </div>
        <button
          onClick={saveEmpresa}
          disabled={saving}
          className="mt-6 flex items-center gap-2 px-4 py-2 bg-authority-green text-white text-sm font-semibold rounded-lg hover:bg-authority-green/90 disabled:opacity-50 transition-all"
        >
          <Save className="w-3.5 h-3.5" />Guardar empresa
        </button>
      </div>

      {/* EMA AI Voice Tone */}
      <div className="bg-surface-container-lowest rounded-xl p-6 shadow-editorial">
        <div className="flex items-center gap-2 mb-2">
          <div className="w-8 h-8 rounded-lg bg-brand-teal/10 flex items-center justify-center">
            <Bot className="w-4 h-4 text-brand-teal" />
          </div>
          <div>
            <p className="text-[10px] font-bold uppercase tracking-widest text-on-surface/30">IA</p>
            <h2 className="text-sm font-semibold text-on-surface">Tono de voz de EMA</h2>
          </div>
        </div>
        <p className="text-xs text-on-surface/50 mb-5">Define cómo EMA se comunica con tus leads.</p>
        <div className="grid grid-cols-3 gap-3 mb-6">
          {AI_TONE_OPTIONS.map(opt => (
            <button
              key={opt.key}
              onClick={() => setAiTone(opt.key)}
              className={[
                'flex flex-col gap-1.5 p-4 rounded-xl text-left transition-all',
                aiTone === opt.key
                  ? 'bg-brand-teal/10 ring-2 ring-brand-teal shadow-glow-subtle'
                  : 'bg-surface-container hover:bg-surface-container-high',
              ].join(' ')}
            >
              <span className={`text-xs font-bold ${aiTone === opt.key ? 'text-authority-green' : 'text-on-surface'}`}>
                {opt.label}
              </span>
              <span className="text-[11px] text-on-surface/50 leading-relaxed">{opt.desc}</span>
            </button>
          ))}
        </div>

        {/* Language complexity slider */}
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <Volume2 className="w-3.5 h-3.5 text-on-surface/40" />
            <label className="text-xs font-medium text-on-surface/50">Complejidad del lenguaje</label>
          </div>
          <input
            type="range"
            min={0}
            max={100}
            value={langComplexity}
            onChange={e => setLangComplexity(Number(e.target.value))}
            className="w-full accent-brand-teal"
          />
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-on-surface/40 uppercase tracking-wide">CONVERSACIONAL</span>
            <span className="text-[11px] font-bold text-on-surface/40 uppercase tracking-wide">ACADÉMICO</span>
          </div>
        </div>
      </div>

      {/* Notifications */}
      <div className="bg-surface-container-lowest rounded-xl p-6 shadow-editorial">
        <div className="flex items-center gap-2 mb-5">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-widest text-on-surface/30">ALERTAS</p>
            <h2 className="text-sm font-semibold text-on-surface">Notificaciones</h2>
          </div>
        </div>
        <div className="space-y-0">
          {[
            { label: 'Nuevo lead por WhatsApp', key: 'nuevo_lead' },
            { label: 'Cita programada', key: 'cita' },
            { label: 'Lead movido de etapa', key: 'etapa_cambio' },
          ].map(({ label, key }, i, arr) => (
            <div
              key={key}
              className={`flex items-center justify-between py-3.5 ${i < arr.length - 1 ? 'border-b border-outline-variant/15' : ''}`}
            >
              <span className="text-sm text-on-surface/70">{label}</span>
              <label className="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" defaultChecked className="sr-only peer" />
                <div className="w-9 h-5 bg-surface-container-highest peer-checked:bg-brand-teal rounded-full transition-colors" />
                <div className="absolute left-0.5 top-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform peer-checked:translate-x-4" />
              </label>
            </div>
          ))}
        </div>
      </div>

      {/* EMA tip */}
      <div className="bg-surface-container-low rounded-xl p-5">
        <div className="flex items-center gap-2 mb-2">
          <Sparkles className="w-3.5 h-3.5 text-brand-teal" />
          <span className="text-[10px] font-bold uppercase tracking-widest text-brand-teal">RECOMENDACIÓN DE EMA</span>
        </div>
        <p className="text-xs text-on-surface/70 italic leading-relaxed">
          El tono &quot;Diplomático&quot; genera un 23% más de conversiones en el mercado inmobiliario colombiano.
          EMA aprende y ajusta automáticamente con cada conversación.
        </p>
      </div>
    </div>
  )
}
