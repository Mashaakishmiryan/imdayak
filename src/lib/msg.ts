import type { MessageKey } from "@/i18n/en";

/**
 * A translatable message produced by non-UI code (matching, validation…).
 * Logic returns keys + raw values; the UI turns them into text in the current
 * language, so changing language re-renders them correctly.
 */
export interface Msg {
  k: MessageKey;
  p?: Record<string, string | number>;
  /** params whose value is an id to translate with this key prefix, e.g. { care: "care." } */
  dyn?: Record<string, string>;
  /** params that are counts rendered with a plural key, e.g. { years: "unit.years" } */
  plural?: Record<string, "unit.years" | "unit.reviews" | "unit.bookings">;
  /** params that are lists of tag ids, joined in the current language */
  list?: Record<string, string>;
  /** numeric params shown with fixed decimals in the current locale (0.6 → "0,6" in hy/ru) */
  dec?: Record<string, number>;
}

interface Translator {
  t: (k: MessageKey, p?: Record<string, string | number>) => string;
  tp: (base: "unit.years" | "unit.reviews" | "unit.bookings", n: number) => string;
  td: (prefix: string, id: string) => string;
  num: (n: number, digits?: number) => string;
  list: (items: string[]) => string;
}

export function renderMsg(m: Msg, i: Translator): string {
  const p: Record<string, string | number> = { ...m.p };
  for (const [k, prefix] of Object.entries(m.dyn ?? {})) p[k] = i.td(prefix, String(p[k]));
  for (const [k, base] of Object.entries(m.plural ?? {})) p[k] = i.tp(base, Number(p[k]));
  for (const [k, prefix] of Object.entries(m.list ?? {})) {
    const ids = String(p[k]).split("|");
    p[k] = i.list(ids.map((id) => i.td(prefix, id)));
  }
  for (const [k, digits] of Object.entries(m.dec ?? {})) p[k] = i.num(Number(p[k]), digits);
  return i.t(m.k, p);
}
