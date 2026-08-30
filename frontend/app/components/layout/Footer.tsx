import Link from "next/link";

export default function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="border-t border-black/[.06] bg-zinc-50 dark:border-white/[.08] dark:bg-zinc-950">
      <div className="mx-auto w-full max-w-6xl px-6 py-10">
        <div className="flex flex-col gap-8 sm:flex-row sm:justify-between">
          <div className="max-w-xs">
            <Link href="/" className="flex items-center gap-2 text-lg font-semibold text-zinc-900 dark:text-zinc-50">
              <span className="flex h-8 w-8 items-center justify-center rounded-full bg-emerald-600 text-sm text-white">
                K
              </span>
              KelanaAI
            </Link>
            <p className="mt-3 text-sm leading-6 text-zinc-600 dark:text-zinc-400">
              Rencanakan perjalananmu lebih mudah dengan rekomendasi trip berbasis AI.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-8 sm:grid-cols-2">
            <div>
              <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-50">Produk</h3>
              <ul className="mt-3 space-y-2 text-sm text-zinc-600 dark:text-zinc-400">
                <li>
                  <Link href="/#destinasi" className="transition-colors hover:text-zinc-900 dark:hover:text-zinc-50">
                    Cari Trip
                  </Link>
                </li>
                <li>
                  <Link href="/trips" className="transition-colors hover:text-zinc-900 dark:hover:text-zinc-50">
                    Trip Saya
                  </Link>
                </li>
                <li>
                  <Link href="/#cara-kerja" className="transition-colors hover:text-zinc-900 dark:hover:text-zinc-50">
                    Cara Kerja
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-50">Perusahaan</h3>
              <ul className="mt-3 space-y-2 text-sm text-zinc-600 dark:text-zinc-400">
                <li>
                  <a href="#" className="transition-colors hover:text-zinc-900 dark:hover:text-zinc-50">
                    Tentang Kami
                  </a>
                </li>
                <li>
                  <a href="#" className="transition-colors hover:text-zinc-900 dark:hover:text-zinc-50">
                    Kontak
                  </a>
                </li>
              </ul>
            </div>
          </div>
        </div>

        <div className="mt-10 border-t border-black/[.06] pt-6 text-sm text-zinc-500 dark:border-white/[.08] dark:text-zinc-400">
          © {year} KelanaAI. All rights reserved.
        </div>
      </div>
    </footer>
  );
}
