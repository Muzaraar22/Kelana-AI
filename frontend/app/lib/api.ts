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

export type AuthUser = {
  id: number;
  name: string;
  email: string;
  created_at: string;
};

export class ApiError extends Error {
  status: number;
  constructor(status: number, message: string) {
    super(message);
    this.name = "ApiError";
    this.status = status;
  }
}

// same-origin: the browser hits Next.js, which proxies /bff/* -> backend and
// forwards the httpOnly auth cookie. Auth mutations go through Next route
// handlers (/api/auth/*) that own the cookie.
const BFF = "/bff";

// invoked whenever a request comes back 401 (expired/invalid session) so the
// AuthProvider can drop the user and bounce to /login
let onUnauthorized: (() => void) | null = null;
export function setUnauthorizedHandler(fn: (() => void) | null) {
  onUnauthorized = fn;
}

async function request<T>(url: string, init?: RequestInit): Promise<T> {
  const res = await fetch(url, {
    ...init,
    headers: { "Content-Type": "application/json", ...init?.headers },
  });

  if (res.status === 401) {
    onUnauthorized?.();
    throw new ApiError(401, "Sesi kamu berakhir. Silakan masuk lagi.");
  }

  if (!res.ok) {
    let detail = `Request gagal (status ${res.status}).`;
    try {
      const body = await res.json();
      if (body?.detail) detail = typeof body.detail === "string" ? body.detail : detail;
    } catch {
      /* non-JSON error body */
    }
    throw new ApiError(res.status, detail);
  }

  if (res.status === 204) return undefined as T;
  return res.json();
}

// ------------------------------- auth --------------------------------
export function register(name: string, email: string, password: string): Promise<AuthUser> {
  return request<AuthUser>("/api/auth/register", {
    method: "POST",
    body: JSON.stringify({ name, email, password }),
  });
}

export function login(email: string, password: string): Promise<AuthUser> {
  return request<AuthUser>("/api/auth/login", {
    method: "POST",
    body: JSON.stringify({ email, password }),
  });
}

export function logout(): Promise<void> {
  return request<void>("/api/auth/logout", { method: "POST" });
}

export function getMe(): Promise<AuthUser> {
  return request<AuthUser>(`${BFF}/api/v1/auth/me`);
}

// ------------------------------- trips -------------------------------
export function createTrip(payload: TripRequest): Promise<Trip> {
  return request<Trip>(`${BFF}/api/v1/trips`, {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export function listTrips(): Promise<Trip[]> {
  return request<Trip[]>(`${BFF}/api/v1/trips`);
}

export function getTrip(id: number): Promise<Trip> {
  return request<Trip>(`${BFF}/api/v1/trips/${id}`);
}

export async function deleteTrip(id: number): Promise<void> {
  await request<{ message: string }>(`${BFF}/api/v1/trips/${id}/`, { method: "DELETE" });
}

export function updateTripBudget(id: number, budget: number): Promise<Trip> {
  return request<Trip>(`${BFF}/api/v1/trips/${id}/`, {
    method: "PUT",
    body: JSON.stringify({ budget }),
  });
}

export function regenerateRecommendation(
  id: number
): Promise<{ trip_id: number; destination: string; ai_recommendation: string }> {
  return request(`${BFF}/api/v1/trips/${id}/generate`, { method: "POST" });
}

// ----------------------------- assistant ----------------------------
export type AssistantAnswer = {
  question: string;
  answer: string;
  sources: string[];
};

// one-shot: the backend keeps no conversation state and persists nothing.
// the chat history lives only in React state on /assistant.
export function askAssistant(question: string): Promise<AssistantAnswer> {
  return request<AssistantAnswer>(`${BFF}/api/v1/ask`, {
    method: "POST",
    body: JSON.stringify({ question }),
  });
}
