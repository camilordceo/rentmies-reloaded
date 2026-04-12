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
    <div className="max-w-6xl mx-auto space-y-6">
      <div>
        <p className="text-[11px] font-bold uppercase tracking-[0.15em] text-authority-green mb-1">GESTIÓN</p>
        <h1 className="text-3xl font-bold tracking-tight text-on-surface">Empresas</h1>
        <p className="text-on-surface/50 text-sm mt-1">
          {empresas?.length ?? 0} empresa{empresas?.length !== 1 ? 's' : ''} registradas
        </p>
      </div>

      {!empresas || empresas.length === 0 ? (
        <div className="bg-surface-container-lowest rounded-xl p-16 text-center shadow-editorial">
          <div className="w-12 h-12 bg-surface-container rounded-xl flex items-center justify-center mx-auto mb-4">
            <Building2 className="w-6 h-6 text-on-surface/30" />
          </div>
          <p className="font-semibold text-on-surface mb-1">No hay empresas registradas</p>
          <p className="text-sm text-on-surface/50">Las empresas se crearán al registrar usuarios</p>
        </div>
      ) : (
        <div className="bg-surface-container-lowest rounded-xl shadow-editorial overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-surface-container">
                  {['Empresa', 'Plan', 'Ciudad', 'Estado', 'Registrada'].map((h, i) => (
                    <th
                      key={h}
                      className={`px-4 py-3 text-left text-[10px] font-bold uppercase tracking-widest text-on-surface/40 ${i === 2 ? 'hidden md:table-cell' : ''} ${i === 4 ? 'hidden lg:table-cell' : ''}`}
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {empresas.map((empresa, i) => (
                  <tr key={empresa.id} className={`hover:bg-surface-container-low transition-colors ${i > 0 ? 'border-t border-outline-variant/10' : ''}`}>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-purple-50 flex items-center justify-center flex-shrink-0">
                          <Building2 className="w-4 h-4 text-purple-600" />
                        </div>
                        <span className="font-semibold text-on-surface">{empresa.nombre}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span className="inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-semibold bg-brand-teal/10 text-brand-teal capitalize">
                        {empresa.plan}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-on-surface/50 hidden md:table-cell">
                      {empresa.ciudad ?? '—'}
                    </td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-semibold ${
                        empresa.activo
                          ? 'bg-brand-teal/10 text-brand-teal'
                          : 'bg-surface-container text-on-surface/40'
                      }`}>
                        {empresa.activo ? 'Activa' : 'Inactiva'}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-xs text-on-surface/50 hidden lg:table-cell">
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
