"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createTrip, ApiError, type TripRequest } from "../../lib/api";
import PlanForm from "./PlanForm";
import ErrorBanner from "../shared/ErrorBanner";

type State = { status: "idle" } | { status: "loading" } | { status: "error"; message: string };

export default function TripPlanner({ currencies }: { currencies: string[] }) {
  const router = useRouter();
  const [state, setState] = useState<State>({ status: "idle" });

  async function handleSubmit(payload: TripRequest) {
    setState({ status: "loading" });
    try {
      const trip = await createTrip(payload);
      router.push(`/trips/${trip.id}`);
    } catch (err) {
      setState({
        status: "error",
        message:
          err instanceof ApiError
            ? err.message
            : "Gagal terhubung ke server KelanaAI. Pastikan backend berjalan, lalu coba lagi.",
      });
    }
  }

  return (
    <div className="flex w-full flex-col gap-4">
      <PlanForm
        onSubmit={handleSubmit}
        isLoading={state.status === "loading"}
        currencies={currencies}
      />

      {state.status === "error" && <ErrorBanner>{state.message}</ErrorBanner>}
    </div>
  );
}
