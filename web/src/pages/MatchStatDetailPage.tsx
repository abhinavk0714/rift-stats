import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { getMatchStatById, updateMatchStat, deleteMatchStat, type MatchStatUpdateInput } from '../api/matchStatsApi'
import { getAllTeams } from '../api/teamsApi'
import { LoadingSpinner } from '../components/LoadingSpinner'
import { ErrorMessage } from '../components/ErrorMessage'

export function MatchStatDetailPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['matchStat', id],
    queryFn: () => getMatchStatById(Number(id)),
    enabled: !!id,
  })
  const { data: teams = [] } = useQuery({ queryKey: ['teams'], queryFn: () => getAllTeams({ limit: 500 }) })

  const [editing, setEditing] = useState(false)
  const [form, setForm] = useState<MatchStatUpdateInput | null>(null)

  const updateMutation = useMutation({
    mutationFn: (payload: { id: number; data: MatchStatUpdateInput }) =>
      updateMatchStat(payload.id, payload.data),
    onSuccess: (_, vars) => {
      void queryClient.invalidateQueries({ queryKey: ['matchStat', String(vars.id)] })
      setEditing(false)
    },
  })

  const deleteMutation = useMutation({
    mutationFn: (statId: number) => deleteMatchStat(statId),
    onSuccess: () => {
      navigate('/match-stats')
    },
  })

  if (!id) return <ErrorMessage message="Missing stat ID" />
  if (isLoading) return <LoadingSpinner label="Loading stat…" />
  if (error || !data) return <ErrorMessage message={error instanceof Error ? error?.message : 'Stat not found'} onRetry={refetch} />

  const team = teams.find((t) => t.id === data.team_id)

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
          <h1 className="text-2xl font-bold text-accent">Match Stat #{data.id}</h1>
          <div className="flex gap-2">
            <button
              type="button"
              className="rounded bg-slate-700 px-3 py-1 text-sm text-primary hover:bg-slate-600"
              aria-label="Edit match stat"
              onClick={() => {
                setForm({
                  gold_diff_15: data.gold_diff_15,
                  kills: data.kills,
                  deaths: data.deaths,
                  assists: data.assists,
                  towers_taken: data.towers_taken,
                  dragons_taken: data.dragons_taken,
                  barons_taken: data.barons_taken,
                  first_blood: data.first_blood,
                  win: data.win,
                })
                setEditing(true)
              }}
            >
              Edit
            </button>
            <button
              type="button"
              className="rounded bg-red-500 px-3 py-1 text-sm text-primary hover:bg-red-600"
              aria-label="Delete match stat"
              onClick={() => {
                if (!confirm(`Delete match stat #${data.id}?`)) return
                deleteMutation.mutate(data.id)
              }}
            >
              Delete
            </button>
          </div>
        </div>
        {!editing && (
          <dl className="mt-4 grid gap-2 sm:grid-cols-2">
            <dt className="text-text-muted">Match ID</dt><dd className="text-primary">{data.match_id}</dd>
            <dt className="text-text-muted">Team</dt><dd className="text-primary">{team?.name ?? data.team_id}</dd>
            <dt className="text-text-muted">Kills</dt><dd className="text-primary">{data.kills ?? '—'}</dd>
            <dt className="text-text-muted">Deaths</dt><dd className="text-primary">{data.deaths ?? '—'}</dd>
            <dt className="text-text-muted">Assists</dt><dd className="text-primary">{data.assists ?? '—'}</dd>
            <dt className="text-text-muted">Gold diff @15</dt><dd className="text-primary">{data.gold_diff_15 ?? '—'}</dd>
            <dt className="text-text-muted">Towers</dt><dd className="text-primary">{data.towers_taken ?? '—'}</dd>
            <dt className="text-text-muted">Dragons</dt><dd className="text-primary">{data.dragons_taken ?? '—'}</dd>
            <dt className="text-text-muted">Barons</dt><dd className="text-primary">{data.barons_taken ?? '—'}</dd>
            <dt className="text-text-muted">First blood</dt><dd className="text-primary">{data.first_blood == null ? '—' : data.first_blood ? 'Yes' : 'No'}</dd>
            <dt className="text-text-muted">Win</dt><dd className="text-primary">{data.win ? 'Yes' : 'No'}</dd>
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
              Gold diff @15
              <input
                type="number"
                value={form.gold_diff_15 ?? ''}
                onChange={(e) =>
                  setForm((f: MatchStatUpdateInput | null) => ({
                    ...(f ?? {}),
                    gold_diff_15: e.target.value ? Number(e.target.value) : undefined,
                  }))
                }
                className="rounded-lg border border-slate-600 bg-secondary px-3 py-2 text-primary focus:border-accent focus:outline-none"
              />
            </label>
            <label className="flex flex-col gap-1 text-sm text-text-muted">
              Kills
              <input
                type="number"
                value={form.kills ?? ''}
                onChange={(e) =>
                  setForm((f: MatchStatUpdateInput | null) => ({
                    ...(f ?? {}),
                    kills: e.target.value ? Number(e.target.value) : undefined,
                  }))
                }
                className="rounded-lg border border-slate-600 bg-secondary px-3 py-2 text-primary focus:border-accent focus:outline-none"
              />
            </label>
            <label className="flex flex-col gap-1 text-sm text-text-muted">
              Deaths
              <input
                type="number"
                value={form.deaths ?? ''}
                onChange={(e) =>
                  setForm((f: MatchStatUpdateInput | null) => ({
                    ...(f ?? {}),
                    deaths: e.target.value ? Number(e.target.value) : undefined,
                  }))
                }
                className="rounded-lg border border-slate-600 bg-secondary px-3 py-2 text-primary focus:border-accent focus:outline-none"
              />
            </label>
            <label className="flex flex-col gap-1 text-sm text-text-muted">
              Assists
              <input
                type="number"
                value={form.assists ?? ''}
                onChange={(e) =>
                  setForm((f: MatchStatUpdateInput | null) => ({
                    ...(f ?? {}),
                    assists: e.target.value ? Number(e.target.value) : undefined,
                  }))
                }
                className="rounded-lg border border-slate-600 bg-secondary px-3 py-2 text-primary focus:border-accent focus:outline-none"
              />
            </label>
            <label className="flex flex-col gap-1 text-sm text-text-muted">
              Towers
              <input
                type="number"
                value={form.towers_taken ?? ''}
                onChange={(e) =>
                  setForm((f: MatchStatUpdateInput | null) => ({
                    ...(f ?? {}),
                    towers_taken: e.target.value ? Number(e.target.value) : undefined,
                  }))
                }
                className="rounded-lg border border-slate-600 bg-secondary px-3 py-2 text-primary focus:border-accent focus:outline-none"
              />
            </label>
            <label className="flex flex-col gap-1 text-sm text-text-muted">
              Dragons
              <input
                type="number"
                value={form.dragons_taken ?? ''}
                onChange={(e) =>
                  setForm((f: MatchStatUpdateInput | null) => ({
                    ...(f ?? {}),
                    dragons_taken: e.target.value ? Number(e.target.value) : undefined,
                  }))
                }
                className="rounded-lg border border-slate-600 bg-secondary px-3 py-2 text-primary focus:border-accent focus:outline-none"
              />
            </label>
            <label className="flex flex-col gap-1 text-sm text-text-muted">
              Barons
              <input
                type="number"
                value={form.barons_taken ?? ''}
                onChange={(e) =>
                  setForm((f: MatchStatUpdateInput | null) => ({
                    ...(f ?? {}),
                    barons_taken: e.target.value ? Number(e.target.value) : undefined,
                  }))
                }
                className="rounded-lg border border-slate-600 bg-secondary px-3 py-2 text-primary focus:border-accent focus:outline-none"
              />
            </label>
            <label className="flex items-center gap-2 text-sm text-text-muted">
              <input
                type="checkbox"
                checked={form.first_blood ?? false}
                onChange={(e) =>
                  setForm((f: MatchStatUpdateInput | null) => ({
                    ...(f ?? {}),
                    first_blood: e.target.checked,
                  }))
                }
                className="h-4 w-4 rounded border-slate-600 bg-secondary text-accent focus:ring-accent"
                aria-label="First blood"
              />
              First blood
            </label>
            <label className="flex items-center gap-2 text-sm text-text-muted">
              <input
                type="checkbox"
                checked={form.win ?? false}
                onChange={(e) =>
                  setForm((f: MatchStatUpdateInput | null) => ({
                    ...(f ?? {}),
                    win: e.target.checked,
                  }))
                }
                className="h-4 w-4 rounded border-slate-600 bg-secondary text-accent focus:ring-accent"
                aria-label="Win"
              />
              Win
            </label>
            <div className="col-span-full mt-2 flex gap-3">
              <button
                type="submit"
                className="rounded-lg bg-accent px-4 py-2 text-sm font-semibold text-primary hover:bg-accent-hover disabled:opacity-50"
                disabled={updateMutation.isPending}
                aria-label="Save match stat"
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
                {(updateMutation.error as Error)?.message ?? 'Failed to update match stat'}
              </p>
            )}
          </form>
        )}
      </div>
    </div>
  )
}
