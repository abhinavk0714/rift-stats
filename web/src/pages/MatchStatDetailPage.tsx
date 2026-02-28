import { useParams, useNavigate } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { getMatchStatById } from '../api/matchStatsApi'
import { getAllTeams } from '../api/teamsApi'
import { LoadingSpinner } from '../components/LoadingSpinner'
import { ErrorMessage } from '../components/ErrorMessage'

export function MatchStatDetailPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['matchStat', id],
    queryFn: () => getMatchStatById(Number(id)),
    enabled: !!id,
  })
  const { data: teams = [] } = useQuery({ queryKey: ['teams'], queryFn: () => getAllTeams({ limit: 500 }) })

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
        <h1 className="text-2xl font-bold text-accent">Match Stat #{data.id}</h1>
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
      </div>
    </div>
  )
}
