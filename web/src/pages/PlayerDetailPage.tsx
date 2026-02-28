import { useParams, useNavigate } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { getPlayerById } from '../api/playersApi'
import { LoadingSpinner } from '../components/LoadingSpinner'
import { ErrorMessage } from '../components/ErrorMessage'

export function PlayerDetailPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['player', id],
    queryFn: () => getPlayerById(Number(id)),
    enabled: !!id,
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
        <h1 className="text-2xl font-bold text-accent">{data.name}</h1>
        <dl className="mt-4 grid gap-2 sm:grid-cols-2">
          <dt className="text-text-muted">ID</dt><dd className="text-primary">{data.id}</dd>
          <dt className="text-text-muted">Gamer Tag</dt><dd className="text-primary">{data.gamer_tag}</dd>
          <dt className="text-text-muted">Role</dt><dd className="text-primary">{data.role ?? '—'}</dd>
          <dt className="text-text-muted">Nationality</dt><dd className="text-primary">{data.nationality ?? '—'}</dd>
          <dt className="text-text-muted">Age</dt><dd className="text-primary">{data.age ?? '—'}</dd>
        </dl>
      </div>
    </div>
  )
}
