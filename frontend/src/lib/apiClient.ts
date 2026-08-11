import { useAuthStore } from "@/store/authStore";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? "http://localhost:4000/api/v1";

export class ApiError extends Error { status: number; constructor(message: string, status: number) { super(message); this.status = status; } }

let refreshPromise: Promise<string> | null = null;

async function refreshAccessToken(): Promise<string> {
  if (refreshPromise) return refreshPromise;
  refreshPromise = (async () => {
    const { refreshToken, setAccessToken, logout } = useAuthStore.getState();
    if (!refreshToken) { logout(); throw new ApiError("No refresh token", 401); }
    const res = await fetch(`${API_BASE_URL}/auth/refresh`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ refreshToken }) });
    if (!res.ok) { logout(); throw new ApiError("Session expired", 401); }
    const data = await res.json(); setAccessToken(data.accessToken); return data.accessToken as string;
  })().finally(() => { refreshPromise = null; });
  return refreshPromise;
}

interface RequestOptions { method?: "GET"|"POST"|"PATCH"|"PUT"|"DELETE"; body?: unknown; params?: Record<string, string|number|boolean|undefined>; skipBranchHeader?: boolean }

export async function apiRequest<T>(path: string, options: RequestOptions = {}, isRetry = false): Promise<T> {
  const { accessToken, activeBranchId } = useAuthStore.getState();
  const url = new URL(`${API_BASE_URL}${path}`);
  if (options.params) Object.entries(options.params).forEach(([k, v]) => { if (v !== undefined) url.searchParams.set(k, String(v)); });
  const headers: Record<string, string> = accessToken ? { "Content-Type": "application/json", "Authorization": `Bearer ${accessToken}` } : { "Content-Type": "application/json" };
  if (!options.skipBranchHeader && activeBranchId) headers["X-Active-Branch"] = activeBranchId;
  const res = await fetch(url.toString(), { method: options.method ?? "GET", headers, body: options.body ? JSON.stringify(options.body) : undefined });
  if (res.status === 401 && !isRetry && accessToken) { try { await refreshAccessToken(); return apiRequest<T>(path, options, true); } catch { throw new ApiError("Unauthorized", 401); } }
  if (!res.ok) { const errorBody = await res.json().catch(() => ({ error: res.statusText })); throw new ApiError(errorBody.error ?? "Request failed", res.status); }
  if (res.status === 204) return undefined as T;
  return res.json();
}
