import { apiClient } from './apiClient'

export interface RosterEntry {
  id: number
  team_id: number
  player_id: number
  start_date: string
  end_date: string | null
  role_at_team: string | null
}

export interface RosterCreateInput {
  team_id: number
  player_id: number
  start_date: string
  end_date?: string | null
  role_at_team?: string | null
}

export interface RosterUpdateInput {
  end_date?: string | null
  role_at_team?: string | null
}

/** GET roster entries for a team (subset by team). */
export const getRosterByTeamId = (teamId: number) =>
  apiClient.get<RosterEntry[]>(`/roster/team/${teamId}`).then((r) => r.data)

/** GET single roster entry by id */
export const getRosterEntryById = (id: number) =>
  apiClient.get<RosterEntry>(`/roster/${id}`).then((r) => r.data)

/** CREATE roster entry */
export const createRosterEntry = (data: RosterCreateInput) =>
  apiClient.post<RosterEntry>('/roster', data).then((r) => r.data)

/** UPDATE roster entry */
export const updateRosterEntry = (id: number, data: RosterUpdateInput) =>
  apiClient.put<RosterEntry>(`/roster/${id}`, data).then((r) => r.data)

/** DELETE roster entry */
export const deleteRosterEntry = (id: number) =>
  apiClient.delete<void>(`/roster/${id}`).then((r) => r.data)

