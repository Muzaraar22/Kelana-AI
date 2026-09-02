import "server-only";
import { cookies } from "next/headers";
import { AUTH_COOKIE } from "./authConstants";
import type { AuthUser } from "./api";

const BACKEND_URL = process.env.BACKEND_URL ?? "http://localhost:8000";

/**
 * Server-side session read. Validates the httpOnly cookie against the backend
 * (`/api/v1/auth/me`) and returns the user, or null. Uncached (`no-store`) so
 * every navigation reflects the current cookie.
 */
export async function getSession(): Promise<AuthUser | null> {
  const token = (await cookies()).get(AUTH_COOKIE)?.value;
  if (!token) return null;

  try {
    const res = await fetch(`${BACKEND_URL}/api/v1/auth/me`, {
      headers: { Cookie: `${AUTH_COOKIE}=${token}` },
      cache: "no-store",
    });
    return res.ok ? ((await res.json()) as AuthUser) : null;
  } catch {
    return null;
  }
}
