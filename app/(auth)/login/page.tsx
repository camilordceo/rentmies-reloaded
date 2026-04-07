import { LoginForm } from '@/components/auth/login-form'
import Link from 'next/link'
import { Bot } from 'lucide-react'

export default function LoginPage() {
  return (
    <div className="min-h-screen bg-[#f8f8f8] flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-sm">
        {/* Logo */}
        <div className="flex items-center justify-center gap-2 mb-8">
          <div className="w-9 h-9 bg-[#40d99d] rounded-lg flex items-center justify-center">
            <Bot className="w-5 h-5 text-white" />
          </div>
          <span className="font-medium text-xl text-[#1a1a1a]">Rentmies</span>
        </div>

        <div className="bg-white rounded-xl border border-[#e5e5e5] shadow-sm p-8">
          <h1 className="text-xl font-medium text-[#1a1a1a] mb-1">Iniciar sesión</h1>
          <p className="text-sm text-[#6b7280] mb-6">Ingresa a tu cuenta de Rentmies</p>
          <LoginForm />
        </div>

        <p className="text-center text-sm text-[#6b7280] mt-6">
          ¿No tienes cuenta?{' '}
          <Link href="/registro" className="text-[#40d99d] hover:underline font-medium">
            Regístrate
          </Link>
        </p>
      </div>
    </div>
  )
}
