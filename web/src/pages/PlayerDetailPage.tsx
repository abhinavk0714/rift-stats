import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { getPlayerById, updatePlayer, type PlayerUpdateInput, deletePlayer } from '../api/playersApi'
import { LoadingSpinner } from '../components/LoadingSpinner'
import { ErrorMessage } from '../components/ErrorMessage'

export function PlayerDetailPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const queryClient = useQueryClient()

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['player', id],
    queryFn: () => getPlayerById(Number(id)),
    enabled: !!id,
  })

  const [editing, setEditing] = useState(false)
  const [form, setForm] = useState<PlayerUpdateInput | null>(null)

  const updateMutation = useMutation({
    mutationFn: (payload: { id: number; data: PlayerUpdateInput }) =>
      updatePlayer(payload.id, payload.data),
    onSuccess: (_, vars) => {
      void queryClient.invalidateQueries({ queryKey: ['player', String(vars.id)] })
      void queryClient.invalidateQueries({ queryKey: ['players'] })
      setEditing(false)
    },
  })

  const deleteMutation = useMutation({
    mutationFn: (playerId: number) => deletePlayer(playerId),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['players'] })
      navigate('/players')
    },
  })

  if (!id) return <ErrorMessage message="Missing player ID" />
  if (isLoading) return <LoadingSpinner label="Loading player…" />
  if (error || !data) return <ErrorMessage message={error instanceof Error ? error?.message : 'Player not found'} onRetry={refetch} />

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
          <h1 className="text-2xl font-bold text-accent">{data.name}</h1>
          <div className="flex gap-2">
            <button
              type="button"
              className="rounded bg-slate-700 px-3 py-1 text-sm text-primary hover:bg-slate-600"
              aria-label="Edit player"
              onClick={() => {
                setForm({
                  name: data.name,
                  gamer_tag: data.gamer_tag,
                  nationality: data.nationality,
                  role: data.role,
                  age: data.age,
                })
                setEditing(true)
              }}
            >
              Edit
            </button>
            <button
              type="button"
              className="rounded bg-red-500 px-3 py-1 text-sm text-primary hover:bg-red-600"
              aria-label="Delete player"
              onClick={() => {
                if (!confirm(`Delete player ${data.name}?`)) return
                deleteMutation.mutate(data.id)
              }}
            >
              Delete
            </button>
          </div>
        </div>

        {!editing && (
          <dl className="mt-4 grid gap-2 sm:grid-cols-2">
            <dt className="text-text-muted">ID</dt><dd className="text-primary">{data.id}</dd>
            <dt className="text-text-muted">Gamer Tag</dt><dd className="text-primary">{data.gamer_tag}</dd>
            <dt className="text-text-muted">Role</dt><dd className="text-primary">{data.role ?? '—'}</dd>
            <dt className="text-text-muted">Nationality</dt><dd className="text-primary">{data.nationality ?? '—'}</dd>
            <dt className="text-text-muted">Age</dt><dd className="text-primary">{data.age ?? '—'}</dd>
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
              Name
              <input
                type="text"
                value={form.name ?? ''}
                onChange={(e) =>
                  setForm((f: PlayerUpdateInput | null) => ({ ...(f ?? {}), name: e.target.value }))
                }
                className="rounded-lg border border-slate-600 bg-secondary px-3 py-2 text-primary focus:border-accent focus:outline-none"
                required
              />
            </label>
            <label className="flex flex-col gap-1 text-sm text-text-muted">
              Gamer tag
              <input
                type="text"
                value={form.gamer_tag ?? ''}
                onChange={(e) =>
                  setForm((f: PlayerUpdateInput | null) => ({
                    ...(f ?? {}),
                    gamer_tag: e.target.value,
                  }))
                }
                className="rounded-lg border border-slate-600 bg-secondary px-3 py-2 text-primary focus:border-accent focus:outline-none"
                required
              />
            </label>
            <label className="flex flex-col gap-1 text-sm text-text-muted">
              Role
              <input
                type="text"
                value={form.role ?? ''}
                onChange={(e) =>
                  setForm((f: PlayerUpdateInput | null) => ({
                    ...(f ?? {}),
                    role: e.target.value || undefined,
                  }))
                }
                className="rounded-lg border border-slate-600 bg-secondary px-3 py-2 text-primary focus:border-accent focus:outline-none"
              />
            </label>
            <label className="flex flex-col gap-1 text-sm text-text-muted">
              Nationality
              <input
                type="text"
                value={form.nationality ?? ''}
                onChange={(e) =>
                  setForm((f: PlayerUpdateInput | null) => ({
                    ...(f ?? {}),
                    nationality: e.target.value || undefined,
                  }))
                }
                className="rounded-lg border border-slate-600 bg-secondary px-3 py-2 text-primary focus:border-accent focus:outline-none"
              />
            </label>
            <label className="flex flex-col gap-1 text-sm text-text-muted">
              Age
              <input
                type="number"
                min={0}
                value={form.age ?? ''}
                onChange={(e) =>
                  setForm((f: PlayerUpdateInput | null) => ({
                    ...(f ?? {}),
                    age: e.target.value ? Number(e.target.value) : undefined,
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
                aria-label="Save player"
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
                {(updateMutation.error as Error)?.message ?? 'Failed to update player'}
              </p>
            )}
          </form>
        )}
      </div>
    </div>
  )
}
