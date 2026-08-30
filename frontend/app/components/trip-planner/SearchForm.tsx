"use client";

import type { TripRequest } from "../../lib/api";
import { TRAVEL_STYLES } from "../../lib/travelStyle";
import Button from "../shared/Button";
import Spinner from "../shared/Spinner";
import Select from "../shared/Select";

const MONTHS = [
  { value: "January", label: "Januari" },
  { value: "February", label: "Februari" },
  { value: "March", label: "Maret" },
  { value: "April", label: "April" },
  { value: "May", label: "Mei" },
  { value: "June", label: "Juni" },
  { value: "July", label: "Juli" },
  { value: "August", label: "Agustus" },
  { value: "September", label: "September" },
  { value: "October", label: "Oktober" },
  { value: "November", label: "November" },
  { value: "December", label: "Desember" },
];

type SearchFormProps = {
  onSubmit: (payload: TripRequest) => void;
  isLoading: boolean;
};

export default function SearchForm({ onSubmit, isLoading }: SearchFormProps) {
  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);

    onSubmit({
      destination: String(formData.get("destination")),
      days: Number(formData.get("days")),
      budget: Number(formData.get("budget")),
      currency: String(formData.get("currency")),
      travel_month: String(formData.get("travel_month")),
      travel_style: String(formData.get("travel_style")),
    });
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="w-full rounded-2xl border border-zinc-200 bg-white p-5 shadow-xl shadow-black/10 ring-1 ring-black/5 dark:border-zinc-800 dark:bg-zinc-900 dark:ring-white/10 sm:p-6"
    >
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-13 lg:gap-3">
        <label className="flex flex-col gap-1.5 lg:col-span-3">
          <span className="text-xs font-medium text-zinc-500 dark:text-zinc-400">Destinasi</span>
          <input
            type="text"
            name="destination"
            placeholder="Bali, Yogyakarta, ..."
            required
            className="rounded-lg border border-zinc-200 bg-zinc-50 px-3 py-2.5 text-sm text-zinc-900 outline-none transition-colors placeholder:text-zinc-400 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-50"
          />
        </label>

        <label className="flex flex-col gap-1.5 lg:col-span-2">
          <span className="text-xs font-medium text-zinc-500 dark:text-zinc-400">Lama Trip (hari)</span>
          <input
            type="number"
            name="days"
            min={1}
            placeholder="7"
            required
            className="rounded-lg border border-zinc-200 bg-zinc-50 px-3 py-2.5 text-sm text-zinc-900 outline-none transition-colors placeholder:text-zinc-400 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-50"
          />
        </label>

        <label className="flex flex-col gap-1.5 lg:col-span-3">
          <span className="text-xs font-medium text-zinc-500 dark:text-zinc-400">Budget</span>
          <div className="flex items-stretch overflow-hidden rounded-lg border border-zinc-200 bg-zinc-50 focus-within:border-emerald-500 focus-within:ring-2 focus-within:ring-emerald-500/20 dark:border-zinc-700 dark:bg-zinc-800">
            <div className="relative shrink-0 border-r border-zinc-200 dark:border-zinc-700">
              <select
                name="currency"
                defaultValue="IDR"
                className="appearance-none bg-transparent py-2.5 pl-2 pr-6 text-sm text-zinc-600 outline-none dark:text-zinc-300"
              >
                <option value="IDR">IDR</option>
                <option value="USD">USD</option>
              </select>
              <svg
                viewBox="0 0 24 24"
                fill="none"
                strokeWidth={2}
                stroke="currentColor"
                className="pointer-events-none absolute right-1.5 top-1/2 h-3 w-3 -translate-y-1/2 text-zinc-500 dark:text-zinc-400"
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
              </svg>
            </div>
            <input
              type="number"
              name="budget"
              min={0}
              placeholder="5.000.000"
              required
              className="w-0 min-w-0 flex-1 bg-transparent px-3 py-2.5 text-sm text-zinc-900 outline-none placeholder:text-zinc-400 dark:text-zinc-50"
            />
          </div>
        </label>

        <label className="flex flex-col gap-1.5 lg:col-span-3">
          <span className="text-xs font-medium text-zinc-500 dark:text-zinc-400">Bulan Perjalanan</span>
          <Select name="travel_month" defaultValue="" required>
            <option value="" disabled>
              Pilih bulan
            </option>
            {MONTHS.map((month) => (
              <option key={month.value} value={month.value}>
                {month.label}
              </option>
            ))}
          </Select>
        </label>

        <label className="flex flex-col gap-1.5 lg:col-span-2">
          <span className="text-xs font-medium text-zinc-500 dark:text-zinc-400">Gaya Trip</span>
          <Select name="travel_style" defaultValue="Solo">
            {TRAVEL_STYLES.map((style) => (
              <option key={style} value={style}>
                {style}
              </option>
            ))}
          </Select>
        </label>
      </div>

      <Button type="submit" disabled={isLoading} className="mt-4 sm:mt-5 sm:w-auto sm:px-8" fullWidth>
        {isLoading && <Spinner />}
        {isLoading ? "Menyusun rencana trip..." : "Cari Rekomendasi Trip"}
      </Button>
    </form>
  );
}
