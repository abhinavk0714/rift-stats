import { useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import {
  getAllPlayers,
  type Player,
  createPlayer,
  type PlayerCreateInput,
  deletePlayer,
} from '../api/playersApi'
import { DataTable, type Column } from '../components/DataTable'
import { LoadingSpinner } from '../components/LoadingSpinner'
import { ErrorMessage } from '../components/ErrorMessage'

export function PlayersPage() {
  const navigate = useNavigate()
  const queryClient = useQueryClient()

  const [search, setSearch] = useState('')
  const [roleFilter, setRoleFilter] = useState<string>('')
  const [form, setForm] = useState<PlayerCreateInput>({
    name: '',
    gamer_tag: '',
    nationality: '',
    role: '',
    age: undefined,
  })

  const createMutation = useMutation({
    mutationFn: (data: PlayerCreateInput) => createPlayer(data),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['players'] })
      setForm({ name: '', gamer_tag: '', nationality: '', role: '', age: undefined })
    },
  })

  const deleteMutation = useMutation({
    mutationFn: (id: number) => deletePlayer(id),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['players'] })
    },
  })

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
    {
      key: 'actions',
      header: 'Actions',
      render: (r) => (
        <button
          type="button"
          className="rounded bg-red-500 px-2 py-1 text-xs text-primary hover:bg-red-600"
          aria-label={`Delete player ${r.name}`}
          onClick={(e) => {
            e.stopPropagation()
            if (!confirm(`Delete player ${r.name}?`)) return
            deleteMutation.mutate(r.id)
          }}
        >
          Delete
        </button>
      ),
    },
  ]

  if (isLoading) return <LoadingSpinner label="Loading players…" />
  if (error) return <ErrorMessage message={error instanceof Error ? error.message : 'Failed to load players'} onRetry={refetch} />

  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold text-primary">Players</h1>
      <div className="mb-6 rounded-xl bg-secondary p-4 shadow-sm">
        <h2 className="mb-3 text-sm font-semibold text-primary">Create player</h2>
        <form
          className="flex flex-wrap gap-3"
          onSubmit={(e) => {
            e.preventDefault()
            if (!form.name.trim() || !form.gamer_tag.trim()) return
            createMutation.mutate(form)
          }}
        >
          <input
            type="text"
            placeholder="Name"
            value={form.name}
            onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
            className="min-w-[160px] rounded-lg border border-slate-600 bg-secondary px-3 py-2 text-primary placeholder-text-muted focus:border-accent focus:outline-none"
            aria-label="Player name"
            required
          />
          <input
            type="text"
            placeholder="Gamer tag"
            value={form.gamer_tag}
            onChange={(e) => setForm((f) => ({ ...f, gamer_tag: e.target.value }))}
            className="min-w-[140px] rounded-lg border border-slate-600 bg-secondary px-3 py-2 text-primary placeholder-text-muted focus:border-accent focus:outline-none"
            aria-label="Gamer tag"
            required
          />
          <input
            type="text"
            placeholder="Role (TOP/JG/MID/ADC/SUP)"
            value={form.role ?? ''}
            onChange={(e) => setForm((f) => ({ ...f, role: e.target.value || undefined }))}
            className="w-40 rounded-lg border border-slate-600 bg-secondary px-3 py-2 text-primary placeholder-text-muted focus:border-accent focus:outline-none"
            aria-label="Role"
          />
          <input
            type="text"
            placeholder="Nationality"
            value={form.nationality ?? ''}
            onChange={(e) => setForm((f) => ({ ...f, nationality: e.target.value || undefined }))}
            className="w-40 rounded-lg border border-slate-600 bg-secondary px-3 py-2 text-primary placeholder-text-muted focus:border-accent focus:outline-none"
            aria-label="Nationality"
          />
          <input
            type="number"
            placeholder="Age"
            value={form.age ?? ''}
            onChange={(e) =>
              setForm((f) => ({ ...f, age: e.target.value ? Number(e.target.value) : undefined }))
            }
            className="w-24 rounded-lg border border-slate-600 bg-secondary px-3 py-2 text-primary placeholder-text-muted focus:border-accent focus:outline-none"
            aria-label="Age"
            min={0}
          />
          <button
            type="submit"
            className="rounded-lg bg-accent px-4 py-2 text-sm font-semibold text-primary hover:bg-accent-hover disabled:opacity-50"
            disabled={createMutation.isPending}
            aria-label="Create player"
          >
            {createMutation.isPending ? 'Creating…' : 'Create'}
          </button>
        </form>
        {createMutation.isError && (
          <p className="mt-2 text-xs text-red-400">
            {(createMutation.error as Error)?.message ?? 'Failed to create player'}
          </p>
        )}
      </div>
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
