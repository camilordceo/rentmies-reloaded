import Link from 'next/link'
import { Bot, MessageSquare, BarChart3, Clock, Building2, ArrowRight, Check } from 'lucide-react'

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-white text-[#1a1a1a]">
      {/* Nav */}
      <nav className="border-b border-[#e5e5e5] sticky top-0 bg-white/95 backdrop-blur-sm z-50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between h-16">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-[#40d99d] rounded-lg flex items-center justify-center">
              <Bot className="w-5 h-5 text-white" />
            </div>
            <span className="font-medium text-lg text-[#1a1a1a]">Rentmies</span>
          </div>
          <div className="flex items-center gap-3">
            <Link
              href="/login"
              className="text-sm text-[#6b7280] hover:text-[#1a1a1a] transition-colors px-4 py-2"
            >
              Iniciar sesión
            </Link>
            <Link
              href="/registro"
              className="text-sm bg-[#40d99d] text-white px-4 py-2 rounded-lg hover:bg-[#4fffb4] transition-colors font-medium"
            >
              Empezar gratis
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-24 text-center">
        <div className="inline-flex items-center gap-2 bg-[#40d99d]/10 text-[#40d99d] text-xs font-medium px-3 py-1.5 rounded-full mb-6">
          <Bot className="w-3.5 h-3.5" />
          Agente IA para WhatsApp
        </div>
        <h1 className="text-5xl sm:text-6xl font-medium text-[#1a1a1a] mb-6 leading-tight">
          Arrienda y vende inmuebles{' '}
          <span className="text-[#40d99d]">24/7</span>{' '}
          con IA
        </h1>
        <p className="text-lg text-[#6b7280] max-w-2xl mx-auto mb-10 leading-relaxed">
          Rentmies es el agente de WhatsApp que atiende, califica y agenda visitas por tu inmobiliaria — sin que tengas que estar pendiente.
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <Link
            href="/registro"
            className="inline-flex items-center gap-2 bg-[#40d99d] text-white px-6 py-3 rounded-lg hover:bg-[#4fffb4] transition-colors font-medium text-sm"
          >
            Comenzar ahora
            <ArrowRight className="w-4 h-4" />
          </Link>
          <Link
            href="/login"
            className="inline-flex items-center gap-2 border border-[#e5e5e5] text-[#1a1a1a] px-6 py-3 rounded-lg hover:bg-[#f8f8f8] transition-colors text-sm"
          >
            Ya tengo cuenta
          </Link>
        </div>
      </section>

      {/* Features */}
      <section className="bg-[#f8f8f8] py-20">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-medium text-center mb-12">
            Todo lo que necesitas para cerrar más negocios
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              {
                icon: MessageSquare,
                title: 'Chat 24/7',
                desc: 'El agente responde a tus clientes en WhatsApp a cualquier hora, sin tiempo de respuesta.',
              },
              {
                icon: BarChart3,
                title: 'CRM integrado',
                desc: 'Sigue cada lead desde el primer contacto hasta el cierre. Etapas, notas y citas en un solo lugar.',
              },
              {
                icon: Clock,
                title: 'Agenda automática',
                desc: 'El agente identifica el interés y agenda visitas directamente en tu calendario.',
              },
              {
                icon: Bot,
                title: 'IA entrenada',
                desc: 'Conoce tus propiedades, responde preguntas técnicas y califica leads antes de pasártelos.',
              },
              {
                icon: Building2,
                title: 'Multi-ciudad',
                desc: 'Opera en Bogotá, Medellín y Cali con agentes IA especializados por mercado.',
              },
              {
                icon: ArrowRight,
                title: 'Toma de control',
                desc: 'Cuando lo necesitas, tomas el control de la conversación con un solo clic.',
              },
            ].map((f) => (
              <div
                key={f.title}
                className="bg-white p-6 rounded-xl border border-[#e5e5e5] shadow-sm"
              >
                <div className="w-10 h-10 bg-[#40d99d]/10 rounded-lg flex items-center justify-center mb-4">
                  <f.icon className="w-5 h-5 text-[#40d99d]" />
                </div>
                <h3 className="font-medium text-[#1a1a1a] mb-2">{f.title}</h3>
                <p className="text-sm text-[#6b7280] leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing (simple) */}
      <section className="py-20 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <h2 className="text-3xl font-medium text-center mb-4">Planes simples</h2>
        <p className="text-[#6b7280] text-center mb-12">Sin contratos largos. Cancela cuando quieras.</p>
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
              className={`p-8 rounded-xl border-2 ${
                plan.highlight
                  ? 'border-[#40d99d] bg-[#40d99d]/5'
                  : 'border-[#e5e5e5] bg-white'
              }`}
            >
              <h3 className="font-medium text-lg mb-1">{plan.name}</h3>
              <div className="flex items-end gap-1 mb-6">
                <span className="text-3xl font-medium">{plan.price}</span>
                <span className="text-[#6b7280] text-sm mb-1">{plan.period}</span>
              </div>
              <ul className="space-y-2.5 mb-8">
                {plan.features.map((f) => (
                  <li key={f} className="flex items-center gap-2 text-sm">
                    <Check className="w-4 h-4 text-[#40d99d] flex-shrink-0" />
                    {f}
                  </li>
                ))}
              </ul>
              <Link
                href="/registro"
                className={`block text-center py-2.5 rounded-lg text-sm font-medium transition-colors ${
                  plan.highlight
                    ? 'bg-[#40d99d] text-white hover:bg-[#4fffb4]'
                    : 'border border-[#e5e5e5] text-[#1a1a1a] hover:bg-[#f8f8f8]'
                }`}
              >
                {plan.cta}
              </Link>
            </div>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-[#e5e5e5] py-8 text-center text-sm text-[#6b7280]">
        <p>© 2026 Rentmies. Hecho con ❤️ en Colombia.</p>
      </footer>
    </div>
  )
}
