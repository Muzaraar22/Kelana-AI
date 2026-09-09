// httpOnly auth cookie name — shared by the auth route handlers, getSession(),
// and proxy.ts. Kept dependency-free so every runtime can import it.
export const AUTH_COOKIE = "access_token";

// Fallback cookie lifetime, used only when the JWT's own `exp` can't be read.
// The route handlers normally set maxAge from the token via jwtSecondsLeft() so
// the cookie dies exactly when the token does (no "present but dead" window).
export const AUTH_COOKIE_MAX_AGE = 60 * 60; // 1h
