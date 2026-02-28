import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { getAllTeams, type Team } from '../api/teamsApi'
import { DataTable, type Column } from '../components/DataTable'
import { LoadingSpinner } from '../components/LoadingSpinner'
import { ErrorMessage } from '../components/ErrorMessage'

export function TeamsPage() {
  const navigate = useNavigate()
  const [search, setSearch] = useState('')
  const [regionFilter, setRegionFilter] = useState<string>('')

  const { data: teams = [], isLoading, error, refetch } = useQuery({
    queryKey: ['teams'],
    queryFn: () => getAllTeams({ limit: 500 }),
  })

  const filtered = useMemo(() => {
    let list = teams
    if (search.trim()) {
      const q = search.trim().toLowerCase()
      list = list.filter(
        (t) =>
          t.name.toLowerCase().includes(q) ||
          (t.short_name ?? '').toLowerCase().includes(q) ||
          t.region.toLowerCase().includes(q)
      )
    }
    if (regionFilter) list = list.filter((t) => t.region === regionFilter)
    return list
  }, [teams, search, regionFilter])

  const regions = useMemo(() => {
    const set = new Set(teams.map((t) => t.region))
    return Array.from(set).sort()
  }, [teams])

  const columns: Column<Team>[] = [
    { key: 'id', header: 'ID', render: (r) => r.id, sortKey: (r) => r.id },
    { key: 'name', header: 'Name', render: (r) => r.name, sortKey: (r) => r.name },
    { key: 'short_name', header: 'Short', render: (r) => r.short_name ?? '—', sortKey: (r) => r.short_name ?? '' },
    { key: 'region', header: 'Region', render: (r) => r.region, sortKey: (r) => r.region },
  ]

  if (isLoading) return <LoadingSpinner label="Loading teams…" />
  if (error) return <ErrorMessage message={error instanceof Error ? error.message : 'Failed to load teams'} onRetry={refetch} />

  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold text-primary">Teams</h1>
      <div className="mb-4 flex flex-wrap items-center gap-3">
        <input
          type="search"
          placeholder="Search by name or region…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="min-w-[200px] rounded-lg border border-slate-600 bg-secondary px-3 py-2 text-primary placeholder-text-muted focus:border-accent focus:outline-none"
          aria-label="Search teams"
        />
        <select
          value={regionFilter}
          onChange={(e) => setRegionFilter(e.target.value)}
          className="rounded-lg border border-slate-600 bg-secondary px-3 py-2 text-primary focus:border-accent focus:outline-none"
          aria-label="Filter by region"
        >
          <option value="">All regions</option>
          {regions.map((r) => (
            <option key={r} value={r}>{r}</option>
          ))}
        </select>
      </div>
      <DataTable
        columns={columns}
        rows={filtered}
        keyField="id"
        onRowClick={(row) => navigate(`/teams/${row.id}`)}
        emptyMessage="No teams match the filter."
      />
    </div>
  )
}
