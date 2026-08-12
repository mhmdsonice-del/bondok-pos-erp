// API Client — connects to Bondok backend
const BASE = import.meta.env.VITE_API_BASE_URL || 'https://bondok-api.vercel.app/api/v1';

function getToken(): string | null { return localStorage.getItem('bondok_token'); }

export async function api<T = any>(path: string, opts: RequestInit = {}): Promise<T> {
  const token = getToken();
  const headers: Record<string, string> = { 'Content-Type': 'application/json', ...(opts.headers as Record<string, string> || {}) };
  if (token) headers['Authorization'] = `Bearer ${token}`;
  const res = await fetch(`${BASE}${path}`, { ...opts, headers });
  if (!res.ok) { const err = await res.json().catch(() => ({ message: res.statusText })); throw new Error(err.message || err.error || 'Request failed'); }
  return res.json();
}

export async function login(username: string, password: string) {
  const data = await api<any>('/auth/login', { method: 'POST', body: JSON.stringify({ username, password }) });
  if (data.accessToken) localStorage.setItem('bondok_token', data.accessToken);
  return data;
}

export function logout() { localStorage.removeItem('bondok_token'); }
export function isAuthed() { return !!getToken(); }
