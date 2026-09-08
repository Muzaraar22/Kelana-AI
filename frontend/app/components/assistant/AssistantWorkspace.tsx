"use client";

import { useCallback, useEffect, useState } from "react";
import { listConversations, type ConversationSummary } from "../../lib/api";
import ConversationSidebar from "./ConversationSidebar";
import AssistantChat from "./AssistantChat";

// Owns the state shared between the sidebar and the chat panel: which
// conversation is active, and the sidebar's list (kept in sync locally on
// create/rename/delete/touch so it never needs a full refetch mid-chat).
// On mobile the sidebar is an off-canvas drawer; on >= sm it's a static column.
export default function AssistantWorkspace() {
  const [conversations, setConversations] = useState<ConversationSummary[]>([]);
  const [loadingList, setLoadingList] = useState(true);
  const [activeId, setActiveId] = useState<number | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);

  useEffect(() => {
    listConversations()
      .then(setConversations)
      .catch(() => setConversations([]))
      .finally(() => setLoadingList(false));
  }, []);

  // Esc closes the mobile drawer
  useEffect(() => {
    if (!drawerOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setDrawerOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [drawerOpen]);

  const handleSelect = useCallback((id: number) => {
    setActiveId(id);
    setDrawerOpen(false);
  }, []);

  const handleNewChat = useCallback(() => {
    setActiveId(null);
    setDrawerOpen(false);
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
    <div className="flex min-h-0 w-full flex-1 sm:gap-4">
      {/* mobile backdrop */}
      {drawerOpen && (
        <button
          type="button"
          aria-label="Tutup daftar percakapan"
          onClick={() => setDrawerOpen(false)}
          className="fixed inset-0 z-30 bg-black/40 sm:hidden"
        />
      )}

      {/* sidebar: off-canvas drawer on mobile, static column on >= sm */}
      <div
        className={`fixed inset-y-0 left-0 z-40 w-72 max-w-[85vw] p-3 transition-transform duration-200 ease-out sm:static sm:z-auto sm:w-64 sm:max-w-none sm:shrink-0 sm:p-0 sm:transition-none ${
          drawerOpen ? "translate-x-0" : "-translate-x-full sm:translate-x-0"
        }`}
      >
        <ConversationSidebar
          conversations={conversations}
          loading={loadingList}
          activeId={activeId}
          onSelect={handleSelect}
          onNewChat={handleNewChat}
          onRenamed={handleRenamed}
          onDeleted={handleDeleted}
          onClose={() => setDrawerOpen(false)}
        />
      </div>

      <div className="flex min-h-0 flex-1 flex-col rounded-2xl border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900 sm:p-5">
        <AssistantChat
          // remount on conversation switch (including a self-created one) so
          // each conversation gets a clean local-state slate — its history is
          // then fetched fresh by the load-effect inside AssistantChat
          key={activeId ?? "new"}
          conversationId={activeId}
          conversationTitle={activeTitle}
          onOpenSidebar={() => setDrawerOpen(true)}
          onConversationCreated={handleCreated}
          onConversationTouched={handleTouched}
        />
      </div>
    </div>
  );
}
