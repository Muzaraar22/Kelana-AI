export type TripRequest = {
  destination: string;
  days: number;
  budget: number;
  currency: string;
  travel_month: string;
  travel_style: string;
};

export type Trip = Omit<TripRequest, "travel_style"> & {
  id: number;
  category: string;
  daily_budget: number;
  transportation_recommendation: string;
  travel_season: string;
  recommended_places: string[];
  ai_recommendation: string | null;
  created_at: string;
  // data lama belum punya kolom ini, bisa null
  travel_style: string | null;
};

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:8000";

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${API_BASE_URL}${path}`, {
    ...init,
    headers: { "Content-Type": "application/json", ...init?.headers },
  });

  if (!res.ok) {
    throw new Error(`Request ke ${path} gagal (status ${res.status}).`);
  }

  return res.json();
}

export function createTrip(payload: TripRequest): Promise<Trip> {
  return request<Trip>("/api/v1/trips", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export function listTrips(): Promise<Trip[]> {
  return request<Trip[]>("/api/v1/trips");
}

export function getTrip(id: number): Promise<Trip> {
  return request<Trip>(`/api/v1/trips/${id}`);
}

export async function deleteTrip(id: number): Promise<void> {
  await request<{ message: string }>(`/api/v1/trips/${id}/`, { method: "DELETE" });
}

export function updateTripBudget(id: number, budget: number): Promise<Trip> {
  return request<Trip>(`/api/v1/trips/${id}/`, {
    method: "PUT",
    body: JSON.stringify({ budget }),
  });
}

export function regenerateRecommendation(
  id: number
): Promise<{ trip_id: number; destination: string; ai_recommendation: string }> {
  return request(`/api/v1/trips/${id}/generate`, { method: "POST" });
}
