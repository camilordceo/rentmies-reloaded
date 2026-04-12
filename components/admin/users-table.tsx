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
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-on-surface/40" />
          <input
            type="text"
            placeholder="Buscar usuario..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full h-9 pl-9 pr-3 text-sm bg-surface-container rounded-lg text-on-surface placeholder:text-on-surface/35 outline-none focus:ring-2 focus:ring-brand-teal/30 transition-all"
          />
        </div>

        <div className="flex gap-1.5 bg-surface-container rounded-xl p-1">
          {['all', 'admin', 'agent', 'user'].map((role) => (
            <button
              key={role}
              onClick={() => setRoleFilter(role)}
              className={cn(
                'px-3 py-1.5 text-xs rounded-lg transition-all capitalize font-medium',
                roleFilter === role
                  ? 'bg-surface-container-lowest text-on-surface shadow-editorial'
                  : 'text-on-surface/50 hover:text-on-surface'
              )}
            >
              {role === 'all' ? 'Todos' : role}
            </button>
          ))}
        </div>

        <span className="text-xs text-on-surface/40 ml-auto">
          {filtered.length} usuario{filtered.length !== 1 ? 's' : ''}
        </span>
      </div>

      <div className="bg-surface-container-lowest rounded-xl shadow-editorial overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-surface-container">
                {['Usuario', 'Rol', 'Registrado', 'Estado'].map((h) => (
                  <th key={h} className="px-4 py-3 text-left text-[10px] font-bold uppercase tracking-widest text-on-surface/40 last:hidden last:md:table-cell">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={4} className="text-center py-12 text-on-surface/40 text-sm">
                    No hay usuarios con este filtro
                  </td>
                </tr>
              ) : (
                filtered.map((profile, i) => (
                  <tr key={profile.id} className={`hover:bg-surface-container-low transition-colors ${i > 0 ? 'border-t border-outline-variant/10' : ''}`}>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-brand-teal/10 flex items-center justify-center flex-shrink-0">
                          <span className="text-xs font-bold text-brand-teal">
                            {(profile.nombre ?? profile.email ?? '?')[0].toUpperCase()}
                          </span>
                        </div>
                        <div>
                          <p className="font-semibold text-on-surface">{profile.nombre ?? '—'}</p>
                          <p className="text-xs text-on-surface/50">{profile.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <select
                        value={profile.rol}
                        onChange={(e) => handleChangeRole(profile.id, e.target.value)}
                        className="text-xs px-2 py-1.5 bg-surface-container rounded-lg text-on-surface outline-none focus:ring-2 focus:ring-brand-teal/30 transition-all"
                      >
                        <option value="admin">admin</option>
                        <option value="agent">agent</option>
                        <option value="user">user</option>
                      </select>
                    </td>
                    <td className="px-4 py-3 text-xs text-on-surface/50 hidden md:table-cell">
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
                          profile.activo ? 'bg-brand-teal' : 'bg-surface-container-highest'
                        )}
                      >
                        <span
                          className={cn(
                            'inline-block h-3.5 w-3.5 transform rounded-full bg-white transition-transform shadow',
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
