export const TRAVEL_STYLES = ["Solo", "Couple", "Family"] as const;

const ICONS: Record<string, string> = {
  Solo: "🧍",
  Couple: "💑",
  Family: "👨‍👩‍👧",
};

export function getTravelStyleIcon(style: string): string {
  return ICONS[style] ?? "🧭";
}

// data lama belum punya travel_style -> default ke Solo
export function getTravelStyle(value: string | null | undefined): string {
  return value ?? "Solo";
}
