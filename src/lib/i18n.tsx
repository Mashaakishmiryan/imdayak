"use client";

import { Fragment, createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import { en, type MessageKey } from "@/i18n/en";
import { hy } from "@/i18n/hy";
import { ru } from "@/i18n/ru";
import { LANG_COOKIE, type Lang } from "@/i18n/config";
import { makeFormatters } from "@/i18n/format";
import { renderMsg, type Msg } from "./msg";

export type { Lang } from "@/i18n/config";
export type { MessageKey } from "@/i18n/en";

export const LANGS: { id: Lang; label: string; name: string }[] = [
  { id: "hy", label: "Հայ", name: "Հայերեն" },
  { id: "ru", label: "Рус", name: "Русский" },
  { id: "en", label: "Eng", name: "English" },
];

const DICTS = { en, hy, ru } as const;

type Params = Record<string, string | number>;
/** Keys that have .one/.other plural variants, without the suffix */
type PluralBase = MessageKey extends infer K ? (K extends `${infer B}.other` ? B : never) : never;

function interpolate(s: string, p?: Params) {
  if (!p) return s;
  return s.replace(/\{(\w+)\}/g, (m, k) => (k in p ? String(p[k]) : m));
}

interface I18n {
  lang: Lang;
  locale: string;
  setLang: (l: Lang) => void;
  /** Translate a key, filling {placeholders}. */
  t: (k: MessageKey, p?: Params) => string;
  /** Plural-aware translate: picks key.one / key.few / key.many / key.other for `count`. {n} is the formatted count. */
  tp: (base: PluralBase, count: number, p?: Params) => string;
  /**
   * Translate with React nodes inside the sentence, e.g. t("x", {}, { time: <Countdown/> }).
   * Word order differs between languages, so components must be placed by the translation, not by concatenation.
   */
  tn: (k: MessageKey, p: Params, nodes: Record<string, ReactNode>) => ReactNode;
  /** Translate a dynamic key (e.g. "tag." + id) — falls back to the raw value if no key exists. */
  td: (prefix: string, id: string) => string;
  money: (amd: number) => string;
  num: (n: number, digits?: number) => string;
  date: (iso: string, opts?: Intl.DateTimeFormatOptions) => string;
  /** 24-hour clock time for a timestamp */
  time: (ms: number) => string;
  /** "a, b and c" in the current language */
  list: (items: string[]) => string;
}

const Ctx = createContext<I18n | null>(null);

export function LangProvider({ initialLang, children }: { initialLang: Lang; children: React.ReactNode }) {
  const [lang, setLangState] = useState<Lang>(initialLang);
  const router = useRouter();

  useEffect(() => {
    document.documentElement.lang = lang;
  }, [lang]);

  const setLang = useCallback((l: Lang) => {
    setLangState(l);
    // Cookie lets the server render the right language on the next request (no English flash).
    document.cookie = `${LANG_COOKIE}=${l}; path=/; max-age=31536000; samesite=lax`;
    // Re-render server components (page titles, Safety, Legal) in the new language without a full reload.
    router.refresh();
  }, [router]);

  const value = useMemo<I18n>(() => {
    const dict = DICTS[lang];
    const f = makeFormatters(lang);
    const locale = f.locale;
    const pr = new Intl.PluralRules(locale);
    const lookup = (k: string): string | undefined => {
      const v = (dict as Record<string, string>)[k] ?? (en as Record<string, string>)[k];
      if (v === undefined && process.env.NODE_ENV !== "production") console.warn(`[i18n] missing key "${k}" (${lang})`);
      return v;
    };
    const num = f.num;
    return {
      lang,
      locale,
      setLang,
      num,
      t: (k, p) => interpolate(lookup(k) ?? k, p),
      tn: (k, p, nodes) =>
        interpolate(lookup(k) ?? k, p)
          .split(/(\{\w+\})/)
          .map((part, i) => {
            const m = part.match(/^\{(\w+)\}$/);
            return <Fragment key={i}>{m && m[1] in nodes ? nodes[m[1]] : part}</Fragment>;
          }),
      tp: (base, count, p) => {
        const form = pr.select(count);
        const s = lookup(`${base}.${form}`) ?? lookup(`${base}.other`) ?? base;
        return interpolate(s, { n: num(count), ...p });
      },
      td: (prefix, id) => (dict as Record<string, string>)[prefix + id] ?? (en as Record<string, string>)[prefix + id] ?? id,
      // Dram sign after the number, with a no-break space so it never wraps onto its own line.
      money: (v) => `${num(Math.round(v))}\u00a0֏`,
      date: (iso, opts = { weekday: "short", day: "numeric", month: "short" }) => {
        const [y, m, d] = iso.split("-").map(Number);
        return f.date(new Date(y, m - 1, d), opts);
      },
      time: f.time,
      list: (items) => f.list(items, lookup("common.and") ?? "and"),
    };
  }, [lang, setLang]);

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useT() {
  const v = useContext(Ctx);
  if (!v) throw new Error("useT outside LangProvider");
  return v;
}

/** Render a structured message from logic code (match reasons, filter failures) in the current language. */
export function useMsg() {
  const i = useT();
  return (m: Msg) => renderMsg(m, i);
}
