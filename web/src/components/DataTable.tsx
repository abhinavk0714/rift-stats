import { ReactNode, useMemo, useState } from 'react'

export interface Column<T> {
  key: string
  header: string
  render: (row: T) => ReactNode
  sortKey?: (row: T) => string | number
}

/** Reusable data table with optional sort and client-side pagination. */
export function DataTable<T extends object>({
  columns,
  rows,
  keyField,
  onRowClick,
  emptyMessage = 'No data',
  pageSize = 10,
}: {
  columns: Column<T>[]
  rows: T[]
  keyField: keyof T
  onRowClick?: (row: T) => void
  emptyMessage?: string
  pageSize?: number
}) {
  const [sortKey, setSortKey] = useState<string | null>(null)
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('asc')
  const [page, setPage] = useState(0)

  const sorted = useMemo(() => {
    if (!sortKey) return rows
    const col = columns.find((c) => c.key === sortKey)
    if (!col?.sortKey) return rows
    const copy = [...rows]
    copy.sort((a, b) => {
      const va = col.sortKey!(a)
      const vb = col.sortKey!(b)
      const cmp = va < vb ? -1 : va > vb ? 1 : 0
      return sortDir === 'asc' ? cmp : -cmp
    })
    return copy
  }, [rows, sortKey, sortDir, columns])

  const totalPages = Math.max(1, Math.ceil(sorted.length / pageSize))
  const paginated = sorted.slice(page * pageSize, page * pageSize + pageSize)

  const toggleSort = (key: string) => {
    if (sortKey === key) setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'))
    else {
      setSortKey(key)
      setSortDir('asc')
    }
    setPage(0)
  }

  if (rows.length === 0) {
    return (
      <div className="rounded-xl bg-secondary p-8 text-center text-text-muted">
        {emptyMessage}
      </div>
    )
  }

  return (
    <div className="overflow-x-auto rounded-xl bg-secondary shadow-lg">
      <table className="w-full min-w-[320px] text-left text-sm" role="table">
        <thead>
          <tr className="border-b border-slate-600 bg-slate-800/50">
            {columns.map((col) => (
              <th
                key={col.key}
                scope="col"
                className="px-4 py-3 font-semibold text-primary"
              >
                {col.sortKey ? (
                  <button
                    type="button"
                    onClick={() => toggleSort(col.key)}
                    className="hover:text-accent"
                    aria-label={`Sort by ${col.header}`}
                  >
                    {col.header}
                    {sortKey === col.key && (sortDir === 'asc' ? ' ↑' : ' ↓')}
                  </button>
                ) : (
                  col.header
                )}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {paginated.map((row) => (
            <tr
              key={String(row[keyField])}
              onClick={() => onRowClick?.(row)}
              className={`border-b border-slate-700/50 transition hover:bg-slate-700/30 ${
                onRowClick ? 'cursor-pointer' : ''
              }`}
            >
              {columns.map((col) => (
                <td key={col.key} className="px-4 py-3 text-text-primary">
                  {col.render(row)}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
      {totalPages > 1 && (
        <div className="flex items-center justify-between border-t border-slate-600 px-4 py-2 text-text-muted">
          <span>
            Page {page + 1} of {totalPages}
          </span>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setPage((p) => Math.max(0, p - 1))}
              disabled={page === 0}
              className="rounded bg-secondary px-3 py-1 hover:bg-accent hover:text-primary disabled:opacity-50"
              aria-label="Previous page"
            >
              Previous
            </button>
            <button
              type="button"
              onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
              disabled={page >= totalPages - 1}
              className="rounded bg-secondary px-3 py-1 hover:bg-accent hover:text-primary disabled:opacity-50"
              aria-label="Next page"
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
