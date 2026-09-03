"use client";

import { useEffect, useRef, useState } from "react";
import { ApiError, askAssistant } from "../../lib/api";
import RichText from "./RichText";
import TypingDots from "../shared/TypingDots";
import Icon from "../shared/Icon";

type Message =
  | { id: number; role: "user"; text: string }
  | { id: number; role: "assistant"; text: string; sources: string[] }
  | { id: number; role: "error"; text: string };

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

export default function AssistantChat() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [pending, setPending] = useState(false);
  const nextId = useRef(1);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, pending]);

  async function send(raw: string) {
    const question = raw.trim();
    if (!question || pending) return;

    const userMessage: Message = { id: nextId.current++, role: "user", text: question };
    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setPending(true);

    try {
      const res = await askAssistant(question);
      setMessages((prev) => [
        ...prev,
        { id: nextId.current++, role: "assistant", text: res.answer, sources: res.sources },
      ]);
    } catch (err) {
      const text =
        err instanceof ApiError
          ? err.message
          : "Gagal menghubungi asisten. Periksa koneksi lalu coba lagi.";
      setMessages((prev) => [...prev, { id: nextId.current++, role: "error", text }]);
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

  const isEmpty = messages.length === 0;

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <div ref={scrollRef} className="flex-1 space-y-4 overflow-y-auto pb-4">
        {isEmpty && (
          <div className="rounded-2xl border border-dashed border-zinc-300 p-6 text-center dark:border-zinc-700">
            <Icon name="sparkles" className="mx-auto h-6 w-6 text-emerald-500" />
            <p className="mt-2 text-sm font-medium text-zinc-900 dark:text-zinc-50">
              Tanya apa saja soal perjalananmu
            </p>
            <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">
              Jawaban diambil dari knowledge base KelanaAI. Riwayat chat tidak disimpan —
              hilang saat kamu keluar atau menyegarkan halaman.
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
                <div className="max-w-[85%] whitespace-pre-wrap rounded-2xl rounded-br-sm bg-emerald-600 px-4 py-2.5 text-sm leading-6 text-white">
                  {message.text}
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
              <div className="max-w-[85%] rounded-2xl rounded-bl-sm border border-zinc-200 bg-white px-4 py-3 dark:border-zinc-800 dark:bg-zinc-900">
                <RichText text={message.text} />
                {message.sources.length > 0 && (
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
        className="sticky bottom-0 border-t border-zinc-100 bg-white pt-3 dark:border-zinc-800 dark:bg-zinc-950"
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
