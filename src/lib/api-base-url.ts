/** Stripped of any trailing slash so `${API_BASE_URL}${path}` never produces a double slash
 * when NEXT_PUBLIC_API_URL is set with one (e.g. on Vercel). */
export const API_BASE_URL = (
  process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001'
).replace(/\/+$/, '');
