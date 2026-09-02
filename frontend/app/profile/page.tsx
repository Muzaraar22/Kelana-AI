import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import { getSession } from "../lib/session";
import { AUTH_COOKIE } from "../lib/authConstants";
import Card from "../components/shared/Card";
import LogoutButton from "../components/auth/LogoutButton";

const BACKEND_URL = process.env.BACKEND_URL ?? "http://localhost:8000";

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" });
}

async function getTripCount(): Promise<number | null> {
  const token = (await cookies()).get(AUTH_COOKIE)?.value;
  if (!token) return null;
  try {
    const res = await fetch(`${BACKEND_URL}/api/v1/trips`, {
      headers: { Cookie: `${AUTH_COOKIE}=${token}` },
      cache: "no-store",
    });
    if (!res.ok) return null;
    const trips = (await res.json()) as unknown[];
    return Array.isArray(trips) ? trips.length : null;
  } catch {
    return null;
  }
}

export default async function ProfilePage() {
  const user = await getSession();
  if (!user) redirect("/login?next=/profile");

  const tripCount = await getTripCount();

  return (
    <div className="mx-auto w-full max-w-3xl px-6 py-12">
      <h1 className="font-display text-2xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-50 sm:text-3xl">
        Profil
      </h1>
      <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">Detail akun KelanaAI kamu.</p>

      <Card className="mt-6 p-6 shadow-sm">
        <dl className="grid grid-cols-1 gap-5 sm:grid-cols-2">
          <div>
            <dt className="text-xs text-zinc-500 dark:text-zinc-400">Nama</dt>
            <dd className="mt-0.5 text-sm font-semibold text-zinc-900 dark:text-zinc-50">{user.name}</dd>
          </div>
          <div>
            <dt className="text-xs text-zinc-500 dark:text-zinc-400">Email</dt>
            <dd className="mt-0.5 text-sm font-semibold text-zinc-900 dark:text-zinc-50">{user.email}</dd>
          </div>
          <div>
            <dt className="text-xs text-zinc-500 dark:text-zinc-400">Anggota sejak</dt>
            <dd className="mt-0.5 text-sm font-semibold text-zinc-900 dark:text-zinc-50">
              {formatDate(user.created_at)}
            </dd>
          </div>
          <div>
            <dt className="text-xs text-zinc-500 dark:text-zinc-400">Jumlah trip</dt>
            <dd className="mt-0.5 text-sm font-semibold text-zinc-900 dark:text-zinc-50">
              {tripCount ?? "—"}
            </dd>
          </div>
        </dl>

        <div className="mt-6 border-t border-zinc-100 pt-5 dark:border-zinc-800">
          <LogoutButton className="rounded-lg border border-red-200 px-3 py-1.5 text-red-600 hover:bg-red-50 dark:border-red-500/30 dark:text-red-400 dark:hover:bg-red-500/10" />
        </div>
      </Card>
    </div>
  );
}
