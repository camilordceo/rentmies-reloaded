import Link from 'next/link'
import { MessageSquare, BarChart3, Clock, Building2, ArrowRight, Check, Sparkles, Zap } from 'lucide-react'

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-surface text-on-surface">
      {/* Nav */}
      <nav className="sticky top-0 bg-surface/80 backdrop-blur-xl z-50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between h-16">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 bg-brand-teal rounded-lg flex items-center justify-center">
              <Sparkles className="w-4 h-4 text-white" />
            </div>
            <span className="font-bold text-lg text-on-surface tracking-tight">Rentmies</span>
          </div>
          <div className="flex items-center gap-2">
            <Link
              href="/login"
              className="text-sm text-on-surface/60 hover:text-on-surface transition-colors px-4 py-2 font-medium"
            >
              Iniciar sesión
            </Link>
            <Link
              href="/registro"
              className="text-sm bg-authority-green text-white px-4 py-2 rounded-lg hover:bg-authority-green/90 transition-all font-semibold"
            >
              Empezar gratis
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-28 text-center">
        <div className="inline-flex items-center gap-2 bg-brand-teal/10 text-authority-green text-xs font-bold px-4 py-1.5 rounded-full mb-6 uppercase tracking-widest">
          <Sparkles className="w-3.5 h-3.5 text-brand-teal" />
          Agente IA para WhatsApp
        </div>
        <h1 className="text-5xl sm:text-6xl font-bold text-on-surface mb-6 leading-tight tracking-tight">
          Arrienda y vende inmuebles{' '}
          <span className="text-authority-green">24/7</span>{' '}
          con IA
        </h1>
        <p className="text-lg text-on-surface/60 max-w-2xl mx-auto mb-10 leading-relaxed">
          Rentmies es el agente de WhatsApp que atiende, califica y agenda visitas por tu inmobiliaria — sin que tengas que estar pendiente.
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <Link
            href="/registro"
            className="inline-flex items-center gap-2 bg-authority-green text-white px-6 py-3.5 rounded-xl hover:bg-authority-green/90 transition-all font-semibold text-sm shadow-editorial"
          >
            Comenzar ahora
            <ArrowRight className="w-4 h-4" />
          </Link>
          <Link
            href="/login"
            className="inline-flex items-center gap-2 bg-surface-container-lowest text-on-surface px-6 py-3.5 rounded-xl hover:bg-surface-container transition-all text-sm font-medium shadow-editorial"
          >
            Ya tengo cuenta
          </Link>
        </div>

        {/* Social proof */}
        <div className="flex items-center justify-center gap-8 mt-14">
          {[
            { num: '24/7', label: 'Disponible siempre' },
            { num: '94%', label: 'Automatización IA' },
            { num: '3×', label: 'Más conversiones' },
          ].map(s => (
            <div key={s.num} className="text-center">
              <p className="text-3xl font-bold text-authority-green">{s.num}</p>
              <p className="text-xs text-on-surface/50 mt-0.5">{s.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Features */}
      <section className="bg-surface-container-low py-24">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <p className="text-[11px] font-bold uppercase tracking-[0.15em] text-authority-green mb-3">CAPACIDADES</p>
            <h2 className="text-3xl font-bold tracking-tight">Todo lo que necesitas para cerrar más negocios</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[
              { icon: MessageSquare, title: 'Chat 24/7', desc: 'El agente responde a tus clientes en WhatsApp a cualquier hora, sin tiempo de respuesta.' },
              { icon: BarChart3, title: 'CRM integrado', desc: 'Sigue cada lead desde el primer contacto hasta el cierre. Etapas, notas y citas en un solo lugar.' },
              { icon: Clock, title: 'Agenda automática', desc: 'El agente identifica el interés y agenda visitas directamente en tu calendario.' },
              { icon: Sparkles, title: 'IA entrenada', desc: 'Conoce tus propiedades, responde preguntas técnicas y califica leads antes de pasártelos.' },
              { icon: Building2, title: 'Multi-ciudad', desc: 'Opera en Bogotá, Medellín y Cali con agentes IA especializados por mercado.' },
              { icon: Zap, title: 'Toma de control', desc: 'Cuando lo necesitas, tomas el control de la conversación con un solo clic.' },
            ].map((f) => (
              <div key={f.title} className="bg-surface-container-lowest p-6 rounded-xl shadow-editorial">
                <div className="w-10 h-10 bg-brand-teal/10 rounded-xl flex items-center justify-center mb-4">
                  <f.icon className="w-5 h-5 text-brand-teal" />
                </div>
                <h3 className="font-bold text-on-surface mb-2">{f.title}</h3>
                <p className="text-sm text-on-surface/60 leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* EMA Section */}
      <section className="bg-authority-green py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="inline-flex items-center gap-2 bg-white/10 px-4 py-1.5 rounded-full mb-6">
            <Sparkles className="w-3.5 h-3.5 text-brand-teal" />
            <span className="text-[11px] font-bold uppercase tracking-widest text-brand-teal">EMA — TU AGENTE IA</span>
          </div>
          <h2 className="text-4xl font-bold text-white mb-4 leading-tight">
            EMA trabajó mientras dormías.
          </h2>
          <p className="text-white/70 text-lg leading-relaxed max-w-2xl mx-auto mb-10">
            Anoche EMA atendió 47 conversaciones, calificó 12 leads y agendó 3 visitas — sin intervención humana. Esta mañana tu pipeline ya está actualizado.
          </p>
          <Link
            href="/registro"
            className="inline-flex items-center gap-2 bg-brand-teal text-white px-6 py-3.5 rounded-xl hover:bg-brand-teal/90 transition-all font-semibold text-sm"
          >
            Activar mi EMA <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </section>

      {/* Pricing */}
      <section className="py-24 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-14">
          <p className="text-[11px] font-bold uppercase tracking-[0.15em] text-authority-green mb-3">PLANES</p>
          <h2 className="text-3xl font-bold tracking-tight">Precios simples y transparentes</h2>
          <p className="text-on-surface/50 mt-2">Sin contratos largos. Cancela cuando quieras.</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-3xl mx-auto">
          {[
            {
              name: 'Starter',
              price: '$299.000',
              period: '/mes',
              features: ['1 agente IA', 'Hasta 500 conversaciones', 'Dashboard básico', 'Soporte email'],
              cta: 'Empezar',
              highlight: false,
            },
            {
              name: 'Pro',
              price: '$599.000',
              period: '/mes',
              features: ['3 agentes IA', 'Conversaciones ilimitadas', 'Analytics avanzado', 'Soporte prioritario', 'Multi-ciudad'],
              cta: 'Empezar Pro',
              highlight: true,
            },
          ].map((plan) => (
            <div
              key={plan.name}
              className={`p-8 rounded-2xl shadow-editorial ${
                plan.highlight
                  ? 'bg-authority-green text-white'
                  : 'bg-surface-container-lowest'
              }`}
            >
              {plan.highlight && (
                <div className="inline-flex items-center gap-1.5 bg-brand-teal text-white text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-wide mb-4">
                  <Sparkles className="w-3 h-3" /> Recomendado
                </div>
              )}
              <h3 className={`font-bold text-lg mb-1 ${plan.highlight ? 'text-white' : 'text-on-surface'}`}>{plan.name}</h3>
              <div className="flex items-end gap-1 mb-6">
                <span className={`text-3xl font-bold ${plan.highlight ? 'text-brand-teal' : 'text-authority-green'}`}>{plan.price}</span>
                <span className={`text-sm mb-1 ${plan.highlight ? 'text-white/60' : 'text-on-surface/50'}`}>{plan.period}</span>
              </div>
              <ul className="space-y-2.5 mb-8">
                {plan.features.map((f) => (
                  <li key={f} className="flex items-center gap-2 text-sm">
                    <Check className={`w-4 h-4 flex-shrink-0 ${plan.highlight ? 'text-brand-teal' : 'text-brand-teal'}`} />
                    <span className={plan.highlight ? 'text-white/80' : 'text-on-surface/70'}>{f}</span>
                  </li>
                ))}
              </ul>
              <Link
                href="/registro"
                className={`block text-center py-3 rounded-xl text-sm font-semibold transition-all ${
                  plan.highlight
                    ? 'bg-brand-teal text-white hover:bg-brand-teal/90'
                    : 'bg-authority-green text-white hover:bg-authority-green/90'
                }`}
              >
                {plan.cta}
              </Link>
            </div>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-surface-container-low py-10">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 bg-brand-teal rounded-lg flex items-center justify-center">
              <Sparkles className="w-3.5 h-3.5 text-white" />
            </div>
            <span className="font-bold text-on-surface">Rentmies</span>
            <span className="text-on-surface/30 text-sm">© 2026</span>
          </div>
          <div className="flex items-center gap-4 text-sm text-on-surface/50">
            <Link href="/partnerships" className="hover:text-authority-green transition-colors">Alianzas</Link>
            <Link href="/inmuebles" className="hover:text-authority-green transition-colors">Portal</Link>
            <Link href="/login" className="hover:text-authority-green transition-colors">Iniciar sesión</Link>
          </div>
        </div>
      </footer>
    </div>
  )
}
