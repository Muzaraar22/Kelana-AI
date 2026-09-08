"use client";

import { usePathname } from "next/navigation";
import Footer from "./Footer";

// The assistant chat is a full-viewport "app" view — a marketing footer below
// it just forces awkward page scroll, so it's dropped on /assistant(/*).
export default function SiteFooter() {
  const pathname = usePathname();
  if (pathname === "/assistant" || pathname?.startsWith("/assistant/")) return null;
  return <Footer />;
}
