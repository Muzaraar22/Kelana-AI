"use client";

import { useEffect, useRef, useState } from "react";
import dynamic from "next/dynamic";
import type { TripRequest } from "../../lib/api";
import { MONTHS } from "../../lib/months";
import { TRAVEL_STYLES, TRAVEL_STYLE_META, type TravelStyle } from "../../lib/travelStyle";
import { currencyLabel } from "../../lib/currencies";
import { digitsOnly, groupThousands } from "../../lib/formatMoney";
import { reverseGeocode, searchPlaces, type PlaceHit } from "../../lib/geocode";
import type { LatLng } from "./MapPicker";
import Button from "../shared/Button";
import Select from "../shared/Select";
import Spinner from "../shared/Spinner";
import Icon from "../shared/Icon";

const MapPicker = dynamic(() => import("./MapPicker"), {
  ssr: false,
  loading: () => (
    <div className="h-[300px] w-full animate-pulse rounded-xl border border-zinc-200 bg-zinc-100 dark:border-zinc-800 dark:bg-zinc-800 lg:h-full lg:min-h-[420px]" />
  ),
});

const inputClass =
  "rounded-lg border border-zinc-200 bg-zinc-50 px-3 py-2.5 text-sm text-zinc-900 outline-none transition-colors placeholder:text-zinc-400 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-50";

const labelClass = "text-xs font-medium text-zinc-500 dark:text-zinc-400";
const errorClass = "text-xs text-red-600 dark:text-red-400";

type PlanFormProps = {
  onSubmit: (payload: TripRequest) => void;
  isLoading: boolean;
  currencies: string[];
};

