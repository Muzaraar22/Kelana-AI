import type { Metadata } from "next";
import { Inter, Fraunces } from "next/font/google";
import "./globals.css";
import Header from "./components/layout/Header";
import SiteFooter from "./components/layout/SiteFooter";
import { Providers } from "./providers";
import { getSession } from "./lib/session";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

const fraunces = Fraunces({
  variable: "--font-fraunces",
  subsets: ["latin"],
  display: "swap",
  style: ["normal", "italic"],
});

export const metadata: Metadata = {
  title: "KelanaAI - Rencanakan Perjalananmu dengan AI",
  description: "KelanaAI membantu kamu merencanakan trip dengan rekomendasi destinasi, transportasi, dan budget berbasis AI.",
};

export default async function RootLayout({ children }: LayoutProps<"/">) {
  const user = await getSession();

  return (
    <html
      lang="id"
      className={`${inter.variable} ${fraunces.variable} h-full scroll-smooth antialiased`}
    >
      <body className="flex min-h-full flex-col bg-white font-sans text-zinc-900 dark:bg-zinc-950 dark:text-zinc-100">
        <Providers initialUser={user}>
          <Header />
          <main className="flex flex-1 flex-col">{children}</main>
          <SiteFooter />
        </Providers>
      </body>
    </html>
  );
}
