import { useParams, useNavigate } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { getRosterEntryById } from '../api/rosterApi'
import { getAllTeams } from '../api/teamsApi'
import { getAllPlayers } from '../api/playersApi'
import { LoadingSpinner } from '../components/LoadingSpinner'
import { ErrorMessage } from '../components/ErrorMessage'

export function RosterDetailPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['rosterEntry', id],
    queryFn: () => getRosterEntryById(Number(id)),
    enabled: !!id,
  })
  const { data: teams = [] } = useQuery({ queryKey: ['teams'], queryFn: () => getAllTeams({ limit: 500 }) })
  const { data: players = [] } = useQuery({ queryKey: ['players'], queryFn: () => getAllPlayers({ limit: 500 }) })

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
        <h1 className="text-2xl font-bold text-accent">Roster Entry #{data.id}</h1>
        <dl className="mt-4 grid gap-2 sm:grid-cols-2">
          <dt className="text-text-muted">Team</dt><dd className="text-primary">{team?.name ?? data.team_id}</dd>
          <dt className="text-text-muted">Player</dt><dd className="text-primary">{player?.name ?? data.player_id}</dd>
          <dt className="text-text-muted">Start date</dt><dd className="text-primary">{data.start_date}</dd>
          <dt className="text-text-muted">End date</dt><dd className="text-primary">{data.end_date ?? '—'}</dd>
          <dt className="text-text-muted">Role at team</dt><dd className="text-primary">{data.role_at_team ?? '—'}</dd>
        </dl>
      </div>
    </div>
  )
}
