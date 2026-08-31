"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { deleteTrip, getTrip, regenerateRecommendation, updateTripBudget, type Trip } from "../../lib/api";
import { getCategoryTheme } from "../../lib/categoryTheme";
import TripResult from "../../components/trip-planner/TripResult";
import Card from "../../components/shared/Card";
import Button from "../../components/shared/Button";
import ErrorBanner from "../../components/shared/ErrorBanner";
import BackLink from "../../components/shared/BackLink";
import Icon from "../../components/shared/Icon";

type State =
  | { status: "loading" }
  | { status: "error"; message: string }
  | { status: "loaded"; trip: Trip };

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" });
}

export default function TripDetailPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const tripId = Number(params.id);

  const [state, setState] = useState<State>({ status: "loading" });
  const [budgetInput, setBudgetInput] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [isRegenerating, setIsRegenerating] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    getTrip(tripId)
      .then((trip) => {
        setState({ status: "loaded", trip });
        setBudgetInput(String(trip.budget));
      })
      .catch(() =>
        setState({ status: "error", message: "Trip tidak ditemukan atau gagal dimuat." })
      );
  }, [tripId]);

  async function handleUpdateBudget(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (state.status !== "loaded") return;

    const newBudget = Number(budgetInput);
    if (!newBudget || newBudget <= 0) return;

    // check nilai sama tidak hit api
    if (newBudget === state.trip.budget) return;

    setIsSaving(true);
    try {
      const updatedTrip = await updateTripBudget(tripId, newBudget);
      setState({ status: "loaded", trip: updatedTrip });
      setIsSaving(false);

      // budget berubah -> generate ulang ai_recommendation
      setIsRegenerating(true);
      const { ai_recommendation } = await regenerateRecommendation(tripId);
      setState({ status: "loaded", trip: { ...updatedTrip, ai_recommendation } });
    } catch {
      alert("Gagal memperbarui budget. Coba lagi.");
    } finally {
      setIsSaving(false);
      setIsRegenerating(false);
    }
  }

  async function handleDelete() {
    if (!confirm("Hapus trip ini? Tindakan ini tidak bisa dibatalkan.")) return;

    setIsDeleting(true);
    try {
      await deleteTrip(tripId);
      router.push("/trips");
    } catch {
      alert("Gagal menghapus trip. Coba lagi.");
      setIsDeleting(false);
    }
  }

  if (state.status === "loading") {
    return (
      <div className="mx-auto w-full max-w-3xl px-6 py-12">
        <p className="text-sm text-zinc-500 dark:text-zinc-400">Memuat detail trip...</p>
      </div>
    );
  }

  if (state.status === "error") {
    return (
      <div className="mx-auto w-full max-w-3xl px-6 py-12">
        <BackLink href="/trips">Kembali ke Trip Saya</BackLink>
        <div className="mt-6">
          <ErrorBanner>{state.message}</ErrorBanner>
        </div>
      </div>
    );
  }

  const { trip } = state;
  const theme = getCategoryTheme(trip.category);

  return (
    <div className="flex flex-1 flex-col">
      <div className={`bg-gradient-to-br ${theme.gradient} px-6 py-10 text-white sm:py-14`}>
        <div className="mx-auto w-full max-w-3xl">
          <BackLink href="/trips" onDark>
            Kembali ke Trip Saya
          </BackLink>

          <div className="mt-4 flex flex-wrap items-end justify-between gap-4">
            <div>
              <p className="text-sm text-white/60">Rencana trip ke</p>
              <h1 className="font-display text-3xl font-semibold tracking-tight sm:text-4xl">{trip.destination}</h1>
              <p className="mt-1 text-sm text-white/60">Dibuat {formatDate(trip.created_at)}</p>
            </div>
            <span className={`inline-flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-sm font-medium backdrop-blur ${theme.heroBadge}`}>
              <Icon name={theme.iconName} className="h-4 w-4" />
              {trip.category}
            </span>
          </div>
        </div>
      </div>

      <div className="mx-auto -mt-6 w-full max-w-3xl px-6 pb-16">
        <div className="flex flex-col gap-5">
          <TripResult trip={trip} isRegeneratingItinerary={isRegenerating} />

          <Card className="p-5 shadow-sm">
            <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-50">Ubah Budget</h3>
            <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">
              Kategori, budget harian, dan transportasi akan dihitung ulang otomatis.
            </p>
            <form onSubmit={handleUpdateBudget} className="mt-3 flex flex-col gap-2 sm:flex-row">
              <input
                type="number"
                min={0}
                value={budgetInput}
                onChange={(e) => setBudgetInput(e.target.value)}
                className="flex-1 rounded-lg border border-zinc-200 bg-zinc-50 px-3 py-2 text-sm text-zinc-900 outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-50"
              />
              <Button type="submit" variant="secondary" disabled={isSaving || isRegenerating}>
                {isRegenerating ? "Menyusun ulang..." : isSaving ? "Menyimpan..." : "Simpan"}
              </Button>
            </form>
          </Card>

          <Button variant="danger" onClick={handleDelete} disabled={isDeleting} className="self-start">
            {isDeleting ? "Menghapus..." : "Hapus Trip Ini"}
          </Button>
        </div>
      </div>
    </div>
  );
}
