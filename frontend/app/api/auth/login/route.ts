import { cookies } from "next/headers";
import { AUTH_COOKIE, AUTH_COOKIE_MAX_AGE } from "../../../lib/authConstants";

const BACKEND_URL = process.env.BACKEND_URL ?? "http://localhost:8000";

export async function POST(request: Request) {
  const body = await request.text();

  const res = await fetch(`${BACKEND_URL}/api/v1/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body,
    cache: "no-store",
  });

  const data = await res.json().catch(() => ({}));

  if (!res.ok) {
    const detail =
      [400, 401, 409, 422].includes(res.status) && typeof data?.detail === "string"
        ? data.detail
        : "Gagal masuk. Coba lagi nanti.";
    return Response.json({ detail }, { status: res.status });
  }

  (await cookies()).set(AUTH_COOKIE, data.access_token, {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    maxAge: AUTH_COOKIE_MAX_AGE,
  });

  return Response.json(data.user, { status: 200 });
}
