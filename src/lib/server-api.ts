import { cookies } from 'next/headers';
import { API_BASE_URL } from './api-base-url';

/** Must match ACCESS_TOKEN_COOKIE in session.ts — kept as a separate literal rather than a
 * shared import because next/headers can't be pulled into client-component bundles. */
const ACCESS_TOKEN_COOKIE = 'session_access_token';

/** Server-component fetch wrapper — reads the access token cookie set by the client after
 * login and sends it as a Bearer header (see lib/session.ts for why: the API is on a different
 * domain, so it can't just forward the raw Cookie header the way a same-domain setup could).
 *
 * Note: this can't silently refresh an expired access token the way apiFetch (client-side) can
 * — a server component can't hand the browser a new cookie mid-render. In practice this rarely
 * matters, since any client-side activity on the page keeps the cookie refreshed within its
 * window; a user who's been server-navigating with no client activity for over an hour will hit
 * a 401 here and get redirected to log in again. */
export async function serverApiFetch(path: string, options: RequestInit = {}) {
  const cookieStore = await cookies();
  const accessToken = cookieStore.get(ACCESS_TOKEN_COOKIE)?.value;
  return fetch(`${API_BASE_URL}${path}`, {
    ...options,
    cache: 'no-store',
    headers: {
      'Content-Type': 'application/json',
      ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
      ...options.headers,
    },
  });
}
