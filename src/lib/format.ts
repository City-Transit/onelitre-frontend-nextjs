/**
 * Pinned to a fixed locale (matches the backend's PDF/email formatting) rather than the
 * environment default — otherwise server-rendered markup and the browser's own locale can
 * disagree and React throws a hydration mismatch.
 */
export function formatDate(iso: string | Date): string {
  return new Date(iso).toLocaleDateString('en-GB');
}

export function formatDateTime(iso: string | Date): string {
  return new Date(iso).toLocaleString('en-GB');
}
