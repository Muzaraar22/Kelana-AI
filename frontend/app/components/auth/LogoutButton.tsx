"use client";

import { useState } from "react";
import { useAuth } from "../../providers";

export default function LogoutButton({
  className = "",
  onDone,
}: {
  className?: string;
  onDone?: () => void;
}) {
  const { logout } = useAuth();
  const [isLoading, setIsLoading] = useState(false);

  return (
    <button
      type="button"
      disabled={isLoading}
      onClick={async () => {
        setIsLoading(true);
        await logout();
        onDone?.();
      }}
      className={`text-sm font-medium text-zinc-600 transition-colors hover:text-zinc-900 disabled:opacity-50 dark:text-zinc-400 dark:hover:text-zinc-50 ${className}`}
    >
      {isLoading ? "Keluar..." : "Keluar"}
    </button>
  );
}
