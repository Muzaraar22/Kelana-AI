"use client";

import { useState } from "react";
import Link from "next/link";
import Button from "../shared/Button";
import Logo from "../shared/Logo";

const NAV_LINKS = [
  { href: "/#cara-kerja", label: "Cara Kerja" },
  { href: "/trips", label: "Trip Saya" },
];

export default function Header() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <header className="sticky top-0 z-20 border-b border-black/[.06] bg-white/80 backdrop-blur dark:border-white/[.08] dark:bg-black/80">
      <div className="mx-auto flex h-16 w-full max-w-6xl items-center justify-between px-6">
        <Link href="/" onClick={() => setIsOpen(false)} aria-label="KelanaAI beranda">
          <Logo />
        </Link>

        <nav className="hidden items-center gap-8 text-sm font-medium text-zinc-600 dark:text-zinc-400 sm:flex">
          {NAV_LINKS.map((link) => (
            <Link key={link.href} href={link.href} className="transition-colors hover:text-zinc-900 dark:hover:text-zinc-50">
              {link.label}
            </Link>
          ))}
          <Button href="/#destinasi" variant="secondary" size="sm" pill>
            Rencanakan Trip
          </Button>
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
            {NAV_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setIsOpen(false)}
                className="transition-colors hover:text-zinc-900 dark:hover:text-zinc-50"
              >
                {link.label}
              </Link>
            ))}
            <Button href="/#destinasi" variant="secondary" size="sm" pill onClick={() => setIsOpen(false)} className="self-start">
              Rencanakan Trip
            </Button>
          </div>
        </nav>
      )}
    </header>
  );
}
