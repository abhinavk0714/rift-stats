import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import {
  getAllTeams,
  type Team,
  createTeam,
  deleteTeam,
  type TeamCreateInput,
} from '../api/teamsApi'
import { DataTable, type Column } from '../components/DataTable'
import { LoadingSpinner } from '../components/LoadingSpinner'
import { ErrorMessage } from '../components/ErrorMessage'

export function TeamsPage() {
  const navigate = useNavigate()
  const queryClient = useQueryClient()

  const [search, setSearch] = useState('')
  const [regionFilter, setRegionFilter] = useState<string>('')

  const [form, setForm] = useState<TeamCreateInput>({
    name: '',
    short_name: '',
    region: 'LCK',
  })

  const createMutation = useMutation({
    mutationFn: (data: TeamCreateInput) => createTeam(data),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['teams'] })
      setForm({ name: '', short_name: '', region: 'LCK' })
    },
  })

  const deleteMutation = useMutation({
    mutationFn: (id: number) => deleteTeam(id),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['teams'] })
    },
  })

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
    {
      key: 'actions',
      header: 'Actions',
      render: (r) => (
        <button
          type="button"
          className="rounded bg-red-500 px-2 py-1 text-xs text-primary hover:bg-red-600"
          aria-label={`Delete team ${r.name}`}
          onClick={(e) => {
            e.stopPropagation()
            if (!confirm(`Delete team ${r.name}?`)) return
            deleteMutation.mutate(r.id)
          }}
        >
          Delete
        </button>
      ),
    },
  ]

  if (isLoading) return <LoadingSpinner label="Loading teams…" />
  if (error) return <ErrorMessage message={error instanceof Error ? error.message : 'Failed to load teams'} onRetry={refetch} />

  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold text-primary">Teams</h1>
      <div className="mb-6 rounded-xl bg-secondary p-4 shadow-sm">
        <h2 className="mb-3 text-sm font-semibold text-primary">Create team</h2>
        <form
          className="flex flex-wrap gap-3"
          onSubmit={(e) => {
            e.preventDefault()
            if (!form.name.trim()) return
            createMutation.mutate(form)
          }}
        >
          <input
            type="text"
            placeholder="Name"
            value={form.name}
            onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
            className="min-w-[160px] rounded-lg border border-slate-600 bg-secondary px-3 py-2 text-primary placeholder-text-muted focus:border-accent focus:outline-none"
            aria-label="Team name"
            required
          />
          <input
            type="text"
            placeholder="Short name"
            value={form.short_name ?? ''}
            onChange={(e) => setForm((f) => ({ ...f, short_name: e.target.value || undefined }))}
            className="w-32 rounded-lg border border-slate-600 bg-secondary px-3 py-2 text-primary placeholder-text-muted focus:border-accent focus:outline-none"
            aria-label="Short name"
          />
          <input
            type="text"
            placeholder="Region"
            value={form.region ?? ''}
            onChange={(e) => setForm((f) => ({ ...f, region: e.target.value || undefined }))}
            className="w-32 rounded-lg border border-slate-600 bg-secondary px-3 py-2 text-primary placeholder-text-muted focus:border-accent focus:outline-none"
            aria-label="Region"
          />
          <button
            type="submit"
            className="rounded-lg bg-accent px-4 py-2 text-sm font-semibold text-primary hover:bg-accent-hover disabled:opacity-50"
            disabled={createMutation.isPending}
            aria-label="Create team"
          >
            {createMutation.isPending ? 'Creating…' : 'Create'}
          </button>
        </form>
        {createMutation.isError && (
          <p className="mt-2 text-xs text-red-400">
            {(createMutation.error as Error)?.message ?? 'Failed to create team'}
          </p>
        )}
      </div>
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
