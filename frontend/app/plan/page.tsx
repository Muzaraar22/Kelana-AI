import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getSession } from "../lib/session";
import { DEFAULT_CURRENCIES } from "../lib/currencies";
import TripPlanner from "../components/trip-planner/TripPlanner";

const BACKEND_URL = process.env.BACKEND_URL ?? "http://localhost:8000";

export const metadata: Metadata = {
  title: "Rencanakan Trip - KelanaAI",
  description: "Tentukan destinasi lewat peta, atur budget dan gaya perjalananmu.",
};

async function getCurrencies(): Promise<string[]> {
  try {
    const res = await fetch(`${BACKEND_URL}/api/v1/currencies`, { next: { revalidate: 86400 } });
    if (!res.ok) return [...DEFAULT_CURRENCIES];
    const data = (await res.json()) as { currencies?: string[] };
    return data.currencies?.length ? data.currencies : [...DEFAULT_CURRENCIES];
  } catch {
    return [...DEFAULT_CURRENCIES];
  }
}

export default async function PlanPage() {
  const user = await getSession();
  if (!user) redirect("/login?next=/plan");

  const currencies = await getCurrencies();

  return (
    <div className="mx-auto w-full max-w-6xl px-6 py-10 sm:py-12">
      {/* React 19 hoists this into <head> and de-dupes it. Loading Leaflet's CSS
          as an external stylesheet bypasses Turbopack's CSS parser, which rejects
          leaflet.css's legacy IE `progid` filter. */}
      <link
        rel="stylesheet"
        href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css"
        precedence="default"
      />

      <header className="mb-6">
        <h1 className="font-display text-2xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-50 sm:text-3xl">
          Rencanakan Trip
        </h1>
        <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
          Halo {user.name.trim().split(/\s+/).slice(0, 2).join(" ")}, pilih titik di peta atau cari
          destinasi, lalu atur budget dan gaya perjalananmu.
        </p>
      </header>

      <TripPlanner currencies={currencies} />
    </div>
  );
}
