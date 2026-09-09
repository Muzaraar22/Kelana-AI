// Shared money helpers. `formatMoney` was previously duplicated verbatim in
// TripCard.tsx and TripResult.tsx.
export function formatMoney(amount: number, currency: string): string {
  try {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency,
      maximumFractionDigits: 0,
    }).format(amount);
  } catch {
    return `${amount.toLocaleString("id-ID")} ${currency}`;
  }
}

// ---- budget-input helpers (raw digits <-> grouped display) ----
export function digitsOnly(value: string): string {
  return value.replace(/\D+/g, "");
}

export function groupThousands(digits: string): string {
  return digits ? Number(digits).toLocaleString("id-ID") : "";
}
