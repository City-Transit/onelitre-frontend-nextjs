'use client';

/** First-party cookies on the frontend's own domain — never sent to the API directly (it's a
 * different domain), just read back by our own code and attached as an `Authorization: Bearer`
 * header. Names must match the ones `serverApiFetch` reads server-side (see server-api.ts). */
const ACCESS_TOKEN_COOKIE = 'session_access_token';
const REFRESH_TOKEN_COOKIE = 'session_refresh_token';

const ACCESS_TOKEN_MAX_AGE_SECONDS = 60 * 60; // matches the backend's JWT_EXPIRES_IN default
const REFRESH_TOKEN_MAX_AGE_SECONDS = 60 * 60 * 24 * 30; // matches REFRESH_TOKEN_EXPIRES_IN_DAYS default

function readCookie(name: string): string | null {
  if (typeof document === 'undefined') return null;
  const match = document.cookie.match(new RegExp(`(?:^|; )${name}=([^;]*)`));
  return match ? decodeURIComponent(match[1]) : null;
}

function writeCookie(name: string, value: string, maxAgeSeconds: number) {
  const secure = typeof location !== 'undefined' && location.protocol === 'https:';
  document.cookie = `${name}=${encodeURIComponent(value)}; path=/; max-age=${maxAgeSeconds}; samesite=lax${secure ? '; secure' : ''}`;
}

function deleteCookie(name: string) {
  document.cookie = `${name}=; path=/; max-age=0`;
}

export function setSessionTokens(accessToken: string, refreshToken: string) {
  writeCookie(ACCESS_TOKEN_COOKIE, accessToken, ACCESS_TOKEN_MAX_AGE_SECONDS);
  writeCookie(REFRESH_TOKEN_COOKIE, refreshToken, REFRESH_TOKEN_MAX_AGE_SECONDS);
}

export function getAccessToken(): string | null {
  return readCookie(ACCESS_TOKEN_COOKIE);
}

export function getRefreshToken(): string | null {
  return readCookie(REFRESH_TOKEN_COOKIE);
}

export function clearSessionTokens() {
  deleteCookie(ACCESS_TOKEN_COOKIE);
  deleteCookie(REFRESH_TOKEN_COOKIE);
}
