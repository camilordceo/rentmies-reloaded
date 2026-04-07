export const dynamic = 'force-dynamic'

import { createClient } from '@/lib/supabase/server'
import { Search, Phone, Mail, MapPin } from 'lucide-react'

export default async function ContactosPage() {
  const supabase = createClient()

  const { data: contacts } = await supabase
    .from('contacts')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(100)

  return (
    <div className="max-w-5xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-medium text-[#1a1a1a]">Contactos</h1>
          <p className="text-sm text-[#6b7280] mt-0.5">
            {contacts?.length ?? 0} contacto{contacts?.length !== 1 ? 's' : ''}
          </p>
        </div>
      </div>

      {!contacts || contacts.length === 0 ? (
        <div className="bg-white rounded-xl border border-[#e5e5e5] p-16 text-center">
          <div className="w-12 h-12 bg-[#f0f0f0] rounded-full flex items-center justify-center mx-auto mb-4">
            <Search className="w-6 h-6 text-[#6b7280]" />
          </div>
          <p className="font-medium text-[#1a1a1a] mb-1">No hay contactos aún</p>
          <p className="text-sm text-[#6b7280]">Los contactos aparecerán cuando lleguen conversaciones</p>
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-[#e5e5e5] shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-[#e5e5e5] bg-[#f8f8f8]">
                  <th className="text-left px-4 py-3 text-xs font-medium text-[#6b7280] uppercase tracking-wide">
                    Nombre
                  </th>
                  <th className="text-left px-4 py-3 text-xs font-medium text-[#6b7280] uppercase tracking-wide">
                    Teléfono
                  </th>
                  <th className="text-left px-4 py-3 text-xs font-medium text-[#6b7280] uppercase tracking-wide hidden md:table-cell">
                    Email
                  </th>
                  <th className="text-left px-4 py-3 text-xs font-medium text-[#6b7280] uppercase tracking-wide hidden lg:table-cell">
                    Ciudad
                  </th>
                  <th className="text-left px-4 py-3 text-xs font-medium text-[#6b7280] uppercase tracking-wide">
                    Fecha
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#e5e5e5]">
                {contacts.map((contact) => (
                  <tr key={contact.id} className="hover:bg-[#f8f8f8] transition-colors">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-[#40d99d]/10 flex items-center justify-center flex-shrink-0">
                          <span className="text-xs font-medium text-[#40d99d]">
                            {contact.nombre?.split(' ').map((n: string) => n[0]).slice(0, 2).join('').toUpperCase()}
                          </span>
                        </div>
                        <span className="font-medium text-[#1a1a1a]">{contact.nombre}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1.5 text-[#6b7280]">
                        <Phone className="w-3.5 h-3.5 flex-shrink-0" />
                        {contact.phone}
                      </div>
                    </td>
                    <td className="px-4 py-3 hidden md:table-cell">
                      {contact.email ? (
                        <div className="flex items-center gap-1.5 text-[#6b7280]">
                          <Mail className="w-3.5 h-3.5 flex-shrink-0" />
                          <span className="truncate max-w-[200px]">{contact.email}</span>
                        </div>
                      ) : (
                        <span className="text-[#e5e5e5]">—</span>
                      )}
                    </td>
                    <td className="px-4 py-3 hidden lg:table-cell">
                      {contact.location ? (
                        <div className="flex items-center gap-1.5 text-[#6b7280]">
                          <MapPin className="w-3.5 h-3.5 flex-shrink-0" />
                          {contact.location}
                        </div>
                      ) : (
                        <span className="text-[#e5e5e5]">—</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-[#6b7280] text-xs">
                      {new Date(contact.created_at).toLocaleDateString('es-CO', {
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
