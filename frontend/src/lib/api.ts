const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

export interface ApiError { code: string; message: string; status: number; }

export async function apiRequest<T>(path: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${API_URL}${path}`, {
    ...options,
    credentials: 'include',
    headers: { 'Content-Type': 'application/json', ...options?.headers },
  });
  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    const err = data.error || data.detail?.error || { code: 'UNKNOWN', message: res.statusText };
    throw { ...err, status: res.status } as ApiError;
  }
  if (res.status === 204) return {} as T;
  return res.json();
}
