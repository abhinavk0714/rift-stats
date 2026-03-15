import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { getMatchById, updateMatch, deleteMatch, type MatchUpdateInput } from '../api/matchesApi'
import { getAllTeams } from '../api/teamsApi'
import { LoadingSpinner } from '../components/LoadingSpinner'
import { ErrorMessage } from '../components/ErrorMessage'

export function MatchDetailPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['match', id],
    queryFn: () => getMatchById(Number(id)),
    enabled: !!id,
  })
  const { data: teams = [] } = useQuery({ queryKey: ['teams'], queryFn: () => getAllTeams({ limit: 500 }) })

  const [editing, setEditing] = useState(false)
  const [form, setForm] = useState<MatchUpdateInput | null>(null)

  const updateMutation = useMutation({
    mutationFn: (payload: { id: number; data: MatchUpdateInput }) =>
      updateMatch(payload.id, payload.data),
    onSuccess: (_, vars) => {
      void queryClient.invalidateQueries({ queryKey: ['match', String(vars.id)] })
      void queryClient.invalidateQueries({ queryKey: ['matches'] })
      setEditing(false)
    },
  })

  const deleteMutation = useMutation({
    mutationFn: (matchId: number) => deleteMatch(matchId),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['matches'] })
      navigate('/matches')
    },
  })

  if (!id) return <ErrorMessage message="Missing match ID" />
  if (isLoading) return <LoadingSpinner label="Loading match…" />
  if (error || !data) return <ErrorMessage message={error instanceof Error ? error?.message : 'Match not found'} onRetry={refetch} />

  const teamA = teams.find((t) => t.id === data.team_a_id)
  const teamB = teams.find((t) => t.id === data.team_b_id)
  const winner = data.winner_team_id ? teams.find((t) => t.id === data.winner_team_id) : null

  return (
    <div>
      <button
        type="button"
        onClick={() => navigate(-1)}
        className="mb-4 text-text-muted hover:text-accent"
        aria-label="Go back"
      >
        ← Back
      </button>
      <div className="rounded-xl bg-secondary p-6 shadow-lg">
        <div className="mb-4 flex items-center justify-between">
          <h1 className="text-2xl font-bold text-accent">Match #{data.id}</h1>
          <div className="flex gap-2">
            <button
              type="button"
              className="rounded bg-slate-700 px-3 py-1 text-sm text-primary hover:bg-slate-600"
              aria-label="Edit match"
              onClick={() => {
                setForm({
                  match_date: data.match_date,
                  region: data.region,
                  season: data.season,
                  best_of: data.best_of,
                  game_number: data.game_number,
                  winner_team_id: data.winner_team_id,
                  patch: data.patch,
                  notes: data.notes,
                })
                setEditing(true)
              }}
            >
              Edit
            </button>
            <button
              type="button"
              className="rounded bg-red-500 px-3 py-1 text-sm text-primary hover:bg-red-600"
              aria-label="Delete match"
              onClick={() => {
                if (!confirm(`Delete match #${data.id}?`)) return
                deleteMutation.mutate(data.id)
              }}
            >
              Delete
            </button>
          </div>
        </div>

        {!editing && (
          <dl className="mt-4 grid gap-2 sm:grid-cols-2">
            <dt className="text-text-muted">Date</dt><dd className="text-primary">{data.match_date}</dd>
            <dt className="text-text-muted">Region</dt><dd className="text-primary">{data.region}</dd>
            <dt className="text-text-muted">Season</dt><dd className="text-primary">{data.season ?? '—'}</dd>
            <dt className="text-text-muted">Team A</dt><dd className="text-primary">{teamA?.name ?? data.team_a_id}</dd>
            <dt className="text-text-muted">Team B</dt><dd className="text-primary">{teamB?.name ?? data.team_b_id}</dd>
            <dt className="text-text-muted">Winner</dt><dd className="text-primary">{winner?.name ?? (data.winner_team_id ?? '—')}</dd>
            <dt className="text-text-muted">Best of</dt><dd className="text-primary">{data.best_of}</dd>
            <dt className="text-text-muted">Game #</dt><dd className="text-primary">{data.game_number}</dd>
            <dt className="text-text-muted">Patch</dt><dd className="text-primary">{data.patch ?? '—'}</dd>
            <dt className="text-text-muted">Notes</dt><dd className="text-primary">{data.notes ?? '—'}</dd>
          </dl>
        )}

        {editing && form && (
          <form
            className="mt-4 grid gap-3 sm:grid-cols-2"
            onSubmit={(e) => {
              e.preventDefault()
              updateMutation.mutate({ id: data.id, data: form })
            }}
          >
            <label className="flex flex-col gap-1 text-sm text-text-muted">
              Date
              <input
                type="datetime-local"
                value={form.match_date ?? ''}
                onChange={(e) =>
                  setForm((f: MatchUpdateInput | null) => ({ ...(f ?? {}), match_date: e.target.value }))
                }
                className="rounded-lg border border-slate-600 bg-secondary px-3 py-2 text-primary focus:border-accent focus:outline-none"
              />
            </label>
            <label className="flex flex-col gap-1 text-sm text-text-muted">
              Region
              <input
                type="text"
                value={form.region ?? ''}
                onChange={(e) =>
                  setForm((f: MatchUpdateInput | null) => ({
                    ...(f ?? {}),
                    region: e.target.value || undefined,
                  }))
                }
                className="rounded-lg border border-slate-600 bg-secondary px-3 py-2 text-primary focus:border-accent focus:outline-none"
              />
            </label>
            <label className="flex flex-col gap-1 text-sm text-text-muted">
              Season
              <input
                type="text"
                value={form.season ?? ''}
                onChange={(e) =>
                  setForm((f: MatchUpdateInput | null) => ({
                    ...(f ?? {}),
                    season: e.target.value || undefined,
                  }))
                }
                className="rounded-lg border border-slate-600 bg-secondary px-3 py-2 text-primary focus:border-accent focus:outline-none"
              />
            </label>
            <label className="flex flex-col gap-1 text-sm text-text-muted">
              Best of
              <input
                type="number"
                min={1}
                value={form.best_of ?? ''}
                onChange={(e) =>
                  setForm((f: MatchUpdateInput | null) => ({
                    ...(f ?? {}),
                    best_of: e.target.value ? Number(e.target.value) : undefined,
                  }))
                }
                className="rounded-lg border border-slate-600 bg-secondary px-3 py-2 text-primary focus:border-accent focus:outline-none"
              />
            </label>
            <label className="flex flex-col gap-1 text-sm text-text-muted">
              Game #
              <input
                type="number"
                min={1}
                value={form.game_number ?? ''}
                onChange={(e) =>
                  setForm((f: MatchUpdateInput | null) => ({
                    ...(f ?? {}),
                    game_number: e.target.value ? Number(e.target.value) : undefined,
                  }))
                }
                className="rounded-lg border border-slate-600 bg-secondary px-3 py-2 text-primary focus:border-accent focus:outline-none"
              />
            </label>
            <label className="flex flex-col gap-1 text-sm text-text-muted">
              Winner team ID
              <input
                type="number"
                value={form.winner_team_id ?? ''}
                onChange={(e) =>
                  setForm((f: MatchUpdateInput | null) => ({
                    ...(f ?? {}),
                    winner_team_id: e.target.value ? Number(e.target.value) : null,
                  }))
                }
                className="rounded-lg border border-slate-600 bg-secondary px-3 py-2 text-primary focus:border-accent focus:outline-none"
              />
            </label>
            <label className="flex flex-col gap-1 text-sm text-text-muted">
              Patch
              <input
                type="text"
                value={form.patch ?? ''}
                onChange={(e) =>
                  setForm((f: MatchUpdateInput | null) => ({
                    ...(f ?? {}),
                    patch: e.target.value || undefined,
                  }))
                }
                className="rounded-lg border border-slate-600 bg-secondary px-3 py-2 text-primary focus:border-accent focus:outline-none"
              />
            </label>
            <label className="col-span-full flex flex-col gap-1 text-sm text-text-muted">
              Notes
              <textarea
                value={form.notes ?? ''}
                onChange={(e) =>
                  setForm((f: MatchUpdateInput | null) => ({
                    ...(f ?? {}),
                    notes: e.target.value || undefined,
                  }))
                }
                className="min-h-[80px] rounded-lg border border-slate-600 bg-secondary px-3 py-2 text-primary focus:border-accent focus:outline-none"
              />
            </label>
            <div className="col-span-full mt-2 flex gap-3">
              <button
                type="submit"
                className="rounded-lg bg-accent px-4 py-2 text-sm font-semibold text-primary hover:bg-accent-hover disabled:opacity-50"
                disabled={updateMutation.isPending}
                aria-label="Save match"
              >
                {updateMutation.isPending ? 'Saving…' : 'Save'}
              </button>
              <button
                type="button"
                className="rounded-lg border border-slate-600 px-4 py-2 text-sm text-primary hover:bg-slate-700"
                onClick={() => setEditing(false)}
                aria-label="Cancel edit"
              >
                Cancel
              </button>
            </div>
            {updateMutation.isError && (
              <p className="col-span-full text-xs text-red-400">
                {(updateMutation.error as Error)?.message ?? 'Failed to update match'}
              </p>
            )}
          </form>
        )}
      </div>
    </div>
  )
}
