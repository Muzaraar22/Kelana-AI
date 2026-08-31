type LogoProps = {
  /** ukuran mark dalam px */
  size?: number;
  withWordmark?: boolean;
  className?: string;
};

export default function Logo({ size = 32, withWordmark = true, className = "" }: LogoProps) {
  return (
    <span className={`inline-flex items-center gap-2.5 ${className}`}>
      <span
        className="flex items-center justify-center rounded-xl bg-zinc-900 text-white dark:bg-white dark:text-zinc-900"
        style={{ width: size, height: size }}
      >
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth={1.75}
          strokeLinecap="round"
          strokeLinejoin="round"
          style={{ width: size * 0.56, height: size * 0.56 }}
          aria-hidden="true"
        >
          <path d="M21 3 3 10.5l7.5 3L13.5 21 21 3Z" />
        </svg>
      </span>
      {withWordmark && (
        <span className="font-display text-lg font-semibold tracking-tight text-zinc-900 dark:text-zinc-50">
          Kelana<span className="text-emerald-600 dark:text-emerald-500">AI</span>
        </span>
      )}
    </span>
  );
}
