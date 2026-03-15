import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { getAllMatches, type Match, createMatch, deleteMatch, type MatchCreateInput } from '../api/matchesApi'
import { getAllTeams } from '../api/teamsApi'
import { DataTable, type Column } from '../components/DataTable'
import { LoadingSpinner } from '../components/LoadingSpinner'
import { ErrorMessage } from '../components/ErrorMessage'

export function MatchesPage() {
  const navigate = useNavigate()
  const queryClient = useQueryClient()

  const [searchDate, setSearchDate] = useState('')
  const [teamIdFilter, setTeamIdFilter] = useState<string>('')

  const [form, setForm] = useState<MatchCreateInput>({
    team_a_id: 1,
    team_b_id: 2,
    match_date: new Date().toISOString().slice(0, 16),
    region: 'LCK',
    best_of: 1,
    game_number: 1,
  })

  const { data: matches = [], isLoading, error, refetch } = useQuery({
    queryKey: ['matches'],
    queryFn: () => getAllMatches({ limit: 500 }),
  })
  const { data: teams = [] } = useQuery({ queryKey: ['teams'], queryFn: () => getAllTeams({ limit: 500 }) })

  const createMutation = useMutation({
    mutationFn: (data: MatchCreateInput) => createMatch(data),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['matches'] })
    },
  })

  const deleteMutation = useMutation({
    mutationFn: (id: number) => deleteMatch(id),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['matches'] })
    },
  })

  // TODO: switch to server-side filter when backend supports query params (e.g. ?date=, ?team_id=)
  const filtered = useMemo(() => {
    let list = matches
    if (searchDate) {
      list = list.filter((m) => m.match_date.startsWith(searchDate))
    }
    if (teamIdFilter) {
      const tid = Number(teamIdFilter)
      list = list.filter((m) => m.team_a_id === tid || m.team_b_id === tid)
    }
    return list
  }, [matches, searchDate, teamIdFilter])

  const columns: Column<Match>[] = [
    { key: 'id', header: 'ID', render: (r) => r.id, sortKey: (r) => r.id },
    { key: 'match_date', header: 'Date', render: (r) => r.match_date.slice(0, 10), sortKey: (r) => r.match_date },
    { key: 'region', header: 'Region', render: (r) => r.region, sortKey: (r) => r.region },
    { key: 'team_a_id', header: 'Team A', render: (r) => teams.find((t) => t.id === r.team_a_id)?.name ?? r.team_a_id },
    { key: 'team_b_id', header: 'Team B', render: (r) => teams.find((t) => t.id === r.team_b_id)?.name ?? r.team_b_id },
    { key: 'winner_team_id', header: 'Winner', render: (r) => r.winner_team_id ? (teams.find((t) => t.id === r.winner_team_id)?.name ?? r.winner_team_id) : '—' },
    {
      key: 'actions',
      header: 'Actions',
      render: (r) => (
        <button
          type="button"
          className="rounded bg-red-500 px-2 py-1 text-xs text-primary hover:bg-red-600"
          aria-label={`Delete match ${r.id}`}
          onClick={(e) => {
            e.stopPropagation()
            if (!confirm(`Delete match #${r.id}?`)) return
            deleteMutation.mutate(r.id)
          }}
        >
          Delete
        </button>
      ),
    },
  ]

  if (isLoading) return <LoadingSpinner label="Loading matches…" />
  if (error) return <ErrorMessage message={error instanceof Error ? error.message : 'Failed to load matches'} onRetry={refetch} />

  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold text-primary">Matches</h1>
      <div className="mb-6 rounded-xl bg-secondary p-4 shadow-sm">
        <h2 className="mb-3 text-sm font-semibold text-primary">Create match (simple)</h2>
        <form
          className="flex flex-wrap items-end gap-3"
          onSubmit={(e) => {
            e.preventDefault()
            if (!form.team_a_id || !form.team_b_id || form.team_a_id === form.team_b_id) return
            createMutation.mutate(form)
          }}
        >
          <label className="flex flex-col gap-1 text-sm text-text-muted">
            Team A
            <select
              value={form.team_a_id}
              onChange={(e) =>
                setForm((f) => ({ ...f, team_a_id: Number(e.target.value || 0) }))
              }
              className="rounded-lg border border-slate-600 bg-secondary px-3 py-2 text-primary focus:border-accent focus:outline-none"
              aria-label="Team A"
            >
              {teams.map((t) => (
                <option key={t.id} value={t.id}>{t.name}</option>
              ))}
            </select>
          </label>
          <label className="flex flex-col gap-1 text-sm text-text-muted">
            Team B
            <select
              value={form.team_b_id}
              onChange={(e) =>
                setForm((f) => ({ ...f, team_b_id: Number(e.target.value || 0) }))
              }
              className="rounded-lg border border-slate-600 bg-secondary px-3 py-2 text-primary focus:border-accent focus:outline-none"
              aria-label="Team B"
            >
              {teams.map((t) => (
                <option key={t.id} value={t.id}>{t.name}</option>
              ))}
            </select>
          </label>
          <label className="flex flex-col gap-1 text-sm text-text-muted">
            Date/time
            <input
              type="datetime-local"
              value={form.match_date}
              onChange={(e) => setForm((f) => ({ ...f, match_date: e.target.value }))}
              className="rounded-lg border border-slate-600 bg-secondary px-3 py-2 text-primary focus:border-accent focus:outline-none"
              aria-label="Match date time"
            />
          </label>
          <button
            type="submit"
            className="rounded-lg bg-accent px-4 py-2 text-sm font-semibold text-primary hover:bg-accent-hover disabled:opacity-50"
            disabled={createMutation.isPending || teams.length < 2}
            aria-label="Create match"
          >
            {createMutation.isPending ? 'Creating…' : 'Create'}
          </button>
        </form>
        {createMutation.isError && (
          <p className="mt-2 text-xs text-red-400">
            {(createMutation.error as Error)?.message ?? 'Failed to create match'}
          </p>
        )}
      </div>
      <div className="mb-4 flex flex-wrap items-center gap-3">
        <input
          type="date"
          value={searchDate}
          onChange={(e) => setSearchDate(e.target.value)}
          className="rounded-lg border border-slate-600 bg-secondary px-3 py-2 text-primary focus:border-accent focus:outline-none"
          aria-label="Filter by date"
        />
        <select
          value={teamIdFilter}
          onChange={(e) => setTeamIdFilter(e.target.value)}
          className="rounded-lg border border-slate-600 bg-secondary px-3 py-2 text-primary focus:border-accent focus:outline-none"
          aria-label="Filter by team"
        >
          <option value="">All teams</option>
          {teams.map((t) => (
            <option key={t.id} value={String(t.id)}>{t.name}</option>
          ))}
        </select>
      </div>
      <DataTable
        columns={columns}
        rows={filtered}
        keyField="id"
        onRowClick={(row) => navigate(`/matches/${row.id}`)}
        emptyMessage="No matches match the filter."
      />
    </div>
  )
}
