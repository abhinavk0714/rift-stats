import { apiClient } from './apiClient'

export interface Team {
  id: number
  name: string
  short_name: string | null
  region: string
}

export interface TeamCreateInput {
  name: string
  short_name?: string | null
  region?: string
}

export interface TeamUpdateInput {
  name?: string | null
  short_name?: string | null
  region?: string | null
}

/** GET all teams. Backend supports ?limit= */
export const getAllTeams = (params?: { limit?: number }) =>
  apiClient.get<Team[]>('/teams', { params }).then((r) => r.data)

/** GET single team by id */
export const getTeamById = (id: number) =>
  apiClient.get<Team>(`/teams/${id}`).then((r) => r.data)

/** CREATE team */
export const createTeam = (data: TeamCreateInput) =>
  apiClient.post<Team>('/teams', data).then((r) => r.data)

/** UPDATE team */
export const updateTeam = (id: number, data: TeamUpdateInput) =>
  apiClient.put<Team>(`/teams/${id}`, data).then((r) => r.data)

/** DELETE team */
export const deleteTeam = (id: number) =>
  apiClient.delete<void>(`/teams/${id}`).then((r) => r.data)

