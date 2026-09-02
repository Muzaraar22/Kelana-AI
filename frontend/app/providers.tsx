"use client";

import { createContext, useCallback, useContext, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  type AuthUser,
  login as apiLogin,
  logout as apiLogout,
  register as apiRegister,
  setUnauthorizedHandler,
} from "./lib/api";

type AuthContextValue = {
  user: AuthUser | null;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function Providers({
  initialUser,
  children,
}: {
  initialUser: AuthUser | null;
  children: React.ReactNode;
}) {
  const router = useRouter();
  const [user, setUser] = useState<AuthUser | null>(initialUser);

  // re-sync when the server re-resolves the session (router.refresh, navigation).
  // Compared by id so a new object with the same user doesn't thrash state.
  const [syncedId, setSyncedId] = useState<number | null>(initialUser?.id ?? null);
  const incomingId = initialUser?.id ?? null;
  if (incomingId !== syncedId) {
    setSyncedId(incomingId);
    setUser(initialUser);
  }

  const logout = useCallback(async () => {
    try {
      await apiLogout();
    } catch {
      /* ignore — clear locally regardless */
    }
    setUser(null);
    router.replace("/login");
    router.refresh();
  }, [router]);

  // a 401 from any data call means the cookie is dead → drop the user
  useEffect(() => {
    setUnauthorizedHandler(() => {
      setUser(null);
      router.replace("/login");
      router.refresh();
    });
    return () => setUnauthorizedHandler(null);
  }, [router]);

  const login = useCallback(
    async (email: string, password: string) => {
      const u = await apiLogin(email, password);
      setUser(u);
      router.refresh();
    },
    [router]
  );

  const register = useCallback(
    async (name: string, email: string, password: string) => {
      const u = await apiRegister(name, email, password);
      setUser(u);
      router.refresh();
    },
    [router]
  );

  return (
    <AuthContext.Provider value={{ user, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within <Providers>");
  return ctx;
}
