"use client";

import { useEffect, useRef, useState } from "react";
import { ApiError, getConversation, sendMessage, type ChatMessage } from "../../lib/api";
import { formatMessageTime } from "../../lib/dateFormat";
import RichText from "./RichText";
import TypingDots from "../shared/TypingDots";
import Icon from "../shared/Icon";

// ChatMessage rows come straight from the DB; "error" bubbles are local-only
// (never sent to / read from the API) and vanish on the next reload.
type DisplayMessage = ChatMessage | { id: number; role: "error"; text: string };

type AssistantChatProps = {
  conversationId: number | null;
  conversationTitle: string | null;
  onConversationCreated: (id: number, title: string) => void;
  onConversationTouched: (id: number) => void;
};

const SUGGESTIONS = [
  "Rekomendasi destinasi wisata di Indonesia",
  "Kapan waktu terbaik berkunjung ke Bali?",
  "Tips hemat budget saat traveling",
];

const MAX_LENGTH = 500;

function sourceLabel(source: string): string {
  try {
    const url = new URL(source);
    const file = url.pathname.split("/").filter(Boolean).pop();
    return decodeURIComponent(file || url.hostname);
  } catch {
    return source.split("/").filter(Boolean).pop() || source;
  }
}

export default function AssistantChat({
  conversationId,
  conversationTitle,
  onConversationCreated,
  onConversationTouched,
}: AssistantChatProps) {
  const [messages, setMessages] = useState<DisplayMessage[]>([]);
  const [input, setInput] = useState("");
  const [pending, setPending] = useState(false);
  // known synchronously at mount (this component remounts per conversation,
  // see the `key` on <AssistantChat> in AssistantWorkspace) — no need to flip
  // it to true from inside the effect below
  const [loadingHistory, setLoadingHistory] = useState(() => conversationId !== null);

  const nextLocalId = useRef(-1);
  const scrollRef = useRef<HTMLDivElement>(null);
  // true right after a history load completes -> next scroll is an instant
  // jump; false otherwise -> next scroll is the smooth send/reply one
  const justLoadedRef = useRef(false);

  // Fetch history for the active conversation. AssistantWorkspace remounts
  // this component (via `key`) whenever the active conversation changes, so
  // there's nothing to reset here for the `conversationId === null` (fresh
  // chat) case — the initial `useState([])` above is already correct.
  useEffect(() => {
    if (conversationId === null) return;

    let cancelled = false;
    justLoadedRef.current = true;

    getConversation(conversationId)
      .then((detail) => {
        if (!cancelled) setMessages(detail.messages);
      })
      .catch(() => {
        if (!cancelled) setMessages([]);
      })
      .finally(() => {
        if (!cancelled) setLoadingHistory(false);
      });

    return () => {
      cancelled = true;
    };
  }, [conversationId]);

  // two-scenario auto-scroll: instant jump right after a history load/switch,
  // smooth scroll for everything else (sending / receiving a reply)
  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;

    if (justLoadedRef.current) {
      el.scrollTop = el.scrollHeight;
      justLoadedRef.current = false;
    } else {
      el.scrollTo({ top: el.scrollHeight, behavior: "smooth" });
    }
  }, [messages, pending]);

  async function send(raw: string) {
    const question = raw.trim();
    if (!question || pending) return;

    const optimisticId = nextLocalId.current--;
    setMessages((prev) => [
      ...prev,
      { id: optimisticId, role: "user", content: question, sources: null, created_at: new Date().toISOString() },
    ]);
    setInput("");
    setPending(true);

    const wasNewConversation = conversationId === null;

    try {
      const res = await sendMessage(question, conversationId);
      setMessages((prev) => [
        ...prev.filter((m) => m.id !== optimisticId),
        res.user_message,
        res.assistant_message,
      ]);

      if (wasNewConversation) {
        // AssistantWorkspace remounts us (key = conversation id) once this
        // fires — the messages set just above are discarded, and the fresh
        // instance's load-effect re-fetches this conversation from the DB.
        onConversationCreated(res.conversation_id, res.conversation_title);
      } else {
        onConversationTouched(res.conversation_id);
      }
    } catch (err) {
      const text =
        err instanceof ApiError
          ? err.message
          : "Gagal menghubungi asisten. Periksa koneksi lalu coba lagi.";
      setMessages((prev) => [...prev, { id: nextLocalId.current--, role: "error", text }]);
    } finally {
      setPending(false);
    }
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      send(input);
    }
  }

  const isEmpty = messages.length === 0 && !loadingHistory;

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <div className="mb-3 flex items-center justify-between border-b border-zinc-100 pb-3 dark:border-zinc-800">
        <h2 className="truncate text-sm font-semibold text-zinc-900 dark:text-zinc-50">
          {conversationTitle ?? "Percakapan baru"}
        </h2>
      </div>

      <div ref={scrollRef} className="flex-1 space-y-4 overflow-y-auto pb-4">
        {loadingHistory && (
          <p className="py-10 text-center text-sm text-zinc-400">Memuat percakapan...</p>
        )}

        {isEmpty && (
          <div className="rounded-2xl border border-dashed border-zinc-300 p-6 text-center dark:border-zinc-700">
            <Icon name="sparkles" className="mx-auto h-6 w-6 text-emerald-500" />
            <p className="mt-2 text-sm font-medium text-zinc-900 dark:text-zinc-50">
              Tanya apa saja soal perjalananmu
            </p>
            <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">
              Jawaban diambil dari knowledge base KelanaAI.
            </p>
            <div className="mt-4 flex flex-wrap justify-center gap-2">
              {SUGGESTIONS.map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => send(s)}
                  className="rounded-full border border-zinc-200 px-3 py-1.5 text-xs text-zinc-700 transition-colors hover:border-emerald-400 hover:text-emerald-700 dark:border-zinc-700 dark:text-zinc-300 dark:hover:border-emerald-500 dark:hover:text-emerald-300"
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
        )}

        {messages.map((message) => {
          if (message.role === "user") {
            return (
              <div key={message.id} className="flex justify-end">
                <div className="flex max-w-[85%] flex-col items-end gap-1">
                  <div className="whitespace-pre-wrap rounded-2xl rounded-br-sm bg-emerald-600 px-4 py-2.5 text-sm leading-6 text-white">
                    {message.content}
                  </div>
                  <span className="text-[11px] text-zinc-400">{formatMessageTime(message.created_at)}</span>
                </div>
              </div>
            );
          }

          if (message.role === "error") {
            return (
              <div key={message.id} className="flex justify-start">
                <div className="max-w-[85%] rounded-2xl rounded-bl-sm bg-red-50 px-4 py-2.5 text-sm text-red-700 ring-1 ring-red-200 dark:bg-red-500/10 dark:text-red-400 dark:ring-red-500/20">
                  {message.text}
                </div>
              </div>
            );
          }

          return (
            <div key={message.id} className="flex justify-start">
              <div className="flex max-w-[85%] flex-col items-start gap-1">
                <div className="rounded-2xl rounded-bl-sm border border-zinc-200 bg-white px-4 py-3 dark:border-zinc-800 dark:bg-zinc-900">
                  <RichText text={message.content} />
                  {message.sources && message.sources.length > 0 && (
                    <div className="mt-3 border-t border-zinc-100 pt-2 dark:border-zinc-800">
                      <p className="text-[11px] font-medium uppercase tracking-wide text-zinc-400">
                        Sumber
                      </p>
                      <ul className="mt-1 space-y-0.5">
                        {message.sources.map((source) => (
                          <li
                            key={source}
                            className="flex items-center gap-1.5 text-xs text-zinc-500 dark:text-zinc-400"
                          >
                            <Icon name="map-pin" className="h-3 w-3 shrink-0 text-zinc-400" />
                            <span className="truncate">{sourceLabel(source)}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
                <span className="text-[11px] text-zinc-400">{formatMessageTime(message.created_at)}</span>
              </div>
            </div>
          );
        })}

        {pending && (
          <div className="flex justify-start">
            <div className="rounded-2xl rounded-bl-sm border border-zinc-200 bg-white px-4 py-3 text-emerald-600 dark:border-zinc-800 dark:bg-zinc-900 dark:text-emerald-400">
              <TypingDots />
            </div>
          </div>
        )}
      </div>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          send(input);
        }}
        className="sticky bottom-0 border-t border-zinc-100 bg-white pt-3 dark:border-zinc-800 dark:bg-zinc-900"
      >
        <div className="flex items-end gap-2 rounded-2xl border border-zinc-200 bg-zinc-50 p-2 focus-within:border-emerald-500 focus-within:ring-2 focus-within:ring-emerald-500/20 dark:border-zinc-700 dark:bg-zinc-900">
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value.slice(0, MAX_LENGTH))}
            onKeyDown={handleKeyDown}
            rows={1}
            placeholder="Tulis pertanyaanmu..."
            className="max-h-32 flex-1 resize-none bg-transparent px-2 py-1.5 text-sm text-zinc-900 outline-none placeholder:text-zinc-400 dark:text-zinc-50"
          />
          <button
            type="submit"
            disabled={pending || input.trim().length === 0}
            aria-label="Kirim pertanyaan"
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-emerald-600 text-white transition-colors hover:bg-emerald-500 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <Icon name="arrow-right" className="h-4 w-4" />
          </button>
        </div>
        <p className="mt-1.5 px-1 text-[11px] text-zinc-400">
          Enter untuk kirim, Shift+Enter untuk baris baru.
        </p>
      </form>
    </div>
  );
}
