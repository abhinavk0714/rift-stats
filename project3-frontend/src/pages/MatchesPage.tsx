import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { getAllMatches, type Match } from '../api/matchesApi'
import { getAllTeams } from '../api/teamsApi'
import { DataTable, type Column } from '../components/DataTable'
import { LoadingSpinner } from '../components/LoadingSpinner'
import { ErrorMessage } from '../components/ErrorMessage'

export function MatchesPage() {
  const navigate = useNavigate()
  const [searchDate, setSearchDate] = useState('')
  const [teamIdFilter, setTeamIdFilter] = useState<string>('')

  const { data: matches = [], isLoading, error, refetch } = useQuery({
    queryKey: ['matches'],
    queryFn: () => getAllMatches({ limit: 500 }),
  })
  const { data: teams = [] } = useQuery({ queryKey: ['teams'], queryFn: () => getAllTeams({ limit: 500 }) })

  // TODO: switch to server-side filter when backend supports query params (e.g. ?date=, ?team_id=)
  const filtered = useMemo(() => {
    let list = matches
    if (searchDate) {
      list = list.filter((m) => m.match_date.startsWith(searchDate))
    }
    if (teamIdFilter) {
      const tid = Number(teamIdFilter)
      list = list.filter((m) => m.team_a_id === tid || m.team_b_id === tid)
    }
    return list
  }, [matches, searchDate, teamIdFilter])

  const columns: Column<Match>[] = [
    { key: 'id', header: 'ID', render: (r) => r.id, sortKey: (r) => r.id },
    { key: 'match_date', header: 'Date', render: (r) => r.match_date.slice(0, 10), sortKey: (r) => r.match_date },
    { key: 'region', header: 'Region', render: (r) => r.region, sortKey: (r) => r.region },
    { key: 'team_a_id', header: 'Team A', render: (r) => teams.find((t) => t.id === r.team_a_id)?.name ?? r.team_a_id },
    { key: 'team_b_id', header: 'Team B', render: (r) => teams.find((t) => t.id === r.team_b_id)?.name ?? r.team_b_id },
    { key: 'winner_team_id', header: 'Winner', render: (r) => r.winner_team_id ? (teams.find((t) => t.id === r.winner_team_id)?.name ?? r.winner_team_id) : '—' },
  ]

  if (isLoading) return <LoadingSpinner label="Loading matches…" />
  if (error) return <ErrorMessage message={error instanceof Error ? error.message : 'Failed to load matches'} onRetry={refetch} />

  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold text-primary">Matches</h1>
      <div className="mb-4 flex flex-wrap items-center gap-3">
        <input
          type="date"
          value={searchDate}
          onChange={(e) => setSearchDate(e.target.value)}
          className="rounded-lg border border-slate-600 bg-secondary px-3 py-2 text-primary focus:border-accent focus:outline-none"
          aria-label="Filter by date"
        />
        <select
          value={teamIdFilter}
          onChange={(e) => setTeamIdFilter(e.target.value)}
          className="rounded-lg border border-slate-600 bg-secondary px-3 py-2 text-primary focus:border-accent focus:outline-none"
          aria-label="Filter by team"
        >
          <option value="">All teams</option>
          {teams.map((t) => (
            <option key={t.id} value={String(t.id)}>{t.name}</option>
          ))}
        </select>
      </div>
      <DataTable
        columns={columns}
        rows={filtered}
        keyField="id"
        onRowClick={(row) => navigate(`/matches/${row.id}`)}
        emptyMessage="No matches match the filter."
      />
    </div>
  )
}
