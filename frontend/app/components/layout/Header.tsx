"use client";

import { useState } from "react";
import Link from "next/link";
import Button from "../shared/Button";
import Logo from "../shared/Logo";
import LogoutButton from "../auth/LogoutButton";
import { useAuth } from "../../providers";

export default function Header() {
  const [isOpen, setIsOpen] = useState(false);
  const { user } = useAuth();
  const close = () => setIsOpen(false);

  return (
    <header className="sticky top-0 z-20 border-b border-black/[.06] bg-white/80 backdrop-blur dark:border-white/[.08] dark:bg-black/80">
      <div className="mx-auto flex h-16 w-full max-w-6xl items-center justify-between px-6">
        <Link href="/" onClick={close} aria-label="KelanaAI beranda">
          <Logo />
        </Link>

        <nav className="hidden items-center gap-8 text-sm font-medium text-zinc-600 dark:text-zinc-400 sm:flex">
          <Link href="/#cara-kerja" className="transition-colors hover:text-zinc-900 dark:hover:text-zinc-50">
            Cara Kerja
          </Link>

          {user ? (
            <>
              <Link href="/trips" className="transition-colors hover:text-zinc-900 dark:hover:text-zinc-50">
                Trip Saya
              </Link>
              <Link href="/assistant" className="transition-colors hover:text-zinc-900 dark:hover:text-zinc-50">
                Asisten
              </Link>
              <Link href="/profile" className="transition-colors hover:text-zinc-900 dark:hover:text-zinc-50">
                Profil
              </Link>
              <LogoutButton />
              <Button href="/plan" variant="secondary" size="sm" pill>
                Rencanakan Trip
              </Button>
            </>
          ) : (
            <>
              <Link href="/login" className="transition-colors hover:text-zinc-900 dark:hover:text-zinc-50">
                Masuk
              </Link>
              <Button href="/register" variant="secondary" size="sm" pill>
                Daftar
              </Button>
            </>
          )}
        </nav>

        <button
          type="button"
          onClick={() => setIsOpen((v) => !v)}
          aria-label={isOpen ? "Tutup menu" : "Buka menu"}
          aria-expanded={isOpen}
          className="flex h-9 w-9 items-center justify-center rounded-lg text-zinc-700 hover:bg-black/5 dark:text-zinc-300 dark:hover:bg-white/10 sm:hidden"
        >
          <svg viewBox="0 0 24 24" fill="none" strokeWidth={2} stroke="currentColor" className="h-5 w-5">
            {isOpen ? (
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            ) : (
              <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5M3.75 17.25h16.5" />
            )}
          </svg>
        </button>
      </div>

      {isOpen && (
        <nav className="absolute inset-x-0 top-full border-t border-black/[.06] bg-white/80 px-6 py-4 backdrop-blur dark:border-white/[.08] dark:bg-black/80 sm:hidden">
          <div className="flex flex-col gap-4 text-sm font-medium text-zinc-600 dark:text-zinc-400">
            <Link href="/#cara-kerja" onClick={close} className="transition-colors hover:text-zinc-900 dark:hover:text-zinc-50">
              Cara Kerja
            </Link>

            {user ? (
              <>
                <Link href="/trips" onClick={close} className="transition-colors hover:text-zinc-900 dark:hover:text-zinc-50">
                  Trip Saya
                </Link>
                <Link href="/assistant" onClick={close} className="transition-colors hover:text-zinc-900 dark:hover:text-zinc-50">
                  Asisten
                </Link>
                <Link href="/profile" onClick={close} className="transition-colors hover:text-zinc-900 dark:hover:text-zinc-50">
                  Profil
                </Link>
                <LogoutButton className="self-start" onDone={close} />
                <Button href="/plan" variant="secondary" size="sm" pill onClick={close} className="self-start">
                  Rencanakan Trip
                </Button>
              </>
            ) : (
              <>
                <Link href="/login" onClick={close} className="transition-colors hover:text-zinc-900 dark:hover:text-zinc-50">
                  Masuk
                </Link>
                <Button href="/register" variant="secondary" size="sm" pill onClick={close} className="self-start">
                  Daftar
                </Button>
              </>
            )}
          </div>
        </nav>
      )}
    </header>
  );
}
