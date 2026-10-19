import type { Booking, BookingType, NannyProfile } from "./types";

export const SERVICE_FEE = 0.1; // paid by family
export const COMMISSION = 0.1; // kept from nanny side
export const PENDING_HOLD_MS = 2 * 60 * 60 * 1000;
export const URGENT_HOLD_MS = 15 * 60 * 1000;
export const MIN_NOTICE_H: Record<BookingType, number> = { "1h": 3, "2h": 3, day: 12 };

export function nannyPrice(n: NannyProfile, t: BookingType): number {
  if (t === "1h") return n.pricePerHour;
  if (t === "2h") return n.pricePerHour * 2;
  return n.pricePerDay;
}

export function priceBreakdown(base: number) {
  const fee = Math.round(base * SERVICE_FEE);
  const commission = Math.round(base * COMMISSION);
  return { base, fee, total: base + fee, commission, payout: base - commission };
}

export function startTime(b: Pick<Booking, "date" | "startHour">): number {
  const [y, m, d] = b.date.split("-").map(Number);
  return new Date(y, m - 1, d, b.startHour).getTime();
}

/** Section 10 cancellation rules for a family cancel. Returns share refunded to family. */
export function familyRefundShare(b: Booking, now = Date.now()): number {
  if (b.status === "pending") return 1;
  const hoursBefore = (startTime(b) - now) / 3_600_000;
  if (hoursBefore > 24) return 1;
  if (hoursBefore >= 3) return 0.5;
  return 0;
}

export function toISODate(d: Date) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

/** Monday = 0 */
export function weekdayIndex(iso: string) {
  const [y, m, d] = iso.split("-").map(Number);
  return (new Date(y, m - 1, d).getDay() + 6) % 7;
}

export const hourLabel = (h: number) => `${String(h).padStart(2, "0")}:00`;
