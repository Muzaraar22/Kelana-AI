"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { deleteTrip, listTrips, type Trip } from "../lib/api";
import TripCard from "../components/trips/TripCard";
import Button from "../components/shared/Button";
import ErrorBanner from "../components/shared/ErrorBanner";

type State =
  | { status: "loading" }
  | { status: "error"; message: string }
  | { status: "loaded"; trips: Trip[] };

export default function TripsPage() {
  const [state, setState] = useState<State>({ status: "loading" });
  const [deletingId, setDeletingId] = useState<number | null>(null);

  useEffect(() => {
    listTrips()
      .then((trips) => setState({ status: "loaded", trips }))
      .catch(() =>
        setState({
          status: "error",
          message: "Gagal memuat daftar trip. Pastikan backend berjalan, lalu muat ulang halaman.",
        })
      );
  }, []);

  async function handleDelete(id: number) {
    if (!confirm("Hapus trip ini?")) return;

    setDeletingId(id);
    try {
      await deleteTrip(id);
      setState((prev) =>
        prev.status === "loaded" ? { status: "loaded", trips: prev.trips.filter((t) => t.id !== id) } : prev
      );
    } catch {
      alert("Gagal menghapus trip. Coba lagi.");
    } finally {
      setDeletingId(null);
    }
  }

  return (
    <div className="mx-auto w-full max-w-6xl px-6 py-12">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-50 sm:text-3xl">
            Trip Saya
          </h1>
          <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
            Semua rencana trip yang pernah kamu buat dengan KelanaAI.
          </p>
        </div>
        <Button href="/#destinasi" pill>
          + Rencanakan Trip Baru
        </Button>
      </div>

      {state.status === "loading" && (
        <p className="mt-10 text-sm text-zinc-500 dark:text-zinc-400">Memuat daftar trip...</p>
      )}

      {state.status === "error" && <ErrorBanner>{state.message}</ErrorBanner>}

      {state.status === "loaded" && state.trips.length === 0 && (
        <div className="mt-10 rounded-2xl border border-dashed border-zinc-300 p-10 text-center text-sm text-zinc-500 dark:border-zinc-700 dark:text-zinc-400">
          Belum ada trip yang dibuat.{" "}
          <Link href="/#destinasi" className="font-medium text-emerald-600 hover:underline dark:text-emerald-400">
            Rencanakan trip pertamamu
          </Link>
          .
        </div>
      )}

      {state.status === "loaded" && state.trips.length > 0 && (
        <div className="mt-8 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {state.trips.map((trip) => (
            <TripCard key={trip.id} trip={trip} onDelete={handleDelete} isDeleting={deletingId === trip.id} />
          ))}
        </div>
      )}
    </div>
  );
}
