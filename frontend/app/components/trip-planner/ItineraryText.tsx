import { parseItinerary } from "../../lib/itineraryParser";

const PERIOD_META: Record<string, { label: string; icon: string; className: string }> = {
  morning: {
    label: "Pagi",
    icon: "🌅",
    className: "border-amber-200 bg-amber-50 dark:border-amber-500/20 dark:bg-amber-500/10",
  },
  afternoon: {
    label: "Siang",
    icon: "☀️",
    className: "border-sky-200 bg-sky-50 dark:border-sky-500/20 dark:bg-sky-500/10",
  },
  evening: {
    label: "Malam",
    icon: "🌙",
    className: "border-violet-200 bg-violet-50 dark:border-violet-500/20 dark:bg-violet-500/10",
  },
};

const DEFAULT_PERIOD_META = {
  label: "",
  icon: "",
  className: "border-zinc-200 bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-800/50",
};

export default function ItineraryText({ text }: { text: string }) {
  const { intro, days } = parseItinerary(text);

  if (days.length === 0) {
    return <p className="whitespace-pre-wrap text-sm leading-6 text-zinc-600 dark:text-zinc-400">{text}</p>;
  }

  return (
    <div className="flex flex-col gap-4">
      {intro && <p className="text-sm italic text-zinc-500 dark:text-zinc-400">{intro}</p>}

      {days.map((day, dayIndex) => (
        <div key={dayIndex} className="overflow-hidden rounded-xl border border-zinc-200 dark:border-zinc-800">
          <div className="bg-zinc-900 px-4 py-2.5 text-sm font-semibold text-white dark:bg-zinc-800">
            {day.title}
          </div>
          <div className="flex flex-col gap-3 p-3">
            {day.periods.map((period, periodIndex) => {
              const meta = PERIOD_META[period.name] ?? DEFAULT_PERIOD_META;
              return (
                <div key={periodIndex} className={`rounded-lg border p-3 ${meta.className}`}>
                  <p className="text-xs font-semibold uppercase tracking-wide text-zinc-700 dark:text-zinc-300">
                    {meta.icon} {meta.label || period.name}
                  </p>
                  <ul className="mt-1.5 space-y-1.5">
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
      ))}
    </div>
  );
}
