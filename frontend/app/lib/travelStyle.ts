export const TRAVEL_STYLES = ["Solo", "Couple", "Family"] as const;

// nama icon di komponen shared/Icon
const ICON_NAMES: Record<string, string> = {
  Solo: "user",
  Couple: "heart",
  Family: "users",
};

export function getTravelStyleIconName(style: string): string {
  return ICON_NAMES[style] ?? "user";
}

// data lama belum punya travel_style -> default ke Solo
export function getTravelStyle(value: string | null | undefined): string {
  return value ?? "Solo";
}
