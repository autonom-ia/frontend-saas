export type StoredUserData = {
  user?: {
    id?: string;
    email?: string;
    name?: string;
    phone?: string;
    isFirstLogin?: boolean;
    isAdmin?: boolean;
    [key: string]: unknown;
  };
  email?: string;
  AccessToken?: string;
  IdToken?: string;
  RefreshToken?: string;
  token?: string;
  isAuthenticated?: boolean;
  loginAt?: number;
  refreshedAt?: number;
};

const STORAGE_KEY = 'userData';

export function getStoredUser(): StoredUserData | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as StoredUserData;
  } catch {
    return null;
  }
}

export function setStoredUser(data: StoredUserData | null): void {
  if (typeof window === 'undefined') return;
  try {
    if (data) localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    else localStorage.removeItem(STORAGE_KEY);
  } catch {}
}

export function getBearer(data: StoredUserData | null): string | undefined {
  if (!data) return undefined;
  return data.IdToken || data.token || data.AccessToken;
}

export function shouldRefresh(data: StoredUserData | null, nowMs: number, intervalMs: number): boolean {
  if (!data?.RefreshToken) return false;
  const last = data.refreshedAt || data.loginAt || 0;
  if (!last) return true;
  return nowMs - last >= intervalMs;
}

export async function refreshTokens(apiBaseUrl: string, refreshToken: string): Promise<Partial<StoredUserData>> {
  const res = await fetch(`${apiBaseUrl}/refresh`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ RefreshToken: refreshToken })
  });
  if (!res.ok) throw new Error(String(res.status));
  const j = await res.json();
  return {
    AccessToken: j?.AccessToken,
    IdToken: j?.IdToken,
    RefreshToken: j?.RefreshToken || refreshToken,
    token: j?.IdToken || j?.AccessToken || j?.token,
  };
}
