import axios from 'axios';

const baseURL = import.meta.env.VITE_API_BASE_URL ?? '/api';

/** Axios instance for Rift Stats API. In dev, use baseURL /api so Vite proxy forwards to backend (localhost:8000). */
export const apiClient = axios.create({
  baseURL,
  withCredentials: false,
  headers: { 'Content-Type': 'application/json' },
});
