export type CategoryTheme = {
  badge: string;
  gradient: string;
  icon: string;
};

const themes: Record<string, CategoryTheme> = {
  Backpacker: {
    badge: "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400",
    gradient: "from-emerald-600 to-teal-600",
    icon: "🎒",
  },
  Standard: {
    badge: "bg-sky-100 text-sky-700 dark:bg-sky-500/10 dark:text-sky-400",
    gradient: "from-sky-600 to-blue-600",
    icon: "🧳",
  },
  Luxury: {
    badge: "bg-violet-100 text-violet-700 dark:bg-violet-500/10 dark:text-violet-400",
    gradient: "from-violet-600 to-fuchsia-600",
    icon: "✨",
  },
};

const fallback: CategoryTheme = {
  badge: "bg-zinc-100 text-zinc-700 dark:bg-zinc-500/10 dark:text-zinc-300",
  gradient: "from-zinc-700 to-zinc-800",
  icon: "🧭",
};

export function getCategoryTheme(category: string): CategoryTheme {
  return themes[category] ?? fallback;
}
