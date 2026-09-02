// httpOnly auth cookie name — shared by the auth route handlers, getSession(),
// and proxy.ts. Kept dependency-free so every runtime can import it.
export const AUTH_COOKIE = "access_token";

// 24h — mirror of backend JWT_EXPIRES_MINUTES=1440
export const AUTH_COOKIE_MAX_AGE = 60 * 60 * 24;
