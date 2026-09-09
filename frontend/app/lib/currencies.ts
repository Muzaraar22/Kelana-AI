// Fallback only — the source of truth is GET /api/v1/currencies (backend
// USD_EXCHANGE_RATES). Used if the /plan server fetch fails.
export const DEFAULT_CURRENCIES = [
  "IDR", "USD", "EUR", "GBP", "SGD", "MYR", "THB", "PHP", "VND",
  "JPY", "CNY", "KRW", "HKD", "INR", "AUD", "CAD", "CHF", "AED",
] as const;

// "USD — US Dollar". Falls back to the bare code on unsupported runtimes.
export function currencyLabel(code: string): string {
  try {
    const name = new Intl.DisplayNames(["id"], { type: "currency" }).of(code);
    return name && name !== code ? `${code} — ${name}` : code;
  } catch {
    return code;
  }
}
