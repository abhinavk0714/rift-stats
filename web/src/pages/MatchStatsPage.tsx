import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import {
  getMatchStatsByMatchId,
  type MatchStat,
  createMatchStat,
  deleteMatchStat,
  type MatchStatCreateInput,
} from '../api/matchStatsApi'
import { getAllMatches } from '../api/matchesApi'
import { getAllTeams } from '../api/teamsApi'
import { DataTable, type Column } from '../components/DataTable'
import { LoadingSpinner } from '../components/LoadingSpinner'
import { ErrorMessage } from '../components/ErrorMessage'

export function MatchStatsPage() {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const [matchId, setMatchId] = useState<string>('')

  const { data: matches = [] } = useQuery({ queryKey: ['matches'], queryFn: () => getAllMatches({ limit: 500 }) })
  const { data: stats = [], isLoading, error, refetch } = useQuery({
    queryKey: ['matchStats', matchId],
    queryFn: () => getMatchStatsByMatchId(Number(matchId)),
    enabled: !!matchId,
  })
  const { data: teams = [] } = useQuery({ queryKey: ['teams'], queryFn: () => getAllTeams({ limit: 500 }) })

  const [form, setForm] = useState<MatchStatCreateInput | null>(null)

  const createMutation = useMutation({
    mutationFn: (data: MatchStatCreateInput) => createMatchStat(data),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['matchStats', matchId] })
      setForm(null)
    },
  })

  const deleteMutation = useMutation({
    mutationFn: (id: number) => deleteMatchStat(id),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['matchStats', matchId] })
    },
  })

  const columns: Column<MatchStat>[] = [
    { key: 'id', header: 'ID', render: (r) => r.id, sortKey: (r) => r.id },
    { key: 'team_id', header: 'Team', render: (r) => teams.find((t) => t.id === r.team_id)?.name ?? r.team_id },
    { key: 'kills', header: 'Kills', render: (r) => r.kills ?? '—', sortKey: (r) => r.kills ?? 0 },
    { key: 'deaths', header: 'Deaths', render: (r) => r.deaths ?? '—', sortKey: (r) => r.deaths ?? 0 },
    { key: 'assists', header: 'Assists', render: (r) => r.assists ?? '—', sortKey: (r) => r.assists ?? 0 },
    { key: 'win', header: 'Win', render: (r) => (r.win ? 'Yes' : 'No'), sortKey: (r) => (r.win ? 1 : 0) },
    {
      key: 'actions',
      header: 'Actions',
      render: (r) => (
        <button
          type="button"
          className="rounded bg-red-500 px-2 py-1 text-xs text-primary hover:bg-red-600"
          aria-label={`Delete match stat ${r.id}`}
          onClick={(e) => {
            e.stopPropagation()
            if (!confirm(`Delete match stat #${r.id}?`)) return
            deleteMutation.mutate(r.id)
          }}
        >
          Delete
        </button>
      ),
    },
  ]

  if (!matchId) {
    return (
      <div>
        <h1 className="mb-6 text-2xl font-bold text-primary">Match Stats</h1>
        <p className="mb-4 text-text-muted">Select a match to view stats.</p>
        <select
          value={matchId}
          onChange={(e) => setMatchId(e.target.value)}
          className="rounded-lg border border-slate-600 bg-secondary px-3 py-2 text-primary focus:border-accent focus:outline-none"
          aria-label="Select match"
        >
          <option value="">— Select match —</option>
          {matches.map((m) => (
            <option key={m.id} value={String(m.id)}>Match #{m.id} ({m.match_date.slice(0, 10)})</option>
          ))}
        </select>
      </div>
    )
  }

  if (isLoading) return <LoadingSpinner label="Loading match stats…" />
  if (error) return <ErrorMessage message={error instanceof Error ? error.message : 'Failed to load match stats'} onRetry={refetch} />

  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold text-primary">Match Stats</h1>
      <div className="mb-4 flex flex-wrap items-center gap-3">
        <label htmlFor="match-stats-match" className="text-text-muted">Match</label>
        <select
          id="match-stats-match"
          value={matchId}
          onChange={(e) => setMatchId(e.target.value)}
          className="rounded-lg border border-slate-600 bg-secondary px-3 py-2 text-primary focus:border-accent focus:outline-none"
          aria-label="Select match"
        >
          <option value="">— Select match —</option>
          {matches.map((m) => (
            <option key={m.id} value={String(m.id)}>Match #{m.id} ({m.match_date.slice(0, 10)})</option>
          ))}
        </select>
      </div>
      <div className="mb-6 rounded-xl bg-secondary p-4 shadow-sm">
        <h2 className="mb-3 text-sm font-semibold text-primary">Add match stat</h2>
        <form
          className="flex flex-wrap items-end gap-3"
          onSubmit={(e) => {
            e.preventDefault()
            const base: MatchStatCreateInput = {
              match_id: Number(matchId),
              team_id: form?.team_id ?? 0,
              win: form?.win ?? false,
              gold_diff_15: form?.gold_diff_15,
              kills: form?.kills,
              deaths: form?.deaths,
              assists: form?.assists,
              towers_taken: form?.towers_taken,
              dragons_taken: form?.dragons_taken,
              barons_taken: form?.barons_taken,
              first_blood: form?.first_blood,
            }
            if (!base.team_id) return
            createMutation.mutate(base)
          }}
        >
          <label className="flex flex-col gap-1 text-sm text-text-muted">
            Team
            <select
              value={form?.team_id ?? ''}
              onChange={(e) =>
                setForm((f) => ({
                  ...(f ?? { match_id: Number(matchId), win: false }),
                  team_id: Number(e.target.value || 0),
                }))
              }
              className="min-w-[160px] rounded-lg border border-slate-600 bg-secondary px-3 py-2 text-primary focus:border-accent focus:outline-none"
              aria-label="Stat team"
            >
              <option value="">— Select team —</option>
              {teams.map((t) => (
                <option key={t.id} value={t.id}>{t.name}</option>
              ))}
            </select>
          </label>
          <label className="flex flex-col gap-1 text-sm text-text-muted">
            Kills
            <input
              type="number"
              value={form?.kills ?? ''}
              onChange={(e) =>
                setForm((f) => ({
                  ...(f ?? { match_id: Number(matchId), team_id: 0, win: false }),
                  kills: e.target.value ? Number(e.target.value) : undefined,
                }))
              }
              className="w-24 rounded-lg border border-slate-600 bg-secondary px-3 py-2 text-primary focus:border-accent focus:outline-none"
              aria-label="Kills"
            />
          </label>
          <label className="flex flex-col gap-1 text-sm text-text-muted">
            Deaths
            <input
              type="number"
              value={form?.deaths ?? ''}
              onChange={(e) =>
                setForm((f) => ({
                  ...(f ?? { match_id: Number(matchId), team_id: 0, win: false }),
                  deaths: e.target.value ? Number(e.target.value) : undefined,
                }))
              }
              className="w-24 rounded-lg border border-slate-600 bg-secondary px-3 py-2 text-primary focus:border-accent focus:outline-none"
              aria-label="Deaths"
            />
          </label>
          <label className="flex flex-col gap-1 text-sm text-text-muted">
            Assists
            <input
              type="number"
              value={form?.assists ?? ''}
              onChange={(e) =>
                setForm((f) => ({
                  ...(f ?? { match_id: Number(matchId), team_id: 0, win: false }),
                  assists: e.target.value ? Number(e.target.value) : undefined,
                }))
              }
              className="w-24 rounded-lg border border-slate-600 bg-secondary px-3 py-2 text-primary focus:border-accent focus:outline-none"
              aria-label="Assists"
            />
          </label>
          <label className="flex items-center gap-2 text-sm text-text-muted">
            <input
              type="checkbox"
              checked={form?.win ?? false}
              onChange={(e) =>
                setForm((f) => ({
                  ...(f ?? { match_id: Number(matchId), team_id: 0 }),
                  win: e.target.checked,
                }))
              }
              className="h-4 w-4 rounded border-slate-600 bg-secondary text-accent focus:ring-accent"
              aria-label="Win"
            />
            Win
          </label>
          <button
            type="submit"
            className="rounded-lg bg-accent px-4 py-2 text-sm font-semibold text-primary hover:bg-accent-hover disabled:opacity-50"
            disabled={createMutation.isPending}
            aria-label="Add match stat"
          >
            {createMutation.isPending ? 'Adding…' : 'Add'}
          </button>
        </form>
        {createMutation.isError && (
          <p className="mt-2 text-xs text-red-400">
            {(createMutation.error as Error)?.message ?? 'Failed to add match stat'}
          </p>
        )}
      </div>
      <DataTable
        columns={columns}
        rows={stats}
        keyField="id"
        onRowClick={(row) => navigate(`/match-stats/${row.id}`)}
        emptyMessage="No stats for this match."
      />
    </div>
  )
}
