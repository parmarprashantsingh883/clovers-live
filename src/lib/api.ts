import axios from "axios";

/**
 * Shared API client — the ONLY place the backend origin lives.
 * Dev: '/api' via the Vite proxy (same-origin, cookie-friendly).
 * Split deploys set VITE_API_URL=https://api.example.com/api.
 * Injects the in-memory access token and transparently refreshes on 401
 * (single-flight) using the httpOnly refresh cookie.
 */
export const API_BASE =
  (import.meta as any).env?.VITE_API_URL || "/api";

let accessToken: string | null = null;
let onSessionExpired: () => void = () => {};

export const setAccessToken = (t: string | null) => { accessToken = t; };
export const setSessionExpiredHandler = (fn: () => void) => { onSessionExpired = fn; };

export const api = axios.create({ baseURL: API_BASE, withCredentials: true });

api.interceptors.request.use((config) => {
  if (accessToken) config.headers.Authorization = `Bearer ${accessToken}`;
  return config;
});

let refreshing: Promise<string | null> | null = null;

api.interceptors.response.use(
  (res) => res,
  async (error) => {
    const original = error.config;
    if (error.response?.status === 401 && !original._retry && !original.url?.includes("/auth/")) {
      original._retry = true;
      try {
        refreshing ||= axios
          .post(`${API_BASE}/auth/refresh`, null, { withCredentials: true })
          .then((r) => {
            const t = r.data?.data?.accessToken || null;
            setAccessToken(t);
            return t;
          })
          .finally(() => { refreshing = null; });
        const token = await refreshing;
        if (token) {
          original.headers.Authorization = `Bearer ${token}`;
          return api(original);
        }
      } catch {
        onSessionExpired();
      }
    }
    return Promise.reject(error);
  },
);

/** Friendly message out of an axios error. */
export const errMsg = (e: any, fallback = "Something went wrong") =>
  e?.response?.data?.message || e?.message || fallback;
