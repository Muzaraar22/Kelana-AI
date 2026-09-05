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
// Persisted, multi-conversation chat: history lives in Postgres (conversations
// + messages tables), fetched on demand — nothing is kept only in React state.
export type ChatMessage = {
  id: number;
  role: "user" | "assistant";
  content: string;
  sources: string[] | null;
  created_at: string;
};

export type ConversationSummary = {
  id: number;
  title: string;
  created_at: string;
  updated_at: string;
};

export type ConversationDetail = ConversationSummary & {
  messages: ChatMessage[];
};

export type AskResponse = {
  conversation_id: number;
  conversation_title: string;
  user_message: ChatMessage;
  assistant_message: ChatMessage;
};

export function listConversations(): Promise<ConversationSummary[]> {
  return request<ConversationSummary[]>(`${BFF}/api/v1/conversations`);
}

export function getConversation(id: number): Promise<ConversationDetail> {
  return request<ConversationDetail>(`${BFF}/api/v1/conversations/${id}`);
}

export function renameConversation(id: number, title: string): Promise<ConversationSummary> {
  return request<ConversationSummary>(`${BFF}/api/v1/conversations/${id}`, {
    method: "PATCH",
    body: JSON.stringify({ title }),
  });
}

export async function deleteConversation(id: number): Promise<void> {
  await request<{ message: string }>(`${BFF}/api/v1/conversations/${id}/`, { method: "DELETE" });
}

// conversationId null -> backend creates a new conversation and returns its id
export function sendMessage(question: string, conversationId: number | null): Promise<AskResponse> {
  return request<AskResponse>(`${BFF}/api/v1/ask`, {
    method: "POST",
    body: JSON.stringify({ question, conversation_id: conversationId }),
  });
}
