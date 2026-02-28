import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { getRosterByTeamId, type RosterEntry } from '../api/rosterApi'
import { getAllTeams } from '../api/teamsApi'
import { getAllPlayers } from '../api/playersApi'
import { DataTable, type Column } from '../components/DataTable'
import { LoadingSpinner } from '../components/LoadingSpinner'
import { ErrorMessage } from '../components/ErrorMessage'

export function RosterPage() {
  const navigate = useNavigate()
  const [teamId, setTeamId] = useState<string>('')

  const { data: teams = [] } = useQuery({ queryKey: ['teams'], queryFn: () => getAllTeams({ limit: 500 }) })
  const { data: roster = [], isLoading, error, refetch } = useQuery({
    queryKey: ['roster', teamId],
    queryFn: () => getRosterByTeamId(Number(teamId)),
    enabled: !!teamId,
  })
  const { data: players = [] } = useQuery({ queryKey: ['players'], queryFn: () => getAllPlayers({ limit: 500 }) })

  const columns: Column<RosterEntry>[] = [
    { key: 'id', header: 'ID', render: (r) => r.id, sortKey: (r) => r.id },
    { key: 'player_id', header: 'Player', render: (r) => players.find((p) => p.id === r.player_id)?.name ?? r.player_id },
    { key: 'start_date', header: 'Start', render: (r) => r.start_date.slice(0, 10), sortKey: (r) => r.start_date },
    { key: 'end_date', header: 'End', render: (r) => r.end_date ? r.end_date.slice(0, 10) : '—' },
    { key: 'role_at_team', header: 'Role at team', render: (r) => r.role_at_team ?? '—' },
  ]

  if (!teamId) {
    return (
      <div>
        <h1 className="mb-6 text-2xl font-bold text-primary">Roster</h1>
        <p className="mb-4 text-text-muted">Select a team to view roster entries.</p>
        <select
          value={teamId}
          onChange={(e) => setTeamId(e.target.value)}
          className="rounded-lg border border-slate-600 bg-secondary px-3 py-2 text-primary focus:border-accent focus:outline-none"
          aria-label="Select team"
        >
          <option value="">— Select team —</option>
          {teams.map((t) => (
            <option key={t.id} value={String(t.id)}>{t.name}</option>
          ))}
        </select>
      </div>
    )
  }

  if (isLoading) return <LoadingSpinner label="Loading roster…" />
  if (error) return <ErrorMessage message={error instanceof Error ? error.message : 'Failed to load roster'} onRetry={refetch} />

  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold text-primary">Roster</h1>
      <div className="mb-4 flex flex-wrap items-center gap-3">
        <label htmlFor="roster-team" className="text-text-muted">Team</label>
        <select
          id="roster-team"
          value={teamId}
          onChange={(e) => setTeamId(e.target.value)}
          className="rounded-lg border border-slate-600 bg-secondary px-3 py-2 text-primary focus:border-accent focus:outline-none"
          aria-label="Select team"
        >
          <option value="">— Select team —</option>
          {teams.map((t) => (
            <option key={t.id} value={String(t.id)}>{t.name}</option>
          ))}
        </select>
      </div>
      <DataTable
        columns={columns}
        rows={roster}
        keyField="id"
        onRowClick={(row) => navigate(`/roster/${row.id}`)}
        emptyMessage="No roster entries for this team."
      />
    </div>
  )
}
