export const TRAVEL_STYLES = ["Solo", "Couple", "Family"] as const;
export type TravelStyle = (typeof TRAVEL_STYLES)[number];

// Submitted value stays the English enum key (feeds the Bedrock prompt +
// TripCard/TripResult display). Only `label`/`description` are shown in the UI.
export const TRAVEL_STYLE_META: Record<
  TravelStyle,
  { label: string; description: string; iconName: string }
> = {
  Solo: { label: "Solo", description: "Perjalanan sendiri, fleksibel & hemat.", iconName: "user" },
  Couple: { label: "Berdua", description: "Pas untuk pasangan atau teman dekat.", iconName: "heart" },
  Family: { label: "Keluarga", description: "Ramah anak & rombongan keluarga.", iconName: "users" },
};

export function getTravelStyleIconName(style: string): string {
  return TRAVEL_STYLE_META[style as TravelStyle]?.iconName ?? "user";
}

// data lama belum punya travel_style -> default ke Solo
export function getTravelStyle(value: string | null | undefined): string {
  return value ?? "Solo";
}
