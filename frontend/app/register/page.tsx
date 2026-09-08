"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "../providers";
import { ApiError } from "../lib/api";
import Card from "../components/shared/Card";
import Button from "../components/shared/Button";
import Spinner from "../components/shared/Spinner";
import ErrorBanner from "../components/shared/ErrorBanner";
import PasswordInput from "../components/shared/PasswordInput";

const inputClass =
  "rounded-lg border border-zinc-200 bg-zinc-50 px-3 py-2.5 text-sm text-zinc-900 outline-none transition-colors placeholder:text-zinc-400 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-50";

export default function RegisterPage() {
  const router = useRouter();
  const { register } = useAuth();

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [mismatch, setMismatch] = useState(false);

  // live check: only flag once the confirmation field has something in it
  function handleFormInput(e: React.FormEvent<HTMLFormElement>) {
    const form = e.currentTarget;
    const password = (form.elements.namedItem("password") as HTMLInputElement).value;
    const confirm = (form.elements.namedItem("confirm_password") as HTMLInputElement).value;
    setMismatch(confirm.length > 0 && password !== confirm);
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const data = new FormData(e.currentTarget);
    const password = String(data.get("password"));
    const confirm = String(data.get("confirm_password"));

    if (password !== confirm) {
      setMismatch(true);
      setError("Password dan konfirmasi password tidak cocok.");
      return;
    }

    setError(null);
    setIsLoading(true);
    try {
      await register(String(data.get("name")), String(data.get("email")), password);
      router.replace("/trips");
    } catch (err) {
      if (err instanceof ApiError && err.status === 409) {
        setError("Email sudah terdaftar. Coba masuk saja.");
      } else if (err instanceof ApiError && err.status === 422) {
        setError(err.message);
      } else {
        setError(err instanceof Error ? err.message : "Gagal mendaftar. Coba lagi.");
      }
      setIsLoading(false);
    }
  }

  return (
    <div className="mx-auto w-full max-w-6xl px-6 pb-16">
      <Card className="mx-auto mt-16 w-full max-w-md p-6 shadow-sm sm:p-8">
        <h1 className="font-display text-2xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-50">
          Buat akun KelanaAI
        </h1>
        <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
          Sudah punya akun?{" "}
          <Link href="/login" className="font-medium text-emerald-600 hover:underline dark:text-emerald-400">
            Masuk
          </Link>
          .
        </p>

        <form onSubmit={handleSubmit} onInput={handleFormInput} className="mt-6 flex flex-col gap-4">
          <label className="flex flex-col gap-1.5">
            <span className="text-xs font-medium text-zinc-500 dark:text-zinc-400">Nama</span>
            <input type="text" name="name" required minLength={2} autoComplete="name" placeholder="Nama kamu" className={inputClass} />
          </label>

          <label className="flex flex-col gap-1.5">
            <span className="text-xs font-medium text-zinc-500 dark:text-zinc-400">Email</span>
            <input type="email" name="email" required autoComplete="email" placeholder="kamu@email.com" className={inputClass} />
          </label>

          <label className="flex flex-col gap-1.5">
            <span className="text-xs font-medium text-zinc-500 dark:text-zinc-400">Password</span>
            <PasswordInput name="password" required minLength={8} autoComplete="new-password" placeholder="Minimal 8 karakter" />
            <span className="text-xs text-zinc-400">Minimal 8 karakter.</span>
          </label>

          <label className="flex flex-col gap-1.5">
            <span className="text-xs font-medium text-zinc-500 dark:text-zinc-400">Konfirmasi Password</span>
            <PasswordInput
              name="confirm_password"
              required
              autoComplete="new-password"
              placeholder="Ulangi password"
              invalid={mismatch}
              aria-invalid={mismatch}
            />
            {mismatch && (
              <span className="text-xs text-red-600 dark:text-red-400">Password tidak cocok.</span>
            )}
          </label>

          {error && <ErrorBanner>{error}</ErrorBanner>}

          <Button type="submit" disabled={isLoading || mismatch} fullWidth>
            {isLoading && <Spinner />}
            {isLoading ? "Memproses..." : "Daftar"}
          </Button>
        </form>
      </Card>
    </div>
  );
}
