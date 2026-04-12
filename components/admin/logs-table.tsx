'use client'

import { useState, useEffect, useMemo } from 'react'
import { createClient } from '@/lib/supabase/client'
import { RefreshCw, Download, ChevronDown, ChevronRight } from 'lucide-react'
import type { AdminLog } from '@/lib/types'
import { cn } from '@/lib/utils'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'

const LEVEL_CONFIG = {
  info: { label: 'Info', className: 'bg-blue-50 text-blue-700' },
  warn: { label: 'Warn', className: 'bg-amber-50 text-amber-700' },
  error: { label: 'Error', className: 'bg-red-50 text-red-700' },
  debug: { label: 'Debug', className: 'bg-surface-container text-on-surface/60' },
}

interface LogsTableProps {
  initialLogs: AdminLog[]
}

export function LogsTable({ initialLogs }: LogsTableProps) {
  const [logs, setLogs] = useState(initialLogs)
  const [levelFilter, setLevelFilter] = useState<string>('all')
  const [sourceFilter, setSourceFilter] = useState('')
  const [expandedId, setExpandedId] = useState<string | null>(null)
  const [refreshing, setRefreshing] = useState(false)
  const supabase = createClient()

  useEffect(() => {
    const interval = setInterval(async () => {
      const { data } = await supabase
        .from('admin_logs')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(200)
      if (data) setLogs(data)
    }, 10_000)
    return () => clearInterval(interval)
  }, [])

  const handleRefresh = async () => {
    setRefreshing(true)
    const { data } = await supabase
      .from('admin_logs')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(200)
    if (data) setLogs(data)
    setRefreshing(false)
  }

  const filtered = useMemo(() => {
    return logs.filter((log) => {
      const matchesLevel = levelFilter === 'all' || log.level === levelFilter
      const matchesSource = !sourceFilter || log.source.toLowerCase().includes(sourceFilter.toLowerCase())
      return matchesLevel && matchesSource
    })
  }, [logs, levelFilter, sourceFilter])

  const handleExportCSV = () => {
    const headers = ['Timestamp', 'Level', 'Source', 'Message', 'Context']
    const rows = filtered.map((log) => [
      log.created_at,
      log.level,
      log.source,
      `"${log.message.replace(/"/g, '""')}"`,
      `"${JSON.stringify(log.context ?? {}).replace(/"/g, '""')}"`,
    ])
    const csv = [headers, ...rows].map((r) => r.join(',')).join('\n')
    const blob = new Blob([csv], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `rentmies-logs-${Date.now()}.csv`
    a.click()
    URL.revokeObjectURL(url)
  }

  const sources = Array.from(new Set(logs.map((l) => l.source))).sort()

  return (
    <div className="space-y-4">
      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="flex gap-1.5 bg-surface-container rounded-xl p-1">
          {['all', 'info', 'warn', 'error', 'debug'].map((level) => (
            <button
              key={level}
              onClick={() => setLevelFilter(level)}
              className={cn(
                'px-3 py-1.5 text-xs rounded-lg transition-all capitalize font-medium',
                levelFilter === level
                  ? 'bg-surface-container-lowest text-on-surface shadow-editorial'
                  : 'text-on-surface/50 hover:text-on-surface'
              )}
            >
              {level === 'all' ? 'Todos' : level}
            </button>
          ))}
        </div>

        <select
          value={sourceFilter}
          onChange={(e) => setSourceFilter(e.target.value)}
          className="h-9 px-3 text-xs bg-surface-container rounded-lg text-on-surface outline-none focus:ring-2 focus:ring-brand-teal/30 transition-all"
        >
          <option value="">Todas las fuentes</option>
          {sources.map((s) => (
            <option key={s} value={s}>{s}</option>
          ))}
        </select>

        <span className="text-xs text-on-surface/40 ml-auto">
          {filtered.length} log{filtered.length !== 1 ? 's' : ''}
        </span>

        <button
          onClick={handleRefresh}
          disabled={refreshing}
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs bg-surface-container rounded-lg text-on-surface/60 hover:text-on-surface transition-all"
        >
          <RefreshCw className={cn('w-3.5 h-3.5', refreshing && 'animate-spin')} />
          Actualizar
        </button>

        <button
          onClick={handleExportCSV}
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs bg-surface-container rounded-lg text-on-surface/60 hover:text-on-surface transition-all"
        >
          <Download className="w-3.5 h-3.5" />
          CSV
        </button>
      </div>

      {/* Table */}
      <div className="bg-surface-container-lowest rounded-xl shadow-editorial overflow-hidden">
        {filtered.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-sm text-on-surface/40">No hay logs con este filtro</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-surface-container">
                  {['Timestamp', 'Level', 'Source', 'Mensaje', ''].map((h, i) => (
                    <th key={i} className="px-4 py-3 text-left text-[10px] font-bold uppercase tracking-widest text-on-surface/40">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map((log, i) => (
                  <>
                    <tr
                      key={log.id}
                      className={`hover:bg-surface-container-low transition-colors cursor-pointer ${i > 0 ? 'border-t border-outline-variant/10' : ''}`}
                      onClick={() => setExpandedId(expandedId === log.id ? null : log.id)}
                    >
                      <td className="px-4 py-3 text-xs text-on-surface/50 font-mono whitespace-nowrap">
                        {format(new Date(log.created_at), 'dd/MM HH:mm:ss', { locale: es })}
                      </td>
                      <td className="px-4 py-3">
                        <span className={cn(
                          'inline-flex items-center px-2 py-0.5 rounded text-[11px] font-semibold',
                          LEVEL_CONFIG[log.level as keyof typeof LEVEL_CONFIG]?.className ?? 'bg-surface-container text-on-surface/60'
                        )}>
                          {LEVEL_CONFIG[log.level as keyof typeof LEVEL_CONFIG]?.label ?? log.level}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-xs text-on-surface/50 font-mono">
                        {log.source}
                      </td>
                      <td className="px-4 py-3 text-sm text-on-surface max-w-md">
                        <p className="truncate">{log.message}</p>
                      </td>
                      <td className="px-4 py-3 w-8">
                        {log.context && (
                          expandedId === log.id
                            ? <ChevronDown className="w-4 h-4 text-on-surface/40" />
                            : <ChevronRight className="w-4 h-4 text-on-surface/40" />
                        )}
                      </td>
                    </tr>
                    {expandedId === log.id && log.context && (
                      <tr key={`${log.id}-expanded`} className="bg-surface-container-low border-t border-outline-variant/10">
                        <td colSpan={5} className="px-4 py-3">
                          <pre className="text-xs text-on-surface font-mono bg-on-surface/5 rounded-xl p-4 overflow-x-auto max-h-64 whitespace-pre-wrap">
                            {JSON.stringify(log.context, null, 2)}
                          </pre>
                        </td>
                      </tr>
                    )}
                  </>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
