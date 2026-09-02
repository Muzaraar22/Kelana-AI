"use client";

import { Suspense, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "../providers";
import { ApiError } from "../lib/api";
import Card from "../components/shared/Card";
import Button from "../components/shared/Button";
import Spinner from "../components/shared/Spinner";
import ErrorBanner from "../components/shared/ErrorBanner";

const inputClass =
  "rounded-lg border border-zinc-200 bg-zinc-50 px-3 py-2.5 text-sm text-zinc-900 outline-none transition-colors placeholder:text-zinc-400 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-50";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const next = searchParams.get("next") || "/trips";
  const { login } = useAuth();

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const data = new FormData(e.currentTarget);
    setError(null);
    setIsLoading(true);
    try {
      await login(String(data.get("email")), String(data.get("password")));
      router.replace(next);
    } catch (err) {
      if (err instanceof ApiError && err.status === 401) {
        setError("Email atau password salah.");
      } else {
        setError(err instanceof Error ? err.message : "Gagal masuk. Coba lagi.");
      }
      setIsLoading(false);
    }
  }

  return (
    <Card className="mx-auto mt-16 w-full max-w-md p-6 shadow-sm sm:p-8">
      <h1 className="font-display text-2xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-50">
        Masuk ke KelanaAI
      </h1>
      <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
        Belum punya akun?{" "}
        <Link href="/register" className="font-medium text-emerald-600 hover:underline dark:text-emerald-400">
          Daftar dulu
        </Link>
        .
      </p>

      <form onSubmit={handleSubmit} className="mt-6 flex flex-col gap-4">
        <label className="flex flex-col gap-1.5">
          <span className="text-xs font-medium text-zinc-500 dark:text-zinc-400">Email</span>
          <input type="email" name="email" required autoComplete="email" placeholder="kamu@email.com" className={inputClass} />
        </label>

        <label className="flex flex-col gap-1.5">
          <span className="text-xs font-medium text-zinc-500 dark:text-zinc-400">Password</span>
          <input type="password" name="password" required autoComplete="current-password" placeholder="••••••••" className={inputClass} />
        </label>

        {error && <ErrorBanner>{error}</ErrorBanner>}

        <Button type="submit" disabled={isLoading} fullWidth>
          {isLoading && <Spinner />}
          {isLoading ? "Memproses..." : "Masuk"}
        </Button>
      </form>
    </Card>
  );
}

export default function LoginPage() {
  return (
    <div className="mx-auto w-full max-w-6xl px-6 pb-16">
      <Suspense fallback={null}>
        <LoginForm />
      </Suspense>
    </div>
  );
}
