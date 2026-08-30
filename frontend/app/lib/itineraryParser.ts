export type ItineraryActivity = {
  label?: string;
  text: string;
};

export type ItineraryPeriod = {
  name: string;
  activities: ItineraryActivity[];
};

export type ItineraryDay = {
  title: string;
  periods: ItineraryPeriod[];
};

export type ParsedItinerary = {
  intro: string | null;
  days: ItineraryDay[];
};

const DAY_RE = /^day\s*\d+/i;
const PERIOD_RE = /^(morning|afternoon|evening)\s*:?$/i;

// output AI kadang pakai markdown (#, ##, **) kadang polos -> disamakan dulu
function cleanLine(raw: string): string {
  return raw
    .trim()
    .replace(/^#{1,6}\s*/, "")
    .replace(/^\*\*(.*)\*\*$/, "$1")
    .trim();
}

function parseActivityLine(raw: string): ItineraryActivity {
  const withoutBullet = raw.replace(/^[-*]\s*/, "");
  const boldMatch = withoutBullet.match(/^\*\*(.+?)\*\*:?\s*(.*)$/);

  if (boldMatch) {
    return {
      label: boldMatch[1].trim().replace(/:$/, "").replace(/\*\*/g, ""),
      text: boldMatch[2].trim().replace(/\*\*/g, ""),
    };
  }

  return { text: withoutBullet.replace(/\*\*/g, "").trim() };
}

export function parseItinerary(text: string): ParsedItinerary {
  const lines = text
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);

  const days: ItineraryDay[] = [];
  let intro: string | null = null;

  for (const rawLine of lines) {
    const line = cleanLine(rawLine);

    if (DAY_RE.test(line)) {
      days.push({ title: line, periods: [] });
      continue;
    }

    if (days.length === 0) {
      intro = intro ? `${intro} ${line}` : line;
      continue;
    }

    const currentDay = days[days.length - 1];
    const periodMatch = line.match(PERIOD_RE);
    if (periodMatch) {
      currentDay.periods.push({ name: periodMatch[1].toLowerCase(), activities: [] });
      continue;
    }

    if (currentDay.periods.length === 0) continue;

    const currentPeriod = currentDay.periods[currentDay.periods.length - 1];
    currentPeriod.activities.push(parseActivityLine(line));
  }

  return { intro, days };
}