export default function PlanForm({ onSubmit, isLoading, currencies }: PlanFormProps) {
  const [destination, setDestination] = useState("");
  const [coords, setCoords] = useState<LatLng | null>(null);
  const [days, setDays] = useState("");
  const [budget, setBudget] = useState(""); // raw digits only
  const [budgetFocused, setBudgetFocused] = useState(false);
  const [currency, setCurrency] = useState(() =>
    currencies.includes("IDR") ? "IDR" : currencies[0] ?? "IDR"
  );
  const [travelMonth, setTravelMonth] = useState("");
  const [travelStyle, setTravelStyle] = useState<TravelStyle>("Solo");

  const [suggestions, setSuggestions] = useState<PlaceHit[]>([]);
  const [showSug, setShowSug] = useState(false);
  const [errors, setErrors] = useState<Record<string, string | undefined>>({});

  const skipNextSearch = useRef(false);
  const reverseCtrl = useRef<AbortController | null>(null);

  const clearError = (key: string) => setErrors((p) => ({ ...p, [key]: undefined }));

  // debounced forward geocode — reacts to typing only
  useEffect(() => {
    if (skipNextSearch.current) {
      skipNextSearch.current = false;
      return;
    }
    const q = destination.trim();
    const ctrl = new AbortController();
    const t = setTimeout(() => {
      if (q.length < 3) {
        setSuggestions([]);
        return;
      }
      searchPlaces(q, ctrl.signal)
        .then(setSuggestions)
        .catch((err: unknown) => {
          if (!(err instanceof DOMException && err.name === "AbortError")) setSuggestions([]);
        });
    }, 400);
    return () => {
      clearTimeout(t);
      ctrl.abort();
    };
  }, [destination]);

  function pickSuggestion(s: PlaceHit) {
    skipNextSearch.current = true;
    setDestination(s.label);
    setCoords({ lat: s.lat, lng: s.lng });
    setSuggestions([]);
    setShowSug(false);
    clearError("destination");
  }

  // reverse geocode lives here (not in MapPicker) so PlanForm owns every abort controller
  function handleMapPick(c: LatLng) {
    setCoords(c); // marker moves immediately
    clearError("destination");
    reverseCtrl.current?.abort();
    const ctrl = new AbortController();
    reverseCtrl.current = ctrl;
    reverseGeocode(c.lat, c.lng, ctrl.signal)
      .then((label) => {
        skipNextSearch.current = true;
        setDestination(label);
        setSuggestions([]);
      })
      .catch(() => {
        /* keep whatever the user already typed */
      });
  }

  function validate(): Record<string, string> {
    const e: Record<string, string> = {};
    if (!destination.trim()) e.destination = "Masukkan destinasi.";
    const d = Number(days);
    if (!Number.isInteger(d) || d < 1) e.days = "Minimal 1 hari.";
    if (Number(digitsOnly(budget)) <= 0) e.budget = "Masukkan budget.";
    if (!travelMonth) e.travelMonth = "Pilih bulan perjalanan.";
    return e;
  }

  function handleSubmit(ev: React.FormEvent<HTMLFormElement>) {
    ev.preventDefault();
    const e = validate();
    setErrors(e);
    if (Object.keys(e).length > 0) return;
    onSubmit({
      destination: destination.trim(),
      days: Number(days),
      budget: Number(digitsOnly(budget)),
      currency,
      travel_month: travelMonth,
      travel_style: travelStyle,
    });
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="grid gap-6 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)]"
    >
      <div className="lg:min-h-[440px]">
        <MapPicker value={coords} onPick={handleMapPick} />
        <p className="mt-1.5 text-xs text-zinc-400">
          Klik titik di peta untuk mengisi destinasi otomatis.
        </p>
      </div>

      <div className="flex flex-col gap-4">
        {/* destination + suggestions */}
        <div className="flex flex-col gap-1.5">
          <span className={labelClass}>Destinasi</span>
          <div className="relative">
            <Icon
              name="map-pin"
              className="pointer-events-none absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400"
            />
            <input
              type="text"
              value={destination}
              onChange={(e) => {
                setDestination(e.target.value);
                clearError("destination");
              }}
              onFocus={() => setShowSug(true)}
              onBlur={() => setTimeout(() => setShowSug(false), 150)}
              autoComplete="off"
              placeholder="Cari kota atau tempat…"
              className={`${inputClass} w-full pl-9`}
            />
            {showSug && suggestions.length > 0 && (
              <ul className="absolute z-10 mt-1 max-h-64 w-full overflow-auto rounded-lg border border-zinc-200 bg-white shadow-lg dark:border-zinc-700 dark:bg-zinc-800">
                {suggestions.map((s, i) => (
                  <li key={`${s.lat},${s.lng},${i}`}>
                    <button
                      type="button"
                      onMouseDown={(e) => e.preventDefault()}
                      onClick={() => pickSuggestion(s)}
                      className="block w-full px-3 py-2 text-left hover:bg-zinc-100 dark:hover:bg-zinc-700"
                    >
                      <span className="text-sm font-medium text-zinc-900 dark:text-zinc-50">{s.label}</span>
                      <span className="block truncate text-xs text-zinc-500 dark:text-zinc-400">
                        {s.displayName}
                      </span>
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
          {errors.destination && <span className={errorClass}>{errors.destination}</span>}
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <label className="flex flex-col gap-1.5">
            <span className={labelClass}>Lama Trip (hari)</span>
            <input
              type="number"
              min={1}
              value={days}
              onChange={(e) => {
                setDays(e.target.value);
                clearError("days");
              }}
              placeholder="7"
              className={`${inputClass} w-full`}
            />
            {errors.days && <span className={errorClass}>{errors.days}</span>}
          </label>

          <label className="flex flex-col gap-1.5">
            <span className={labelClass}>Budget</span>
            <input
              inputMode="numeric"
              value={budgetFocused ? budget : groupThousands(budget)}
              onFocus={() => setBudgetFocused(true)}
              onBlur={() => setBudgetFocused(false)}
              onChange={(e) => {
                setBudget(digitsOnly(e.target.value));
                clearError("budget");
              }}
              placeholder="5.000.000"
              className={`${inputClass} w-full`}
            />
            {errors.budget && <span className={errorClass}>{errors.budget}</span>}
          </label>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <label className="flex flex-col gap-1.5">
            <span className={labelClass}>Mata Uang</span>
            <Select value={currency} onChange={(e) => setCurrency(e.target.value)}>
              {currencies.map((c) => (
                <option key={c} value={c}>
                  {currencyLabel(c)}
                </option>
              ))}
            </Select>
          </label>

          <label className="flex flex-col gap-1.5">
            <span className={labelClass}>Bulan Perjalanan</span>
            <Select
              value={travelMonth}
              onChange={(e) => {
                setTravelMonth(e.target.value);
                clearError("travelMonth");
              }}
            >
              <option value="" disabled>
                Pilih bulan
              </option>
              {MONTHS.map((m) => (
                <option key={m.value} value={m.value}>
                  {m.label}
                </option>
              ))}
            </Select>
            {errors.travelMonth && <span className={errorClass}>{errors.travelMonth}</span>}
          </label>
        </div>

        <div className="flex flex-col gap-1.5">
          <span className={labelClass}>Gaya Trip</span>
          <div role="radiogroup" aria-label="Gaya trip" className="grid gap-2 sm:grid-cols-3">
            {TRAVEL_STYLES.map((style) => {
              const meta = TRAVEL_STYLE_META[style];
              const selected = travelStyle === style;
              return (
                <button
                  key={style}
                  type="button"
                  role="radio"
                  aria-checked={selected}
                  onClick={() => setTravelStyle(style)}
                  className={`flex flex-col items-start gap-1 rounded-xl border p-3 text-left transition-colors ${
                    selected
                      ? "border-emerald-500 bg-emerald-50 ring-2 ring-emerald-500/20 dark:bg-emerald-500/10"
                      : "border-zinc-200 bg-zinc-50 hover:border-zinc-300 dark:border-zinc-700 dark:bg-zinc-800"
                  }`}
                >
                  <Icon name={meta.iconName} className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
                  <span className="text-sm font-semibold text-zinc-900 dark:text-zinc-50">{meta.label}</span>
                  <span className="text-xs text-zinc-500 dark:text-zinc-400">{meta.description}</span>
                </button>
              );
            })}
          </div>
        </div>

        <Button type="submit" disabled={isLoading} fullWidth className="mt-1 sm:w-auto sm:px-8">
          {isLoading && <Spinner />}
          {isLoading ? "Menyusun rencana trip..." : "Buat Rencana Trip"}
        </Button>
      </div>
    </form>
  );
}
