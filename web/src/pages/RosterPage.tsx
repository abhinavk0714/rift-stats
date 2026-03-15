import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import {
  getRosterByTeamId,
  type RosterEntry,
  createRosterEntry,
  deleteRosterEntry,
  type RosterCreateInput,
} from '../api/rosterApi'
import { getAllTeams } from '../api/teamsApi'
import { getAllPlayers } from '../api/playersApi'
import { DataTable, type Column } from '../components/DataTable'
import { LoadingSpinner } from '../components/LoadingSpinner'
import { ErrorMessage } from '../components/ErrorMessage'

export function RosterPage() {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const [teamId, setTeamId] = useState<string>('')

  const { data: teams = [] } = useQuery({ queryKey: ['teams'], queryFn: () => getAllTeams({ limit: 500 }) })
  const { data: roster = [], isLoading, error, refetch } = useQuery({
    queryKey: ['roster', teamId],
    queryFn: () => getRosterByTeamId(Number(teamId)),
    enabled: !!teamId,
  })
  const { data: players = [] } = useQuery({ queryKey: ['players'], queryFn: () => getAllPlayers({ limit: 500 }) })

  const [form, setForm] = useState<RosterCreateInput | null>(null)

  const createMutation = useMutation({
    mutationFn: (data: RosterCreateInput) => createRosterEntry(data),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['roster', teamId] })
      setForm(null)
    },
  })

  const deleteMutation = useMutation({
    mutationFn: (id: number) => deleteRosterEntry(id),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['roster', teamId] })
    },
  })

  const columns: Column<RosterEntry>[] = [
    { key: 'id', header: 'ID', render: (r) => r.id, sortKey: (r) => r.id },
    { key: 'player_id', header: 'Player', render: (r) => players.find((p) => p.id === r.player_id)?.name ?? r.player_id },
    { key: 'start_date', header: 'Start', render: (r) => r.start_date.slice(0, 10), sortKey: (r) => r.start_date },
    { key: 'end_date', header: 'End', render: (r) => r.end_date ? r.end_date.slice(0, 10) : '—' },
    { key: 'role_at_team', header: 'Role at team', render: (r) => r.role_at_team ?? '—' },
    {
      key: 'actions',
      header: 'Actions',
      render: (r) => (
        <button
          type="button"
          className="rounded bg-red-500 px-2 py-1 text-xs text-primary hover:bg-red-600"
          aria-label={`Delete roster entry ${r.id}`}
          onClick={(e) => {
            e.stopPropagation()
            if (!confirm(`Delete roster entry #${r.id}?`)) return
            deleteMutation.mutate(r.id)
          }}
        >
          Delete
        </button>
      ),
    },
  ]

  if (!teamId) {
    return (
      <div>
        <h1 className="mb-6 text-2xl font-bold text-primary">Roster</h1>
        <p className="mb-4 text-text-muted">Select a team to view roster entries.</p>
        <select
          value={teamId}
          onChange={(e) => setTeamId(e.target.value)}
          className="rounded-lg border border-slate-600 bg-secondary px-3 py-2 text-primary focus:border-accent focus:outline-none"
          aria-label="Select team"
        >
          <option value="">— Select team —</option>
          {teams.map((t) => (
            <option key={t.id} value={String(t.id)}>{t.name}</option>
          ))}
        </select>
      </div>
    )
  }

  if (isLoading) return <LoadingSpinner label="Loading roster…" />
  if (error) return <ErrorMessage message={error instanceof Error ? error.message : 'Failed to load roster'} onRetry={refetch} />

  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold text-primary">Roster</h1>
      <div className="mb-4 flex flex-wrap items-center gap-3">
        <label htmlFor="roster-team" className="text-text-muted">Team</label>
        <select
          id="roster-team"
          value={teamId}
          onChange={(e) => setTeamId(e.target.value)}
          className="rounded-lg border border-slate-600 bg-secondary px-3 py-2 text-primary focus:border-accent focus:outline-none"
          aria-label="Select team"
        >
          <option value="">— Select team —</option>
          {teams.map((t) => (
            <option key={t.id} value={String(t.id)}>{t.name}</option>
          ))}
        </select>
      </div>
      <div className="mb-6 rounded-xl bg-secondary p-4 shadow-sm">
        <h2 className="mb-3 text-sm font-semibold text-primary">Add roster entry</h2>
        <form
          className="flex flex-wrap items-end gap-3"
          onSubmit={(e) => {
            e.preventDefault()
            if (!teamId) return
            const data: RosterCreateInput = {
              team_id: Number(teamId),
              player_id: form?.player_id ?? 0,
              start_date: form?.start_date ?? '',
              role_at_team: form?.role_at_team,
            }
            if (!data.player_id || !data.start_date) return
            createMutation.mutate(data)
          }}
        >
          <label className="flex flex-col gap-1 text-sm text-text-muted">
            Player
            <select
              value={form?.player_id ?? ''}
              onChange={(e) =>
                setForm((f) => ({
                  ...(f ?? { team_id: Number(teamId), start_date: new Date().toISOString().slice(0, 10) }),
                  player_id: Number(e.target.value || 0),
                }))
              }
              className="min-w-[160px] rounded-lg border border-slate-600 bg-secondary px-3 py-2 text-primary focus:border-accent focus:outline-none"
              aria-label="Player"
            >
              <option value="">— Select player —</option>
              {players.map((p) => (
                <option key={p.id} value={p.id}>{p.name}</option>
              ))}
            </select>
          </label>
          <label className="flex flex-col gap-1 text-sm text-text-muted">
            Start date
            <input
              type="date"
              value={form?.start_date ?? new Date().toISOString().slice(0, 10)}
              onChange={(e) =>
                setForm((f) => ({
                  ...(f ?? { team_id: Number(teamId), player_id: 0 }),
                  start_date: e.target.value,
                }))
              }
              className="rounded-lg border border-slate-600 bg-secondary px-3 py-2 text-primary focus:border-accent focus:outline-none"
              aria-label="Start date"
            />
          </label>
          <label className="flex flex-col gap-1 text-sm text-text-muted">
            Role at team
            <input
              type="text"
              value={form?.role_at_team ?? ''}
              onChange={(e) =>
                setForm((f) => ({
                  ...(f ?? { team_id: Number(teamId), player_id: 0, start_date: new Date().toISOString().slice(0, 10) }),
                  role_at_team: e.target.value || undefined,
                }))
              }
              className="w-40 rounded-lg border border-slate-600 bg-secondary px-3 py-2 text-primary focus:border-accent focus:outline-none"
              aria-label="Role at team"
            />
          </label>
          <button
            type="submit"
            className="rounded-lg bg-accent px-4 py-2 text-sm font-semibold text-primary hover:bg-accent-hover disabled:opacity-50"
            disabled={createMutation.isPending || !players.length}
            aria-label="Add roster entry"
          >
            {createMutation.isPending ? 'Adding…' : 'Add'}
          </button>
        </form>
        {createMutation.isError && (
          <p className="mt-2 text-xs text-red-400">
            {(createMutation.error as Error)?.message ?? 'Failed to add roster entry'}
          </p>
        )}
      </div>
      <DataTable
        columns={columns}
        rows={roster}
        keyField="id"
        onRowClick={(row) => navigate(`/roster/${row.id}`)}
        emptyMessage="No roster entries for this team."
      />
    </div>
  )
}
