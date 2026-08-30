"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { deleteTrip, listTrips, type Trip } from "../lib/api";
import { getTravelStyle } from "../lib/travelStyle";
import TripCard from "../components/trips/TripCard";
import Button from "../components/shared/Button";
import ErrorBanner from "../components/shared/ErrorBanner";
import Pagination from "../components/shared/Pagination";

type State =
  | { status: "loading" }
  | { status: "error"; message: string }
  | { status: "loaded"; trips: Trip[] };

// grid mobile cuma 1 kolom, desktop 3 kolom -> beda jumlah per halaman
const MOBILE_PAGE_SIZE = 4;
const DESKTOP_PAGE_SIZE = 9;
const MOBILE_BREAKPOINT = 640; // samain sama breakpoint `sm` tailwind

export default function TripsPage() {
  const [state, setState] = useState<State>({ status: "loading" });
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [pageSize, setPageSize] = useState(DESKTOP_PAGE_SIZE);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");

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

  useEffect(() => {
    function syncPageSize() {
      setPageSize(window.innerWidth < MOBILE_BREAKPOINT ? MOBILE_PAGE_SIZE : DESKTOP_PAGE_SIZE);
    }
    syncPageSize();
    window.addEventListener("resize", syncPageSize);
    return () => window.removeEventListener("resize", syncPageSize);
  }, []);

  const trips = state.status === "loaded" ? state.trips : [];
  const query = search.trim().toLowerCase();
  const filteredTrips = query
    ? trips.filter(
        (trip) =>
          trip.destination.toLowerCase().includes(query) ||
          getTravelStyle(trip.travel_style).toLowerCase().includes(query)
      )
    : trips;
  const totalPages = Math.max(1, Math.ceil(filteredTrips.length / pageSize));
  const currentPage = Math.min(page, totalPages);
  const pagedTrips = filteredTrips.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  function handleSearchChange(value: string) {
    setSearch(value);
    setPage(1);
  }

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

      {state.status === "loaded" && state.trips.length > 0 && (
        <div className="relative mt-6">
          <svg
            viewBox="0 0 24 24"
            fill="none"
            strokeWidth={2}
            stroke="currentColor"
            className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400"
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-4.35-4.35M18 10.5a7.5 7.5 0 1 1-15 0 7.5 7.5 0 0 1 15 0Z" />
          </svg>
          <input
            type="text"
            value={search}
            onChange={(e) => handleSearchChange(e.target.value)}
            placeholder="Search trips..."
            className="w-full rounded-lg border border-zinc-200 bg-zinc-50 py-2.5 pl-10 pr-3 text-sm text-zinc-900 outline-none transition-colors placeholder:text-zinc-400 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-50"
          />
        </div>
      )}

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

      {state.status === "loaded" && state.trips.length > 0 && filteredTrips.length === 0 && (
        <div className="mt-10 rounded-2xl border border-dashed border-zinc-300 p-10 text-center text-sm text-zinc-500 dark:border-zinc-700 dark:text-zinc-400">
          Tidak ada trip yang cocok dengan pencarian &quot;{search}&quot;.
        </div>
      )}

      {state.status === "loaded" && filteredTrips.length > 0 && (
        <>
          <div className="mt-8 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {pagedTrips.map((trip) => (
              <TripCard key={trip.id} trip={trip} onDelete={handleDelete} isDeleting={deletingId === trip.id} />
            ))}
          </div>

          <Pagination page={currentPage} totalPages={totalPages} onPageChange={setPage} />
        </>
      )}
    </div>
  );
}
