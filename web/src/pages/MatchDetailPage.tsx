import { useParams, useNavigate } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { getMatchById } from '../api/matchesApi'
import { getAllTeams } from '../api/teamsApi'
import { LoadingSpinner } from '../components/LoadingSpinner'
import { ErrorMessage } from '../components/ErrorMessage'

export function MatchDetailPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['match', id],
    queryFn: () => getMatchById(Number(id)),
    enabled: !!id,
  })
  const { data: teams = [] } = useQuery({ queryKey: ['teams'], queryFn: () => getAllTeams({ limit: 500 }) })

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
        <h1 className="text-2xl font-bold text-accent">Match #{data.id}</h1>
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
      </div>
    </div>
  )
}
