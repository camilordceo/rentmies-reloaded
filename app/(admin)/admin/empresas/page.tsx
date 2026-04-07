export const dynamic = 'force-dynamic'

import { createClient } from '@/lib/supabase/server'
import { Building2 } from 'lucide-react'

export default async function EmpresasPage() {
  const supabase = createClient()

  const { data: empresas } = await supabase
    .from('empresas')
    .select('*')
    .order('created_at', { ascending: false })

  return (
    <div className="max-w-6xl mx-auto">
      <div className="mb-6">
        <h1 className="text-xl font-medium text-[#1a1a1a]">Empresas</h1>
        <p className="text-sm text-[#6b7280] mt-0.5">
          {empresas?.length ?? 0} empresa{empresas?.length !== 1 ? 's' : ''} registradas
        </p>
      </div>

      {!empresas || empresas.length === 0 ? (
        <div className="bg-white rounded-xl border border-[#e5e5e5] p-16 text-center">
          <div className="w-12 h-12 bg-[#f0f0f0] rounded-full flex items-center justify-center mx-auto mb-4">
            <Building2 className="w-6 h-6 text-[#6b7280]" />
          </div>
          <p className="font-medium text-[#1a1a1a] mb-1">No hay empresas registradas</p>
          <p className="text-sm text-[#6b7280]">Las empresas se crearán al registrar usuarios</p>
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-[#e5e5e5] shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-[#e5e5e5] bg-[#f8f8f8]">
                  <th className="text-left px-4 py-3 text-xs font-medium text-[#6b7280] uppercase tracking-wide">
                    Empresa
                  </th>
                  <th className="text-left px-4 py-3 text-xs font-medium text-[#6b7280] uppercase tracking-wide">
                    Plan
                  </th>
                  <th className="text-left px-4 py-3 text-xs font-medium text-[#6b7280] uppercase tracking-wide hidden md:table-cell">
                    Ciudad
                  </th>
                  <th className="text-left px-4 py-3 text-xs font-medium text-[#6b7280] uppercase tracking-wide">
                    Estado
                  </th>
                  <th className="text-left px-4 py-3 text-xs font-medium text-[#6b7280] uppercase tracking-wide hidden lg:table-cell">
                    Registrada
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#e5e5e5]">
                {empresas.map((empresa) => (
                  <tr key={empresa.id} className="hover:bg-[#f8f8f8] transition-colors">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-purple-50 flex items-center justify-center flex-shrink-0">
                          <Building2 className="w-4 h-4 text-purple-600" />
                        </div>
                        <span className="font-medium text-[#1a1a1a]">{empresa.nombre}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-lg text-xs font-medium bg-[#40d99d]/10 text-[#40d99d] capitalize">
                        {empresa.plan}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-[#6b7280] hidden md:table-cell">
                      {empresa.ciudad ?? '—'}
                    </td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium ${
                        empresa.activo
                          ? 'bg-green-50 text-green-700'
                          : 'bg-[#f0f0f0] text-[#6b7280]'
                      }`}>
                        {empresa.activo ? 'Activa' : 'Inactiva'}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-xs text-[#6b7280] hidden lg:table-cell">
                      {new Date(empresa.created_at).toLocaleDateString('es-CO', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric',
                      })}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}
