import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { getRosterEntryById, updateRosterEntry, deleteRosterEntry, type RosterUpdateInput } from '../api/rosterApi'
import { getAllTeams } from '../api/teamsApi'
import { getAllPlayers } from '../api/playersApi'
import { LoadingSpinner } from '../components/LoadingSpinner'
import { ErrorMessage } from '../components/ErrorMessage'

export function RosterDetailPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['rosterEntry', id],
    queryFn: () => getRosterEntryById(Number(id)),
    enabled: !!id,
  })
  const { data: teams = [] } = useQuery({ queryKey: ['teams'], queryFn: () => getAllTeams({ limit: 500 }) })
  const { data: players = [] } = useQuery({ queryKey: ['players'], queryFn: () => getAllPlayers({ limit: 500 }) })

  const [editing, setEditing] = useState(false)
  const [form, setForm] = useState<RosterUpdateInput | null>(null)

  const updateMutation = useMutation({
    mutationFn: (payload: { id: number; data: RosterUpdateInput }) =>
      updateRosterEntry(payload.id, payload.data),
    onSuccess: (_, vars) => {
      void queryClient.invalidateQueries({ queryKey: ['rosterEntry', String(vars.id)] })
      void queryClient.invalidateQueries({ queryKey: ['roster', String(data?.team_id)] })
      setEditing(false)
    },
  })

  const deleteMutation = useMutation({
    mutationFn: (entryId: number) => deleteRosterEntry(entryId),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['roster', String(data?.team_id)] })
      navigate('/roster')
    },
  })

  if (!id) return <ErrorMessage message="Missing roster entry ID" />
  if (isLoading) return <LoadingSpinner label="Loading roster entry…" />
  if (error || !data) return <ErrorMessage message={error instanceof Error ? error?.message : 'Roster entry not found'} onRetry={refetch} />

  const team = teams.find((t) => t.id === data.team_id)
  const player = players.find((p) => p.id === data.player_id)

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
          <h1 className="text-2xl font-bold text-accent">Roster Entry #{data.id}</h1>
          <div className="flex gap-2">
            <button
              type="button"
              className="rounded bg-slate-700 px-3 py-1 text-sm text-primary hover:bg-slate-600"
              aria-label="Edit roster entry"
              onClick={() => {
                setForm({
                  end_date: data.end_date,
                  role_at_team: data.role_at_team,
                })
                setEditing(true)
              }}
            >
              Edit
            </button>
            <button
              type="button"
              className="rounded bg-red-500 px-3 py-1 text-sm text-primary hover:bg-red-600"
              aria-label="Delete roster entry"
              onClick={() => {
                if (!confirm(`Delete roster entry #${data.id}?`)) return
                deleteMutation.mutate(data.id)
              }}
            >
              Delete
            </button>
          </div>
        </div>
        {!editing && (
          <dl className="mt-4 grid gap-2 sm:grid-cols-2">
            <dt className="text-text-muted">Team</dt><dd className="text-primary">{team?.name ?? data.team_id}</dd>
            <dt className="text-text-muted">Player</dt><dd className="text-primary">{player?.name ?? data.player_id}</dd>
            <dt className="text-text-muted">Start date</dt><dd className="text-primary">{data.start_date}</dd>
            <dt className="text-text-muted">End date</dt><dd className="text-primary">{data.end_date ?? '—'}</dd>
            <dt className="text-text-muted">Role at team</dt><dd className="text-primary">{data.role_at_team ?? '—'}</dd>
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
              End date
              <input
                type="date"
                value={form.end_date ?? ''}
                onChange={(e) =>
                  setForm((f: RosterUpdateInput | null) => ({
                    ...(f ?? {}),
                    end_date: e.target.value || null,
                  }))
                }
                className="rounded-lg border border-slate-600 bg-secondary px-3 py-2 text-primary focus:border-accent focus:outline-none"
              />
            </label>
            <label className="flex flex-col gap-1 text-sm text-text-muted">
              Role at team
              <input
                type="text"
                value={form.role_at_team ?? ''}
                onChange={(e) =>
                  setForm((f: RosterUpdateInput | null) => ({
                    ...(f ?? {}),
                    role_at_team: e.target.value || undefined,
                  }))
                }
                className="rounded-lg border border-slate-600 bg-secondary px-3 py-2 text-primary focus:border-accent focus:outline-none"
              />
            </label>
            <div className="col-span-full mt-2 flex gap-3">
              <button
                type="submit"
                className="rounded-lg bg-accent px-4 py-2 text-sm font-semibold text-primary hover:bg-accent-hover disabled:opacity-50"
                disabled={updateMutation.isPending}
                aria-label="Save roster entry"
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
                {(updateMutation.error as Error)?.message ?? 'Failed to update roster entry'}
              </p>
            )}
          </form>
        )}
      </div>
    </div>
  )
}
