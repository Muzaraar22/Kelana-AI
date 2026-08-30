function isDayHeading(line: string) {
  return /^day\s*\d+/i.test(line.trim());
}

function isPeriodHeading(line: string) {
  return /^(morning|afternoon|evening)\s*:?/i.test(line.trim());
}

export default function ItineraryText({ text }: { text: string }) {
  const lines = text.split("\n").map((line) => line.trim()).filter(Boolean);

  return (
    <div className="space-y-2">
      {lines.map((line, i) => {
        if (isDayHeading(line)) {
          return (
            <h4 key={i} className="pt-3 text-sm font-semibold text-zinc-900 first:pt-0 dark:text-zinc-50">
              {line}
            </h4>
          );
        }
        if (isPeriodHeading(line)) {
          return (
            <p key={i} className="text-xs font-semibold uppercase tracking-wide text-emerald-600 dark:text-emerald-400">
              {line}
            </p>
          );
        }
        if (line.startsWith("-")) {
          return (
            <p key={i} className="pl-3 text-sm leading-6 text-zinc-600 dark:text-zinc-400">
              {line.replace(/^-\s*/, "")}
            </p>
          );
        }
        return (
          <p key={i} className="text-sm leading-6 text-zinc-600 dark:text-zinc-400">
            {line}
          </p>
        );
      })}
    </div>
  );
}
