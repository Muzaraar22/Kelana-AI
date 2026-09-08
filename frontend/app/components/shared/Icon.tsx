import type { SVGProps } from "react";

// line icons dgn gaya konsisten (stroke, currentColor) — pengganti semua emoji
const PATHS: Record<string, string> = {
  sunrise:
    "M12 2v8M5.6 10.2 4.2 8.8M18.4 10.2l1.4-1.4M3 16h1M20 16h1M4 20h16M8 13a4 4 0 0 1 8 0M8.5 6.5 12 3l3.5 3.5",
  sun: "M12 4V2M12 22v-2M6 6 4.5 4.5M19.5 19.5 18 18M4 12H2M22 12h-2M6 18l-1.5 1.5M19.5 4.5 18 6",
  moon: "M20 14.5A8 8 0 0 1 9.5 4a7 7 0 1 0 10.5 10.5Z",
  compass: "M12 22a10 10 0 1 0 0-20 10 10 0 0 0 0 20ZM16 8l-2.2 5.8L8 16l2.2-5.8L16 8Z",
  briefcase:
    "M4 8h16a1 1 0 0 1 1 1v10a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V9a1 1 0 0 1 1-1ZM9 8V6a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v2M3 13h18",
  gem: "M6 3h12l3.5 5.5L12 21 2.5 8.5 6 3ZM3 8.5h18M9 3l-2 5.5L12 21l5-12.5L15 3",
  user: "M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8ZM5 20a7 7 0 0 1 14 0",
  users:
    "M9 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8ZM2 20a7 7 0 0 1 14 0M17 4.5a4 4 0 0 1 0 7M22 20a7 7 0 0 0-5-6.7",
  heart:
    "M12 20.3 4.6 12.6a4.7 4.7 0 0 1 0-6.6 4.6 4.6 0 0 1 6.5 0l.9.9.9-.9a4.6 4.6 0 0 1 6.5 0 4.7 4.7 0 0 1 0 6.6Z",
  "map-pin": "M12 21s7-5.7 7-11a7 7 0 1 0-14 0c0 5.3 7 11 7 11ZM12 13a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z",
  "arrow-left": "M19 12H5M11 18l-6-6 6-6",
  "arrow-right": "M5 12h14M13 6l6 6-6 6",
  plus: "M12 5v14M5 12h14",
  calendar: "M4 6a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v13a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V6ZM3 10h18M8 3v4M16 3v4",
  sparkles: "M12 3l1.9 4.6L18.5 9.5l-4.6 1.9L12 16l-1.9-4.6L5.5 9.5l4.6-1.9L12 3ZM19 15l.9 2.1L22 18l-2.1.9L19 21l-.9-2.1L16 18l2.1-.9L19 15Z",
  pencil: "M12 20h9M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4Z",
  trash: "M3 6h18M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2m3 0-1 14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2L4 6h16Z",
  "message-circle": "M21 12a8.5 8.5 0 0 1-8.5 8.5c-1.3 0-2.5-.3-3.6-.8L3 21l1.4-4.2A8.5 8.5 0 1 1 21 12Z",
  "panel-left": "M4 5a1 1 0 0 1 1-1h14a1 1 0 0 1 1 1v14a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V5ZM10 4v16",
  x: "M6 6l12 12M18 6L6 18",
  eye: "M2.5 12S6 5 12 5s9.5 7 9.5 7-3.5 7-9.5 7-9.5-7-9.5-7ZM12 14.5a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5Z",
  "eye-off": "M3 3l18 18M10.6 10.7a2 2 0 0 0 2.75 2.9M9.4 5.3A9.3 9.3 0 0 1 12 5c6 0 9.5 7 9.5 7a16.7 16.7 0 0 1-2.16 2.98M6.2 6.2A16.4 16.4 0 0 0 2.5 12S6 19 12 19a9.1 9.1 0 0 0 3.2-.57",
};

type IconProps = SVGProps<SVGSVGElement> & {
  name: keyof typeof PATHS | (string & {});
};

export default function Icon({ name, className = "h-4 w-4", ...props }: IconProps) {
  const d = PATHS[name] ?? PATHS.compass;
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.75}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
      {...props}
    >
      <path d={d} />
    </svg>
  );
}
