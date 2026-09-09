// Reads a JWT's payload WITHOUT verifying its signature. Server-side only, and
// for optimistic checks only — cookie lifetime and proxy routing. The backend
// (`get_current_user`) and `getSession()` are the real auth gate: a forged or
// tampered token still 401s on every data call.

type JwtPayload = { exp?: number; sub?: string };

export function decodeJwt(token: string): JwtPayload | null {
  try {
    const segment = token.split(".")[1];
    if (!segment) return null;
    return JSON.parse(Buffer.from(segment, "base64url").toString()) as JwtPayload;
  } catch {
    return null;
  }
}

/** true only if the token exists and its `exp` claim is still in the future. */
export function isJwtLive(token: string | undefined | null): boolean {
  if (!token) return false;
  const payload = decodeJwt(token);
  return typeof payload?.exp === "number" && payload.exp * 1000 > Date.now();
}

/** seconds until the token's `exp`, or `fallback` if it can't be read / is past. */
export function jwtSecondsLeft(token: string, fallback: number): number {
  const payload = decodeJwt(token);
  if (typeof payload?.exp !== "number") return fallback;
  const secs = Math.floor(payload.exp - Date.now() / 1000);
  return secs > 0 ? secs : fallback;
}
