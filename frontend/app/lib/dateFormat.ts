// shared date/time formatters for the assistant chat (message bubbles + sidebar)
export function formatMessageTime(iso: string): string {
  return new Date(iso).toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" });
}
