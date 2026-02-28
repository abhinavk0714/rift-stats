import { useParams, useNavigate } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { getTeamById } from '../api/teamsApi'
import { LoadingSpinner } from '../components/LoadingSpinner'
import { ErrorMessage } from '../components/ErrorMessage'

export function TeamDetailPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['team', id],
    queryFn: () => getTeamById(Number(id)),
    enabled: !!id,
  })

  if (!id) return <ErrorMessage message="Missing team ID" />
  if (isLoading) return <LoadingSpinner label="Loading team…" />
  if (error || !data) return <ErrorMessage message={error instanceof Error ? error?.message : 'Team not found'} onRetry={refetch} />

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
          <dt className="text-text-muted">Short name</dt><dd className="text-primary">{data.short_name ?? '—'}</dd>
          <dt className="text-text-muted">Region</dt><dd className="text-primary">{data.region}</dd>
        </dl>
      </div>
    </div>
  )
}
