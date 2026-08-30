import type { Trip } from "../../lib/api";
import { getCategoryTheme } from "../../lib/categoryTheme";
import { getTravelStyle, getTravelStyleIcon } from "../../lib/travelStyle";
import Card from "../shared/Card";
import Button from "../shared/Button";

function formatMoney(amount: number, currency: string) {
  try {
    return new Intl.NumberFormat("id-ID", { style: "currency", currency, maximumFractionDigits: 0 }).format(amount);
  } catch {
    return `${amount.toLocaleString("id-ID")} ${currency}`;
  }
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" });
}

type TripCardProps = {
  trip: Trip;
  onDelete: (id: number) => void;
  isDeleting: boolean;
};

export default function TripCard({ trip, onDelete, isDeleting }: TripCardProps) {
  const theme = getCategoryTheme(trip.category);
  const travelStyle = getTravelStyle(trip.travel_style);

  return (
    <Card className="flex flex-col p-5 shadow-sm">
      <div className="flex items-start justify-between gap-2">
        <div>
          <p className="text-xs text-zinc-500 dark:text-zinc-400">{formatDate(trip.created_at)}</p>
          <h3 className="mt-0.5 text-lg font-semibold text-zinc-900 dark:text-zinc-50">{trip.destination}</h3>
        </div>
        <div className="flex shrink-0 flex-col items-end gap-1.5">
          <span className={`rounded-full px-3 py-1 text-xs font-semibold ${theme.badge}`}>
            {theme.icon} {trip.category}
          </span>
          <span className="rounded-full bg-zinc-100 px-3 py-1 text-xs font-semibold text-zinc-600 dark:bg-zinc-800 dark:text-zinc-300">
            {getTravelStyleIcon(travelStyle)} {travelStyle}
          </span>
        </div>
      </div>

      <dl className="mt-4 grid grid-cols-2 gap-3 text-sm">
        <div>
          <dt className="text-xs text-zinc-500 dark:text-zinc-400">Durasi</dt>
          <dd className="font-medium text-zinc-900 dark:text-zinc-50">{trip.days} hari</dd>
        </div>
        <div>
          <dt className="text-xs text-zinc-500 dark:text-zinc-400">Budget</dt>
          <dd className="font-medium text-zinc-900 dark:text-zinc-50">{formatMoney(trip.budget, trip.currency)}</dd>
        </div>
        <div>
          <dt className="text-xs text-zinc-500 dark:text-zinc-400">Transportasi</dt>
          <dd className="font-medium text-zinc-900 dark:text-zinc-50">{trip.transportation_recommendation}</dd>
        </div>
        <div>
          <dt className="text-xs text-zinc-500 dark:text-zinc-400">Musim</dt>
          <dd className="font-medium text-zinc-900 dark:text-zinc-50">{trip.travel_season}</dd>
        </div>
      </dl>

      <div className="mt-5 flex items-center gap-2">
        <Button href={`/trips/${trip.id}`} variant="secondary" size="sm" className="flex-1">
          Lihat Detail
        </Button>
        <Button variant="danger" size="sm" onClick={() => onDelete(trip.id)} disabled={isDeleting}>
          {isDeleting ? "Menghapus..." : "Hapus"}
        </Button>
      </div>
    </Card>
  );
}
