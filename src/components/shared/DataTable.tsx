import { useState } from 'react'
import { Search, ChevronUp, ChevronDown, ChevronLeft, ChevronRight } from 'lucide-react'
import { Input }  from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { cn }     from '@/lib/utils'

export interface Column<T> {
  key: keyof T | string
  header?: string
  label?: string          // alias for header
  cell?: (row: T) => React.ReactNode
  render?: (row: T) => React.ReactNode  // alias for cell
  sortable?: boolean
  className?: string
}

interface DataTableProps<T> {
  data: T[]
  columns: Column<T>[]
  searchable?: boolean
  searchPlaceholder?: string
  searchKey?: keyof T
  searchKeys?: (keyof T)[]   // search across multiple fields
  pageSize?: number
  emptyMessage?: string
  className?: string
  onRowClick?: (row: T) => void
  rowKey?: keyof T           // unique key for row (defaults to row index)
}

export function DataTable<T extends object>({
  data, columns, searchable = true, searchPlaceholder = 'Search…',
  searchKey, searchKeys,
  pageSize = 10, emptyMessage = 'No records found.', className,
  onRowClick, rowKey,
}: DataTableProps<T>) {
  const [query,   setQuery]   = useState('')
  const [sortKey, setSortKey] = useState<string | null>(null)
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('asc')
  const [page,    setPage]    = useState(0)

  const filtered = searchable && query
    ? data.filter(row => {
        const r = row as Record<string, unknown>
        const keys = searchKeys ?? (searchKey ? [searchKey] : null)
        const val  = keys
          ? keys.map(k => String(r[k as string] ?? '')).join(' ')
          : Object.values(r).join(' ')
        return val.toLowerCase().includes(query.toLowerCase())
      })
    : data

  const sorted = sortKey
    ? [...filtered].sort((a, b) => {
        const ar = a as Record<string, unknown>
        const br = b as Record<string, unknown>
        const av = String(ar[sortKey] ?? '')
        const bv = String(br[sortKey] ?? '')
        return sortDir === 'asc' ? av.localeCompare(bv) : bv.localeCompare(av)
      })
    : filtered

  const totalPages = Math.ceil(sorted.length / pageSize)
  const paged      = sorted.slice(page * pageSize, (page + 1) * pageSize)

  function toggleSort(key: string) {
    if (sortKey === key) setSortDir(d => d === 'asc' ? 'desc' : 'asc')
    else { setSortKey(key); setSortDir('asc') }
    setPage(0)
  }

  function colHeader(col: Column<T>) { return col.label ?? col.header ?? String(col.key) }
  function colCell(col: Column<T>, row: T) {
    const fn = col.render ?? col.cell
    return fn ? fn(row) : String((row as Record<string, unknown>)[col.key as string] ?? '')
  }
  function rowId(row: T, i: number) {
    return rowKey ? String((row as Record<string, unknown>)[rowKey as string]) : i
  }

  return (
    <div className={cn('space-y-3', className)}>
      {searchable && (
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <Input
            placeholder={searchPlaceholder}
            value={query}
            onChange={e => { setQuery(e.target.value); setPage(0) }}
            className="pl-9"
          />
        </div>
      )}

      {/* Desktop table */}
      <div className="hidden md:block overflow-x-auto rounded-xl border border-slate-100">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 border-b border-slate-100">
            <tr>
              {columns.map(col => (
                <th
                  key={String(col.key)}
                  className={cn('px-4 py-3 text-left text-xs font-semibold text-slate-500 whitespace-nowrap', col.sortable && 'cursor-pointer select-none hover:text-slate-700', col.className)}
                  onClick={() => col.sortable && toggleSort(String(col.key))}
                >
                  <div className="flex items-center gap-1">
                    {colHeader(col)}
                    {col.sortable && sortKey === String(col.key) && (
                      sortDir === 'asc' ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />
                    )}
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {paged.length === 0 ? (
              <tr><td colSpan={columns.length} className="px-4 py-12 text-center text-sm text-slate-400">{emptyMessage}</td></tr>
            ) : (
              paged.map((row, i) => (
                <tr
                  key={rowId(row, i)}
                  onClick={() => onRowClick?.(row)}
                  className={cn('border-b border-slate-50 hover:bg-slate-50 transition-colors', onRowClick && 'cursor-pointer')}
                >
                  {columns.map(col => (
                    <td key={String(col.key)} className={cn('px-4 py-3 text-slate-700', col.className)}>
                      {colCell(col, row)}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Mobile stacked cards */}
      <div className="md:hidden space-y-2">
        {paged.length === 0 ? (
          <p className="text-center text-sm text-slate-400 py-8">{emptyMessage}</p>
        ) : (
          paged.map((row, i) => (
            <div
              key={rowId(row, i)}
              onClick={() => onRowClick?.(row)}
              className={cn('rounded-xl bg-white border border-slate-100 p-4 space-y-2', onRowClick && 'cursor-pointer hover:border-[#2563EB]/30 transition-colors')}
            >
              {columns.map(col => (
                <div key={String(col.key)} className="flex justify-between gap-4 text-sm">
                  <span className="text-xs font-medium text-slate-400 shrink-0">{colHeader(col)}</span>
                  <span className="text-slate-700 text-right">{colCell(col, row)}</span>
                </div>
              ))}
            </div>
          ))
        )}
      </div>

      {totalPages > 1 && (
        <div className="flex items-center justify-between text-sm text-slate-500">
          <span>Showing {page * pageSize + 1}–{Math.min((page + 1) * pageSize, sorted.length)} of {sorted.length}</span>
          <div className="flex gap-1">
            <Button size="icon" variant="outline" className="h-8 w-8" disabled={page === 0} onClick={() => setPage(p => p - 1)}>
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button size="icon" variant="outline" className="h-8 w-8" disabled={page >= totalPages - 1} onClick={() => setPage(p => p + 1)}>
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}
