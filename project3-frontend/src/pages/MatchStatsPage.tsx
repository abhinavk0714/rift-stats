import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { getMatchStatsByMatchId, type MatchStat } from '../api/matchStatsApi'
import { getAllMatches } from '../api/matchesApi'
import { getAllTeams } from '../api/teamsApi'
import { DataTable, type Column } from '../components/DataTable'
import { LoadingSpinner } from '../components/LoadingSpinner'
import { ErrorMessage } from '../components/ErrorMessage'

export function MatchStatsPage() {
  const navigate = useNavigate()
  const [matchId, setMatchId] = useState<string>('')

  const { data: matches = [] } = useQuery({ queryKey: ['matches'], queryFn: () => getAllMatches({ limit: 500 }) })
  const { data: stats = [], isLoading, error, refetch } = useQuery({
    queryKey: ['matchStats', matchId],
    queryFn: () => getMatchStatsByMatchId(Number(matchId)),
    enabled: !!matchId,
  })
  const { data: teams = [] } = useQuery({ queryKey: ['teams'], queryFn: () => getAllTeams({ limit: 500 }) })

  const columns: Column<MatchStat>[] = [
    { key: 'id', header: 'ID', render: (r) => r.id, sortKey: (r) => r.id },
    { key: 'team_id', header: 'Team', render: (r) => teams.find((t) => t.id === r.team_id)?.name ?? r.team_id },
    { key: 'kills', header: 'Kills', render: (r) => r.kills ?? '—', sortKey: (r) => r.kills ?? 0 },
    { key: 'deaths', header: 'Deaths', render: (r) => r.deaths ?? '—', sortKey: (r) => r.deaths ?? 0 },
    { key: 'assists', header: 'Assists', render: (r) => r.assists ?? '—', sortKey: (r) => r.assists ?? 0 },
    { key: 'win', header: 'Win', render: (r) => (r.win ? 'Yes' : 'No'), sortKey: (r) => (r.win ? 1 : 0) },
  ]

  if (!matchId) {
    return (
      <div>
        <h1 className="mb-6 text-2xl font-bold text-primary">Match Stats</h1>
        <p className="mb-4 text-text-muted">Select a match to view stats.</p>
        <select
          value={matchId}
          onChange={(e) => setMatchId(e.target.value)}
          className="rounded-lg border border-slate-600 bg-secondary px-3 py-2 text-primary focus:border-accent focus:outline-none"
          aria-label="Select match"
        >
          <option value="">— Select match —</option>
          {matches.map((m) => (
            <option key={m.id} value={String(m.id)}>Match #{m.id} ({m.match_date.slice(0, 10)})</option>
          ))}
        </select>
      </div>
    )
  }

  if (isLoading) return <LoadingSpinner label="Loading match stats…" />
  if (error) return <ErrorMessage message={error instanceof Error ? error.message : 'Failed to load match stats'} onRetry={refetch} />

  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold text-primary">Match Stats</h1>
      <div className="mb-4 flex flex-wrap items-center gap-3">
        <label htmlFor="match-stats-match" className="text-text-muted">Match</label>
        <select
          id="match-stats-match"
          value={matchId}
          onChange={(e) => setMatchId(e.target.value)}
          className="rounded-lg border border-slate-600 bg-secondary px-3 py-2 text-primary focus:border-accent focus:outline-none"
          aria-label="Select match"
        >
          <option value="">— Select match —</option>
          {matches.map((m) => (
            <option key={m.id} value={String(m.id)}>Match #{m.id} ({m.match_date.slice(0, 10)})</option>
          ))}
        </select>
      </div>
      <DataTable
        columns={columns}
        rows={stats}
        keyField="id"
        onRowClick={(row) => navigate(`/match-stats/${row.id}`)}
        emptyMessage="No stats for this match."
      />
    </div>
  )
}
