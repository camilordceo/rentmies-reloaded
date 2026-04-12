import { LoginForm } from '@/components/auth/login-form'
import Link from 'next/link'
import { Sparkles } from 'lucide-react'

export default function LoginPage() {
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
            AI REAL ESTATE PLATFORM
          </p>
          <h2 className="text-3xl font-bold text-white leading-tight mb-4">
            Tu agente IA trabaja 24/7 mientras tú cierras tratos.
          </h2>
          <p className="text-white/60 text-sm leading-relaxed">
            Arrienda y vende inmuebles en Colombia con inteligencia artificial
            conversacional. Bogotá · Medellín · Cali.
          </p>
        </div>

        <div className="bg-white/8 rounded-xl p-5">
          <div className="flex items-center gap-2 mb-3">
            <Sparkles className="w-3.5 h-3.5 text-brand-teal" />
            <span className="text-[10px] font-bold uppercase tracking-widest text-brand-teal">EMA IA</span>
          </div>
          <p className="text-sm text-white/80 italic leading-relaxed">
            &quot;Gestioné 47 conversaciones ayer. Cerramos 3 solicitudes de arriendo sin intervención humana.&quot;
          </p>
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
              ACCESO AL SISTEMA
            </p>
            <h1 className="text-3xl font-bold tracking-tight text-on-surface">Iniciar sesión</h1>
            <p className="text-on-surface/50 text-sm mt-1">Ingresa a tu cuenta de Rentmies</p>
          </div>

          <div className="bg-surface-container-lowest rounded-xl p-8 shadow-editorial">
            <LoginForm />
          </div>

          <p className="text-center text-sm text-on-surface/50 mt-6">
            ¿No tienes cuenta?{' '}
            <Link href="/registro" className="text-authority-green hover:text-brand-teal font-semibold transition-colors">
              Regístrate gratis
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
