import { apiClient } from './apiClient';

export interface MatchStat {
  id: number;
  match_id: number;
  team_id: number;
  gold_diff_15: number | null;
  kills: number | null;
  deaths: number | null;
  assists: number | null;
  towers_taken: number | null;
  dragons_taken: number | null;
  barons_taken: number | null;
  first_blood: boolean | null;
  win: boolean;
}

/** GET match stats for a match (subset by match). */
export const getMatchStatsByMatchId = (matchId: number) =>
  apiClient.get<MatchStat[]>(`/match_stats/match/${matchId}`).then((r) => r.data);

/** GET single match stat by id */
export const getMatchStatById = (id: number) =>
  apiClient.get<MatchStat>(`/match_stats/${id}`).then((r) => r.data);
