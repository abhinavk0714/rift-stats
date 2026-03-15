import { apiClient } from './apiClient'

export interface Player {
  id: number
  name: string
  gamer_tag: string
  nationality: string | null
  role: string | null
  age: number | null
}

export interface PlayerCreateInput {
  name: string
  gamer_tag: string
  nationality?: string | null
  role?: string | null
  age?: number | null
}

export interface PlayerUpdateInput {
  name?: string | null
  gamer_tag?: string | null
  nationality?: string | null
  role?: string | null
  age?: number | null
}

/** GET all players. Backend supports ?limit=. TODO: server-side filter by role/team when backend supports it. */
export const getAllPlayers = (params?: { limit?: number }) =>
  apiClient.get<Player[]>('/players', { params }).then((r) => r.data)

/** GET single player by id */
export const getPlayerById = (id: number) =>
  apiClient.get<Player>(`/players/${id}`).then((r) => r.data)

/** CREATE player */
export const createPlayer = (data: PlayerCreateInput) =>
  apiClient.post<Player>('/players', data).then((r) => r.data)

/** UPDATE player */
export const updatePlayer = (id: number, data: PlayerUpdateInput) =>
  apiClient.put<Player>(`/players/${id}`, data).then((r) => r.data)

/** DELETE player */
export const deletePlayer = (id: number) =>
  apiClient.delete<void>(`/players/${id}`).then((r) => r.data)

