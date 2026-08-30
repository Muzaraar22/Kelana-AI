"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createTrip, type TripRequest } from "../../lib/api";
import SearchForm from "./SearchForm";
import ErrorBanner from "../shared/ErrorBanner";

type State = { status: "idle" } | { status: "loading" } | { status: "error"; message: string };

export default function TripPlanner() {
  const router = useRouter();
  const [state, setState] = useState<State>({ status: "idle" });

  async function handleSubmit(payload: TripRequest) {
    setState({ status: "loading" });
    try {
      const trip = await createTrip(payload);
      router.push(`/trips/${trip.id}`);
    } catch {
      setState({
        status: "error",
        message: "Gagal terhubung ke server KelanaAI. Pastikan backend berjalan, lalu coba lagi.",
      });
    }
  }

  return (
    <div className="flex w-full flex-col items-center gap-4">
      <SearchForm onSubmit={handleSubmit} isLoading={state.status === "loading"} />

      {state.status === "error" && <ErrorBanner>{state.message}</ErrorBanner>}
    </div>
  );
}
