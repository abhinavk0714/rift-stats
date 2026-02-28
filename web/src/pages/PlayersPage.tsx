import { useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { getAllPlayers, type Player } from '../api/playersApi'
import { DataTable, type Column } from '../components/DataTable'
import { LoadingSpinner } from '../components/LoadingSpinner'
import { ErrorMessage } from '../components/ErrorMessage'

export function PlayersPage() {
  const navigate = useNavigate()
  const [search, setSearch] = useState('')
  const [roleFilter, setRoleFilter] = useState<string>('')

  const { data: players = [], isLoading, error, refetch } = useQuery({
    queryKey: ['players'],
    queryFn: () => getAllPlayers({ limit: 500 }),
  })

  // TODO: switch to server-side filter when backend supports query params (e.g. ?role=, ?team_id=)
  const filtered = useMemo(() => {
    let list = players
    if (search.trim()) {
      const q = search.trim().toLowerCase()
      list = list.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          p.gamer_tag.toLowerCase().includes(q) ||
          (p.nationality ?? '').toLowerCase().includes(q)
      )
    }
    if (roleFilter) {
      list = list.filter((p) => (p.role ?? '') === roleFilter)
    }
    return list
  }, [players, search, roleFilter])

  const roles = useMemo(() => {
    const set = new Set(players.map((p) => p.role).filter(Boolean) as string[])
    return Array.from(set).sort()
  }, [players])

  const columns: Column<Player>[] = [
    { key: 'id', header: 'ID', render: (r) => r.id, sortKey: (r) => r.id },
    { key: 'name', header: 'Name', render: (r) => r.name, sortKey: (r) => r.name },
    { key: 'gamer_tag', header: 'Gamer Tag', render: (r) => r.gamer_tag, sortKey: (r) => r.gamer_tag },
    { key: 'role', header: 'Role', render: (r) => r.role ?? '—', sortKey: (r) => r.role ?? '' },
    { key: 'nationality', header: 'Nationality', render: (r) => r.nationality ?? '—' },
  ]

  if (isLoading) return <LoadingSpinner label="Loading players…" />
  if (error) return <ErrorMessage message={error instanceof Error ? error.message : 'Failed to load players'} onRetry={refetch} />

  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold text-primary">Players</h1>
      <div className="mb-4 flex flex-wrap items-center gap-3">
        <input
          type="search"
          placeholder="Search by name, tag, nationality…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="min-w-[200px] rounded-lg border border-slate-600 bg-secondary px-3 py-2 text-primary placeholder-text-muted focus:border-accent focus:outline-none"
          aria-label="Search players"
        />
        <select
          value={roleFilter}
          onChange={(e) => setRoleFilter(e.target.value)}
          className="rounded-lg border border-slate-600 bg-secondary px-3 py-2 text-primary focus:border-accent focus:outline-none"
          aria-label="Filter by role"
        >
          <option value="">All roles</option>
          {roles.map((r) => (
            <option key={r} value={r}>{r}</option>
          ))}
        </select>
      </div>
      <DataTable
        columns={columns}
        rows={filtered}
        keyField="id"
        onRowClick={(row) => navigate(`/players/${row.id}`)}
        emptyMessage="No players match the filter."
      />
    </div>
  )
}
