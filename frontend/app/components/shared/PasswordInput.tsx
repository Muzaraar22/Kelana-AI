"use client";

import { useState, type InputHTMLAttributes } from "react";
import Icon from "./Icon";

type PasswordInputProps = Omit<InputHTMLAttributes<HTMLInputElement>, "type"> & {
  invalid?: boolean;
};

// Password field with a show/hide toggle. Uncontrolled by default (works with
// FormData via `name`), same visual language as the shared Select component.
export default function PasswordInput({ className = "", invalid = false, ...rest }: PasswordInputProps) {
  const [visible, setVisible] = useState(false);

  const borderClass = invalid
    ? "border-red-400 focus:border-red-500 focus:ring-red-500/20 dark:border-red-500/60"
    : "border-zinc-200 focus:border-emerald-500 focus:ring-emerald-500/20 dark:border-zinc-700";

  return (
    <div className="relative">
      <input
        type={visible ? "text" : "password"}
        className={`w-full rounded-lg border ${borderClass} bg-zinc-50 py-2.5 pl-3 pr-10 text-sm text-zinc-900 outline-none transition-colors placeholder:text-zinc-400 focus:ring-2 dark:bg-zinc-800 dark:text-zinc-50 ${className}`}
        {...rest}
      />
      <button
        type="button"
        // keep the input focused when toggling
        onMouseDown={(e) => e.preventDefault()}
        onClick={() => setVisible((v) => !v)}
        aria-label={visible ? "Sembunyikan password" : "Tampilkan password"}
        aria-pressed={visible}
        className="absolute right-2 top-1/2 flex h-7 w-7 -translate-y-1/2 items-center justify-center rounded-md text-zinc-400 transition-colors hover:text-zinc-600 dark:hover:text-zinc-200"
      >
        <Icon name={visible ? "eye-off" : "eye"} className="h-4 w-4" />
      </button>
    </div>
  );
}
