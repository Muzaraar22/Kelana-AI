import type { Trip } from "../../lib/api";
import { getTravelStyle } from "../../lib/travelStyle";
import ItineraryText from "./ItineraryText";
import Card from "../shared/Card";
import TypingDots from "../shared/TypingDots";

function formatMoney(amount: number, currency: string) {
  try {
    return new Intl.NumberFormat("id-ID", { style: "currency", currency, maximumFractionDigits: 0 }).format(amount);
  } catch {
    return `${amount.toLocaleString("id-ID")} ${currency}`;
  }
}

type TripResultProps = {
  trip: Trip;
  isRegeneratingItinerary?: boolean;
};

export default function TripResult({ trip, isRegeneratingItinerary = false }: TripResultProps) {
  return (
    <Card className="w-full p-5 text-left shadow-sm sm:p-6">
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-5">
        <div>
          <p className="text-xs text-zinc-500 dark:text-zinc-400">Durasi</p>
          <p className="text-sm font-semibold text-zinc-900 dark:text-zinc-50">{trip.days} hari</p>
        </div>
        <div>
          <p className="text-xs text-zinc-500 dark:text-zinc-400">Budget Harian</p>
          <p className="text-sm font-semibold text-zinc-900 dark:text-zinc-50">
            {formatMoney(trip.daily_budget, trip.currency)}
          </p>
        </div>
        <div>
          <p className="text-xs text-zinc-500 dark:text-zinc-400">Transportasi</p>
          <p className="text-sm font-semibold text-zinc-900 dark:text-zinc-50">
            {trip.transportation_recommendation}
          </p>
        </div>
        <div>
          <p className="text-xs text-zinc-500 dark:text-zinc-400">Musim</p>
          <p className="text-sm font-semibold text-zinc-900 dark:text-zinc-50">{trip.travel_season}</p>
        </div>
        <div>
          <p className="text-xs text-zinc-500 dark:text-zinc-400">Gaya Trip</p>
          <p className="text-sm font-semibold text-zinc-900 dark:text-zinc-50">{getTravelStyle(trip.travel_style)}</p>
        </div>
      </div>

      {trip.recommended_places.length > 0 && (
        <div className="mt-5 border-t border-zinc-100 pt-4 dark:border-zinc-800">
          <p className="text-xs font-medium uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
            Rekomendasi Tempat
          </p>
          <div className="mt-2 flex flex-wrap gap-2">
            {trip.recommended_places.map((place) => (
              <span
                key={place}
                className="rounded-full bg-zinc-100 px-3 py-1 text-xs text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300"
              >
                {place}
              </span>
            ))}
          </div>
        </div>
      )}

      {(trip.ai_recommendation || isRegeneratingItinerary) && (
        <div className="mt-5 border-t border-zinc-100 pt-4 dark:border-zinc-800">
          <p className="text-xs font-medium uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
            Itinerary dari KelanaAI
          </p>
          <div className="mt-2">
            {isRegeneratingItinerary ? (
              <div className="flex items-center gap-2 text-sm text-zinc-500 dark:text-zinc-400">
                <TypingDots className="text-emerald-600 dark:text-emerald-400" />
                <span>KelanaAI sedang menyusun ulang itinerary sesuai budget baru...</span>
              </div>
            ) : (
              trip.ai_recommendation && <ItineraryText text={trip.ai_recommendation} />
            )}
          </div>
        </div>
      )}
    </Card>
  );
}
