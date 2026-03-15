import { apiClient } from './apiClient'

export interface MatchStat {
  id: number
  match_id: number
  team_id: number
  gold_diff_15: number | null
  kills: number | null
  deaths: number | null
  assists: number | null
  towers_taken: number | null
  dragons_taken: number | null
  barons_taken: number | null
  first_blood: boolean | null
  win: boolean
}

export interface MatchStatCreateInput {
  match_id: number
  team_id: number
  gold_diff_15?: number | null
  kills?: number | null
  deaths?: number | null
  assists?: number | null
  towers_taken?: number | null
  dragons_taken?: number | null
  barons_taken?: number | null
  first_blood?: boolean | null
  win: boolean
}

export interface MatchStatUpdateInput extends Partial<MatchStatCreateInput> {}

/** GET match stats for a match (subset by match). */
export const getMatchStatsByMatchId = (matchId: number) =>
  apiClient.get<MatchStat[]>(`/match_stats/match/${matchId}`).then((r) => r.data)

/** GET single match stat by id */
export const getMatchStatById = (id: number) =>
  apiClient.get<MatchStat>(`/match_stats/${id}`).then((r) => r.data)

/** CREATE match stat */
export const createMatchStat = (data: MatchStatCreateInput) =>
  apiClient.post<MatchStat>('/match_stats', data).then((r) => r.data)

/** UPDATE match stat */
export const updateMatchStat = (id: number, data: MatchStatUpdateInput) =>
  apiClient.put<MatchStat>(`/match_stats/${id}`, data).then((r) => r.data)

/** DELETE match stat */
export const deleteMatchStat = (id: number) =>
  apiClient.delete<void>(`/match_stats/${id}`).then((r) => r.data)

