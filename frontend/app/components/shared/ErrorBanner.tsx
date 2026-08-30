import type { ReactNode } from "react";

export default function ErrorBanner({ children }: { children: ReactNode }) {
  return (
    <div className="w-full rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700 ring-1 ring-red-200 dark:bg-red-500/10 dark:text-red-400 dark:ring-red-500/20">
      {children}
    </div>
  );
}
