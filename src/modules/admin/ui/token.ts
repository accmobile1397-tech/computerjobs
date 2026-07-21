/** Client-side access token storage for Admin UI (Bearer to Admin APIs). */
const STORAGE_KEY = "cj_access_token";

export function getAdminAccessToken(): string | null {
  if (typeof window === "undefined") return null;
  return window.localStorage.getItem(STORAGE_KEY);
}

export function setAdminAccessToken(token: string): void {
  window.localStorage.setItem(STORAGE_KEY, token.trim());
}

export function clearAdminAccessToken(): void {
  window.localStorage.removeItem(STORAGE_KEY);
}
