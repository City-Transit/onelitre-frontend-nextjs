import { API_BASE_URL } from './api-base-url';
import { getAccessToken, getRefreshToken, setSessionTokens, clearSessionTokens } from './session';

export class ApiError extends Error {
  constructor(
    message: string,
    public status: number,
  ) {
    super(message);
  }
}

const NO_REFRESH_PATHS = new Set([
  '/auth/login',
  '/auth/register',
  '/auth/refresh',
  '/auth/forgot-password',
  '/auth/reset-password',
  '/auth/verify-phone',
  '/auth/resend-verification',
]);

// Coalesces concurrent 401s into a single refresh call rather than firing one per request.
let refreshPromise: Promise<boolean> | null = null;

async function refreshAccessToken(): Promise<boolean> {
  const refreshToken = getRefreshToken();
  if (!refreshToken) return false;

  try {
    const res = await fetch(`${API_BASE_URL}/auth/refresh`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refreshToken }),
    });
    if (!res.ok) {
      clearSessionTokens();
      return false;
    }
    const data = await res.json();
    setSessionTokens(data.accessToken, data.refreshToken);
    return true;
  } catch {
    return false;
  }
}

function request(path: string, options: RequestInit) {
  const accessToken = getAccessToken();
  return fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
      ...options.headers,
    },
  });
}

/** Client-side fetch wrapper — attaches the access token as a Bearer header (see lib/session.ts
 * for why: the API lives on a different domain, so a browser cookie can't reach it). Silently
 * refreshes and retries once on a 401 before giving up. */
export async function apiFetch(path: string, options: RequestInit = {}) {
  let res = await request(path, options);

  if (res.status === 401 && !NO_REFRESH_PATHS.has(path)) {
    if (!refreshPromise) {
      refreshPromise = refreshAccessToken().finally(() => {
        refreshPromise = null;
      });
    }
    if (await refreshPromise) {
      res = await request(path, options);
    }
  }

  if (!res.ok) {
    const body = await res.json().catch(() => null);
    throw new ApiError(body?.message ?? res.statusText, res.status);
  }

  // A 2xx response can legitimately have an empty body (e.g. a controller returning `null`) —
  // res.json() throws a SyntaxError on empty input, so parse manually and treat empty as null.
  const text = await res.text();
  return text ? JSON.parse(text) : null;
}
