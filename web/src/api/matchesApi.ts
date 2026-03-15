import { apiClient } from './apiClient'

export interface Match {
  id: number
  series_id: number | null
  region: string
  season: string | null
  match_date: string
  team_a_id: number
  team_b_id: number
  best_of: number
  game_number: number
  winner_team_id: number | null
  patch: string | null
  notes: string | null
}

export interface MatchCreateInput {
  team_a_id: number
  team_b_id: number
  match_date: string
  series_id?: number | null
  region?: string
  season?: string | null
  best_of?: number
  game_number?: number
  winner_team_id?: number | null
  patch?: string | null
  notes?: string | null
}

export interface MatchUpdateInput {
  series_id?: number | null
  region?: string | null
  season?: string | null
  match_date?: string
  best_of?: number
  game_number?: number
  winner_team_id?: number | null
  patch?: string | null
  notes?: string | null
}

/** GET all matches. Backend supports ?limit=. TODO: server-side filter by date/team when backend supports it. */
export const getAllMatches = (params?: { limit?: number }) =>
  apiClient.get<Match[]>('/matches', { params }).then((r) => r.data)

/** GET single match by id */
export const getMatchById = (id: number) =>
  apiClient.get<Match>(`/matches/${id}`).then((r) => r.data)

/** CREATE match */
export const createMatch = (data: MatchCreateInput) =>
  apiClient.post<Match>('/matches', data).then((r) => r.data)

/** UPDATE match */
export const updateMatch = (id: number, data: MatchUpdateInput) =>
  apiClient.put<Match>(`/matches/${id}`, data).then((r) => r.data)

/** DELETE match */
export const deleteMatch = (id: number) =>
  apiClient.delete<void>(`/matches/${id}`).then((r) => r.data)

