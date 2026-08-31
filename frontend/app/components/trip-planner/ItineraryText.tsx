import { parseItinerary } from "../../lib/itineraryParser";
import Icon from "../shared/Icon";

const PERIOD_META: Record<string, { label: string; icon: string }> = {
  morning: { label: "Pagi", icon: "sunrise" },
  afternoon: { label: "Siang", icon: "sun" },
  evening: { label: "Malam", icon: "moon" },
};

function stripDayPrefix(title: string): { number: string; label: string } {
  const match = title.match(/^day\s*(\d+)\s*[:.\-–]?\s*(.*)$/i);
  if (match) return { number: match[1], label: match[2].trim() };
  return { number: "", label: title };
}

export default function ItineraryText({ text }: { text: string }) {
  const { intro, days } = parseItinerary(text);

  if (days.length === 0) {
    return <p className="whitespace-pre-wrap text-sm leading-6 text-zinc-600 dark:text-zinc-400">{text}</p>;
  }

  return (
    <div className="flex flex-col gap-4">
      {intro && <p className="text-sm italic leading-6 text-zinc-500 dark:text-zinc-400">{intro}</p>}

      {days.map((day, dayIndex) => {
        const { number, label } = stripDayPrefix(day.title);
        return (
          <div
            key={dayIndex}
            className="overflow-hidden rounded-xl border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900"
          >
            <div className="flex items-center gap-3 border-b border-zinc-100 px-4 py-3 dark:border-zinc-800">
              <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-zinc-900 text-xs font-semibold text-white dark:bg-white dark:text-zinc-900">
                {number || dayIndex + 1}
              </span>
              <div className="min-w-0">
                <p className="text-[11px] font-medium uppercase tracking-wide text-zinc-400">
                  Hari {number || dayIndex + 1}
                </p>
                <h4 className="truncate font-display text-base font-semibold text-zinc-900 dark:text-zinc-50">
                  {label || `Hari ${number || dayIndex + 1}`}
                </h4>
              </div>
            </div>

            <div className="divide-y divide-zinc-100 dark:divide-zinc-800">
              {day.periods.map((period, periodIndex) => {
                const meta = PERIOD_META[period.name];
                return (
                  <div key={periodIndex} className="flex gap-4 px-4 py-4">
                    <div className="flex w-14 shrink-0 flex-col items-center gap-1 pt-0.5 text-zinc-400">
                      <Icon name={meta?.icon ?? "sun"} className="h-4 w-4" />
                      <span className="text-[10px] font-semibold uppercase tracking-wide">
                        {meta?.label ?? period.name}
                      </span>
                    </div>
                    <ul className="flex-1 space-y-2">
                      {period.activities.map((activity, activityIndex) => (
                        <li key={activityIndex} className="text-sm leading-6 text-zinc-600 dark:text-zinc-400">
                          {activity.label && (
                            <span className="font-medium text-zinc-900 dark:text-zinc-100">{activity.label}: </span>
                          )}
                          {activity.text}
                        </li>
                      ))}
                    </ul>
                  </div>
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
}
