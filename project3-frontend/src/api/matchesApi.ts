import { apiClient } from './apiClient';

export interface Match {
  id: number;
  series_id: number | null;
  region: string;
  season: string | null;
  match_date: string;
  team_a_id: number;
  team_b_id: number;
  best_of: number;
  game_number: number;
  winner_team_id: number | null;
  patch: string | null;
  notes: string | null;
}

/** GET all matches. Backend supports ?limit=. TODO: server-side filter by date/team when backend supports it. */
export const getAllMatches = (params?: { limit?: number }) =>
  apiClient.get<Match[]>('/matches', { params }).then((r) => r.data);

/** GET single match by id */
export const getMatchById = (id: number) =>
  apiClient.get<Match>(`/matches/${id}`).then((r) => r.data);
