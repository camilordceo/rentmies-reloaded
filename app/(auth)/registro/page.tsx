import { RegistroForm } from '@/components/auth/registro-form'
import Link from 'next/link'
import { Sparkles } from 'lucide-react'

export default function RegistroPage() {
  return (
    <div className="min-h-screen bg-surface flex">
      {/* Left panel — brand */}
      <div className="hidden lg:flex flex-col justify-between w-[420px] bg-authority-green p-12 flex-shrink-0">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-brand-teal flex items-center justify-center">
            <Sparkles className="w-4 h-4 text-white" />
          </div>
          <span className="text-white font-bold text-lg tracking-tight">Rentmies</span>
        </div>

        <div>
          <p className="text-[11px] font-bold uppercase tracking-[0.15em] text-brand-teal mb-4">
            EMPIEZA HOY
          </p>
          <h2 className="text-3xl font-bold text-white leading-tight mb-4">
            Automatiza tu inmobiliaria con IA en menos de 5 minutos.
          </h2>
          <p className="text-white/60 text-sm leading-relaxed">
            Prueba gratuita. Sin tarjeta de crédito. Cancela cuando quieras.
          </p>
        </div>

        <div className="space-y-3">
          {['Responde leads 24/7 en WhatsApp', 'Agenda citas automáticamente', 'CRM integrado con IA'].map(feat => (
            <div key={feat} className="flex items-center gap-3">
              <div className="w-5 h-5 rounded-full bg-brand-teal/20 flex items-center justify-center flex-shrink-0">
                <div className="w-1.5 h-1.5 rounded-full bg-brand-teal" />
              </div>
              <span className="text-sm text-white/80">{feat}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Right panel — form */}
      <div className="flex-1 flex flex-col items-center justify-center p-8">
        {/* Mobile logo */}
        <div className="flex lg:hidden items-center gap-2.5 mb-10">
          <div className="w-8 h-8 rounded-lg bg-brand-teal flex items-center justify-center">
            <Sparkles className="w-4 h-4 text-white" />
          </div>
          <span className="font-bold text-lg tracking-tight text-on-surface">Rentmies</span>
        </div>

        <div className="w-full max-w-sm">
          <div className="mb-8">
            <p className="text-[11px] font-bold uppercase tracking-[0.15em] text-authority-green mb-2">
              NUEVA CUENTA
            </p>
            <h1 className="text-3xl font-bold tracking-tight text-on-surface">Crear cuenta</h1>
            <p className="text-on-surface/50 text-sm mt-1">Comienza tu prueba gratuita</p>
          </div>

          <div className="bg-surface-container-lowest rounded-xl p-8 shadow-editorial">
            <RegistroForm />
          </div>

          <p className="text-center text-sm text-on-surface/50 mt-6">
            ¿Ya tienes cuenta?{' '}
            <Link href="/login" className="text-authority-green hover:text-brand-teal font-semibold transition-colors">
              Iniciar sesión
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
