import { useQuery } from '@tanstack/react-query'
import { getAllPlayers } from '../api/playersApi'
import { getAllTeams } from '../api/teamsApi'
import { getAllMatches } from '../api/matchesApi'
import { LoadingSpinner } from '../components/LoadingSpinner'
import { ErrorMessage } from '../components/ErrorMessage'

export function Dashboard() {
  const teams = useQuery({ queryKey: ['teams'], queryFn: () => getAllTeams({ limit: 500 }) })
  const players = useQuery({ queryKey: ['players'], queryFn: () => getAllPlayers({ limit: 500 }) })
  const matches = useQuery({ queryKey: ['matches'], queryFn: () => getAllMatches({ limit: 500 }) })

  const loading = teams.isLoading || players.isLoading || matches.isLoading
  const error = teams.error || players.error || matches.error

  if (loading) return <LoadingSpinner label="Loading dashboard…" />
  if (error) {
    return (
      <ErrorMessage
        message={error instanceof Error ? error.message : 'Failed to load counts'}
        onRetry={() => {
          teams.refetch()
          players.refetch()
          matches.refetch()
        }}
      />
    )
  }

  const teamCount = teams.data?.length ?? 0
  const playerCount = players.data?.length ?? 0
  const matchCount = matches.data?.length ?? 0

  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold text-primary">Dashboard</h1>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <div className="rounded-xl bg-secondary p-6 shadow-lg ring-1 ring-slate-700">
          <p className="text-sm font-medium text-text-muted">Teams</p>
          <p className="mt-1 text-3xl font-bold text-accent">{teamCount}</p>
        </div>
        <div className="rounded-xl bg-secondary p-6 shadow-lg ring-1 ring-slate-700">
          <p className="text-sm font-medium text-text-muted">Players</p>
          <p className="mt-1 text-3xl font-bold text-accent">{playerCount}</p>
        </div>
        <div className="rounded-xl bg-secondary p-6 shadow-lg ring-1 ring-slate-700">
          <p className="text-sm font-medium text-text-muted">Matches</p>
          <p className="mt-1 text-3xl font-bold text-accent">{matchCount}</p>
        </div>
      </div>
    </div>
  )
}
