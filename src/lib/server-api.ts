import { cookies } from 'next/headers';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001';

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
