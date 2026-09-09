export type CategoryTheme = {
  /** pill badge kategori — 1 aksen warna per kategori */
  badge: string;
  /** background header detail trip — gelap dgn semburat warna kategori */
  gradient: string;
  /** badge kategori di atas header gelap detail trip */
  heroBadge: string;
  /** nama icon di komponen shared/Icon */
  iconName: string;
};

const themes: Record<string, CategoryTheme> = {
  Backpacker: {
    badge:
      "bg-emerald-50 text-emerald-700 ring-1 ring-inset ring-emerald-600/20 dark:bg-emerald-500/10 dark:text-emerald-300 dark:ring-emerald-400/20",
    gradient: "from-emerald-950 via-zinc-900 to-zinc-900 via-70%",
    heroBadge: "bg-emerald-400/15 text-emerald-200 ring-1 ring-inset ring-emerald-300/25",
    iconName: "compass",
  },
  Standard: {
    badge:
      "bg-sky-50 text-sky-700 ring-1 ring-inset ring-sky-600/20 dark:bg-sky-500/10 dark:text-sky-300 dark:ring-sky-400/20",
    gradient: "from-sky-950 via-zinc-900 to-zinc-900 via-70%",
    heroBadge: "bg-sky-400/15 text-sky-200 ring-1 ring-inset ring-sky-300/25",
    iconName: "briefcase",
  },
  Luxury: {
    badge:
      "bg-amber-50 text-amber-800 ring-1 ring-inset ring-amber-600/20 dark:bg-amber-500/10 dark:text-amber-300 dark:ring-amber-400/20",
    gradient: "from-amber-950 via-zinc-900 to-zinc-900 via-70%",
    heroBadge: "bg-amber-400/15 text-amber-200 ring-1 ring-inset ring-amber-300/25",
    iconName: "gem",
  },
};

const fallback: CategoryTheme = {
  badge:
    "bg-zinc-100 text-zinc-700 ring-1 ring-inset ring-zinc-300 dark:bg-zinc-800 dark:text-zinc-300 dark:ring-zinc-700",
  gradient: "from-zinc-900 to-zinc-800",
  heroBadge: "bg-white/10 text-white ring-1 ring-inset ring-white/20",
  iconName: "compass",
};

export function getCategoryTheme(category: string): CategoryTheme {
  return themes[category] ?? fallback;
}
