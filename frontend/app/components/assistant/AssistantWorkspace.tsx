"use client";

import { useCallback, useEffect, useState } from "react";
import { listConversations, type ConversationSummary } from "../../lib/api";
import ConversationSidebar from "./ConversationSidebar";
import AssistantChat from "./AssistantChat";

// Owns the state shared between the sidebar and the chat panel: which
// conversation is active, and the sidebar's list (kept in sync locally on
// create/rename/delete/touch so it never needs a full refetch mid-chat).
export default function AssistantWorkspace() {
  const [conversations, setConversations] = useState<ConversationSummary[]>([]);
  const [loadingList, setLoadingList] = useState(true);
  const [activeId, setActiveId] = useState<number | null>(null);

  useEffect(() => {
    listConversations()
      .then(setConversations)
      .catch(() => setConversations([]))
      .finally(() => setLoadingList(false));
  }, []);

  const handleCreated = useCallback((id: number, title: string) => {
    const now = new Date().toISOString();
    setActiveId(id);
    setConversations((prev) => [{ id, title, created_at: now, updated_at: now }, ...prev]);
  }, []);

  const handleTouched = useCallback((id: number) => {
    const now = new Date().toISOString();
    setConversations((prev) =>
      [...prev]
        .map((c) => (c.id === id ? { ...c, updated_at: now } : c))
        .sort((a, b) => (a.updated_at < b.updated_at ? 1 : -1))
    );
  }, []);

  const handleRenamed = useCallback((id: number, title: string) => {
    setConversations((prev) => prev.map((c) => (c.id === id ? { ...c, title } : c)));
  }, []);

  const handleDeleted = useCallback((id: number) => {
    setConversations((prev) => prev.filter((c) => c.id !== id));
    setActiveId((current) => (current === id ? null : current));
  }, []);

  const activeTitle = conversations.find((c) => c.id === activeId)?.title ?? null;

  return (
    <div className="flex min-h-0 w-full flex-1 flex-col gap-4 sm:flex-row">
      <ConversationSidebar
        conversations={conversations}
        loading={loadingList}
        activeId={activeId}
        onSelect={setActiveId}
        onNewChat={() => setActiveId(null)}
        onRenamed={handleRenamed}
        onDeleted={handleDeleted}
      />
      <div className="flex min-h-0 flex-1 flex-col rounded-2xl border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900 sm:p-5">
        <AssistantChat
          // remount on conversation switch (including a self-created one) so
          // each conversation gets a clean local-state slate — its history is
          // then fetched fresh by the load-effect inside AssistantChat
          key={activeId ?? "new"}
          conversationId={activeId}
          conversationTitle={activeTitle}
          onConversationCreated={handleCreated}
          onConversationTouched={handleTouched}
        />
      </div>
    </div>
  );
}
