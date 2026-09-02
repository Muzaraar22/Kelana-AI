import { cookies } from "next/headers";
import { AUTH_COOKIE } from "../../../lib/authConstants";

export async function POST() {
  (await cookies()).delete(AUTH_COOKIE);
  return new Response(null, { status: 204 });
}
