// OpenStreetMap Nominatim geocoding — free, no API key, CORS-open.
// Policy: debounce (>= 400ms), abort stale requests, >= 3 chars before searching.
// Browsers set Referer automatically (they forbid User-Agent); that satisfies
// Nominatim's identification requirement for low-volume use.

const NOMINATIM = "https://nominatim.openstreetmap.org";

export type PlaceHit = {
  label: string; // concise "City, Country" — this is what goes in the form field
  displayName: string; // full Nominatim string — shown as secondary text
  lat: number;
  lng: number;
};

type NominatimRow = {
  lat: string;
  lon: string;
  name?: string;
  display_name?: string;
  address?: Record<string, string>;
};

function toHit(row: NominatimRow): PlaceHit {
  const a = row.address ?? {};
  const place =
    a.city ||
    a.town ||
    a.village ||
    a.municipality ||
    a.county ||
    a.state ||
    row.name ||
    row.display_name?.split(",")[0] ||
    "";
  const label = [place, a.country].filter(Boolean).join(", ") || row.display_name || "";
  return {
    label,
    displayName: row.display_name ?? label,
    lat: Number(row.lat),
    lng: Number(row.lon),
  };
}

export async function searchPlaces(query: string, signal?: AbortSignal): Promise<PlaceHit[]> {
  const url =
    `${NOMINATIM}/search?format=jsonv2&addressdetails=1&limit=5&accept-language=id` +
    `&q=${encodeURIComponent(query)}`;
  const res = await fetch(url, { signal, headers: { Accept: "application/json" } });
  if (!res.ok) throw new Error(`geocode ${res.status}`);
  const rows = (await res.json()) as NominatimRow[];
  return rows.map(toHit).filter((h) => Number.isFinite(h.lat) && Number.isFinite(h.lng));
}

export async function reverseGeocode(lat: number, lng: number, signal?: AbortSignal): Promise<string> {
  const url =
    `${NOMINATIM}/reverse?format=jsonv2&addressdetails=1&accept-language=id` +
    `&lat=${lat}&lon=${lng}`;
  const res = await fetch(url, { signal, headers: { Accept: "application/json" } });
  if (!res.ok) throw new Error(`reverse ${res.status}`);
  return toHit((await res.json()) as NominatimRow).label;
}
