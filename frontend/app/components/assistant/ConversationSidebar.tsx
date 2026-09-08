"use client";

import { useState } from "react";
import { deleteConversation, renameConversation, type ConversationSummary } from "../../lib/api";
import Icon from "../shared/Icon";

type ConversationSidebarProps = {
  conversations: ConversationSummary[];
  loading: boolean;
  activeId: number | null;
  onSelect: (id: number) => void;
  onNewChat: () => void;
  onRenamed: (id: number, title: string) => void;
  onDeleted: (id: number) => void;
  // present in the mobile drawer; the close button is hidden at >= sm anyway
  onClose?: () => void;
};

export default function ConversationSidebar({
  conversations,
  loading,
  activeId,
  onSelect,
  onNewChat,
  onRenamed,
  onDeleted,
  onClose,
}: ConversationSidebarProps) {
  const [editingId, setEditingId] = useState<number | null>(null);
  const [draftTitle, setDraftTitle] = useState("");
  const [deletingId, setDeletingId] = useState<number | null>(null);

  function startRename(c: ConversationSummary) {
    setEditingId(c.id);
    setDraftTitle(c.title);
  }

  async function commitRename(id: number) {
    const title = draftTitle.trim();
    setEditingId(null);
    if (!title) return;
    try {
      await renameConversation(id, title);
      onRenamed(id, title);
    } catch {
      // sidebar just keeps the old title on failure
    }
  }

  async function handleDelete(id: number) {
    if (!confirm("Hapus percakapan ini?")) return;
    setDeletingId(id);
    try {
      await deleteConversation(id);
      onDeleted(id);
    } catch {
      alert("Gagal menghapus percakapan. Coba lagi.");
    } finally {
      setDeletingId(null);
    }
  }

  return (
    <aside className="flex h-full w-full flex-col overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-xl dark:border-zinc-800 dark:bg-zinc-900 sm:shadow-none">
      <div className="flex items-center gap-2 border-b border-zinc-100 p-3 dark:border-zinc-800">
        <button
          type="button"
          onClick={onNewChat}
          className="flex flex-1 items-center justify-center gap-1.5 rounded-xl bg-emerald-600 px-3 py-2 text-sm font-semibold text-white transition-colors hover:bg-emerald-500"
        >
          <Icon name="plus" className="h-4 w-4" />
          Chat baru
        </button>
        {onClose && (
          <button
            type="button"
            onClick={onClose}
            aria-label="Tutup daftar percakapan"
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl text-zinc-500 hover:bg-zinc-100 dark:text-zinc-400 dark:hover:bg-zinc-800 sm:hidden"
          >
            <Icon name="x" className="h-4 w-4" />
          </button>
        )}
      </div>

      <div className="flex-1 overflow-y-auto p-2">
        {loading && <p className="py-6 text-center text-xs text-zinc-400">Memuat...</p>}

        {!loading && conversations.length === 0 && (
          <div className="flex flex-col items-center gap-2 px-3 py-8 text-center text-xs text-zinc-400">
            <Icon name="message-circle" className="h-5 w-5" />
            Belum ada percakapan.
          </div>
        )}

        <ul className="space-y-1">
          {conversations.map((c) => {
            const isActive = c.id === activeId;
            const isEditing = editingId === c.id;

            return (
              <li key={c.id}>
                <div
                  className={`group flex items-center gap-1 rounded-xl px-2.5 py-2 text-sm transition-colors ${
                    isActive
                      ? "bg-emerald-50 text-emerald-900 dark:bg-emerald-500/15 dark:text-emerald-200"
                      : "text-zinc-700 hover:bg-zinc-100 dark:text-zinc-300 dark:hover:bg-zinc-800"
                  }`}
                >
                  {isEditing ? (
                    <input
                      autoFocus
                      value={draftTitle}
                      onChange={(e) => setDraftTitle(e.target.value)}
                      onBlur={() => commitRename(c.id)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          e.preventDefault();
                          commitRename(c.id);
                        }
                        if (e.key === "Escape") setEditingId(null);
                      }}
                      maxLength={120}
                      className="min-w-0 flex-1 rounded-md border border-emerald-400 bg-white px-1.5 py-0.5 text-sm text-zinc-900 outline-none dark:bg-zinc-900 dark:text-zinc-50"
                    />
                  ) : (
                    <button
                      type="button"
                      onClick={() => onSelect(c.id)}
                      className="min-w-0 flex-1 truncate text-left"
                      title={c.title}
                    >
                      {c.title}
                    </button>
                  )}

                  {!isEditing && (
                    <div className="hidden shrink-0 items-center gap-0.5 group-hover:flex">
                      <button
                        type="button"
                        onClick={() => startRename(c)}
                        aria-label="Ganti nama percakapan"
                        className="rounded-md p-1 text-zinc-400 hover:bg-zinc-200 hover:text-zinc-700 dark:hover:bg-zinc-700 dark:hover:text-zinc-100"
                      >
                        <Icon name="pencil" className="h-3.5 w-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDelete(c.id)}
                        disabled={deletingId === c.id}
                        aria-label="Hapus percakapan"
                        className="rounded-md p-1 text-zinc-400 hover:bg-red-100 hover:text-red-600 disabled:opacity-50 dark:hover:bg-red-500/10 dark:hover:text-red-400"
                      >
                        <Icon name="trash" className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  )}
                </div>
              </li>
            );
          })}
        </ul>
      </div>
    </aside>
  );
}
