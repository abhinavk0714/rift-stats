import { apiClient } from './apiClient';

export interface RosterEntry {
  id: number;
  team_id: number;
  player_id: number;
  start_date: string;
  end_date: string | null;
  role_at_team: string | null;
}

/** GET roster entries for a team (subset by team). */
export const getRosterByTeamId = (teamId: number) =>
  apiClient.get<RosterEntry[]>(`/roster/team/${teamId}`).then((r) => r.data);

/** GET single roster entry by id */
export const getRosterEntryById = (id: number) =>
  apiClient.get<RosterEntry>(`/roster/${id}`).then((r) => r.data);
