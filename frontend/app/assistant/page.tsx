import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getSession } from "../lib/session";
import AssistantWorkspace from "../components/assistant/AssistantWorkspace";
import Icon from "../components/shared/Icon";

export const metadata: Metadata = {
  title: "Asisten Perjalanan - KelanaAI",
  description: "Tanya jawab seputar perjalanan berbasis knowledge base KelanaAI.",
};

export default async function AssistantPage() {
  const user = await getSession();
  if (!user) redirect("/login?next=/assistant");

  return (
    <div className="mx-auto flex h-[calc(100vh-4rem)] min-h-[600px] w-full max-w-6xl flex-col px-6 py-6">
      <div className="mb-4 flex items-center gap-3">
        <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-100 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-400">
          <Icon name="sparkles" className="h-5 w-5" />
        </span>
        <div>
          <h1 className="font-display text-xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-50 sm:text-2xl">
            Asisten Perjalanan
          </h1>
          <p className="text-sm text-zinc-600 dark:text-zinc-400">
            Halo {user.name.split(" ")[0]}, tanya apa saja soal perjalananmu.
          </p>
        </div>
      </div>

      <AssistantWorkspace />
    </div>
  );
}
