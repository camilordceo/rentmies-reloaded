'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { Profile } from '@/lib/types'
import { cn } from '@/lib/utils'
import { Search } from 'lucide-react'

interface UsersTableProps {
  initialProfiles: Profile[]
}

export function UsersTable({ initialProfiles }: UsersTableProps) {
  const [profiles, setProfiles] = useState(initialProfiles)
  const [search, setSearch] = useState('')
  const [roleFilter, setRoleFilter] = useState('all')
  const supabase = createClient()

  const filtered = profiles.filter((p) => {
    const matchesSearch =
      !search ||
      (p.nombre ?? '').toLowerCase().includes(search.toLowerCase()) ||
      (p.email ?? '').toLowerCase().includes(search.toLowerCase())
    const matchesRole = roleFilter === 'all' || p.rol === roleFilter
    return matchesSearch && matchesRole
  })

  const handleToggleActive = async (id: string, current: boolean) => {
    await supabase.from('profiles').update({ activo: !current }).eq('id', id)
    setProfiles((prev) =>
      prev.map((p) => (p.id === id ? { ...p, activo: !current } : p))
    )
  }

  const handleChangeRole = async (id: string, rol: string) => {
    await supabase.from('profiles').update({ rol }).eq('id', id)
    setProfiles((prev) =>
      prev.map((p) => (p.id === id ? { ...p, rol: rol as Profile['rol'] } : p))
    )
  }

  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative flex-1 max-w-xs">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[#6b7280]" />
          <input
            type="text"
            placeholder="Buscar usuario..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full h-9 pl-9 pr-3 text-sm bg-white border border-[#e5e5e5] rounded-lg text-[#1a1a1a] focus:outline-none focus:border-[#40d99d]"
          />
        </div>

        <div className="flex gap-1.5">
          {['all', 'admin', 'agent', 'user'].map((role) => (
            <button
              key={role}
              onClick={() => setRoleFilter(role)}
              className={cn(
                'px-3 py-1.5 text-xs rounded-lg transition-colors capitalize',
                roleFilter === role
                  ? 'bg-[#1a1a1a] text-white'
                  : 'bg-white border border-[#e5e5e5] text-[#6b7280] hover:bg-[#f8f8f8]'
              )}
            >
              {role === 'all' ? 'Todos' : role}
            </button>
          ))}
        </div>

        <span className="text-xs text-[#6b7280] ml-auto">
          {filtered.length} usuario{filtered.length !== 1 ? 's' : ''}
        </span>
      </div>

      <div className="bg-white rounded-xl border border-[#e5e5e5] shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[#e5e5e5] bg-[#f8f8f8]">
                <th className="text-left px-4 py-3 text-xs font-medium text-[#6b7280] uppercase tracking-wide">
                  Usuario
                </th>
                <th className="text-left px-4 py-3 text-xs font-medium text-[#6b7280] uppercase tracking-wide">
                  Rol
                </th>
                <th className="text-left px-4 py-3 text-xs font-medium text-[#6b7280] uppercase tracking-wide hidden md:table-cell">
                  Registrado
                </th>
                <th className="text-left px-4 py-3 text-xs font-medium text-[#6b7280] uppercase tracking-wide">
                  Estado
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#e5e5e5]">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={4} className="text-center py-12 text-[#6b7280] text-sm">
                    No hay usuarios con este filtro
                  </td>
                </tr>
              ) : (
                filtered.map((profile) => (
                  <tr key={profile.id} className="hover:bg-[#f8f8f8] transition-colors">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-[#40d99d]/10 flex items-center justify-center flex-shrink-0">
                          <span className="text-xs font-medium text-[#40d99d]">
                            {(profile.nombre ?? profile.email ?? '?')[0].toUpperCase()}
                          </span>
                        </div>
                        <div>
                          <p className="font-medium text-[#1a1a1a]">{profile.nombre ?? '—'}</p>
                          <p className="text-xs text-[#6b7280]">{profile.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <select
                        value={profile.rol}
                        onChange={(e) => handleChangeRole(profile.id, e.target.value)}
                        className="text-xs px-2 py-1 rounded-lg border border-[#e5e5e5] bg-white text-[#1a1a1a] focus:outline-none focus:border-[#40d99d]"
                      >
                        <option value="admin">admin</option>
                        <option value="agent">agent</option>
                        <option value="user">user</option>
                      </select>
                    </td>
                    <td className="px-4 py-3 text-xs text-[#6b7280] hidden md:table-cell">
                      {new Date(profile.created_at).toLocaleDateString('es-CO', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric',
                      })}
                    </td>
                    <td className="px-4 py-3">
                      <button
                        onClick={() => handleToggleActive(profile.id, profile.activo)}
                        className={cn(
                          'relative inline-flex h-5 w-9 items-center rounded-full transition-colors',
                          profile.activo ? 'bg-[#40d99d]' : 'bg-[#e5e5e5]'
                        )}
                      >
                        <span
                          className={cn(
                            'inline-block h-3.5 w-3.5 transform rounded-full bg-white transition-transform',
                            profile.activo ? 'translate-x-4' : 'translate-x-1'
                          )}
                        />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
