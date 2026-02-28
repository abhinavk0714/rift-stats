import { apiClient } from './apiClient';

export interface Team {
  id: number;
  name: string;
  short_name: string | null;
  region: string;
}

/** GET all teams. Backend supports ?limit= */
export const getAllTeams = (params?: { limit?: number }) =>
  apiClient.get<Team[]>('/teams', { params }).then((r) => r.data);

/** GET single team by id */
export const getTeamById = (id: number) =>
  apiClient.get<Team>(`/teams/${id}`).then((r) => r.data);
