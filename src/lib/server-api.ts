import { cookies } from 'next/headers';
import { API_BASE_URL } from './api-base-url';

/** Server-component fetch wrapper: forwards the incoming request's cookies to the backend. */
export async function serverApiFetch(path: string, options: RequestInit = {}) {
  const cookieStore = await cookies();
  return fetch(`${API_BASE_URL}${path}`, {
    ...options,
    cache: 'no-store',
    headers: {
      'Content-Type': 'application/json',
      Cookie: cookieStore.toString(),
      ...options.headers,
    },
  });
}
