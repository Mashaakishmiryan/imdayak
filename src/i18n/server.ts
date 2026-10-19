import "server-only";
import { cookies, headers } from "next/headers";
import { DEFAULT_LANG, LANG_COOKIE, isLang, type Lang } from "./config";
import { en, type MessageKey } from "./en";
import { hy } from "./hy";
import { ru } from "./ru";

const DICTS = { en, hy, ru } as const;

/** Saved choice first, then the browser's preferred language, then English. */
export async function getLang(): Promise<Lang> {
  const saved = (await cookies()).get(LANG_COOKIE)?.value;
  if (isLang(saved)) return saved;
  const accept = ((await headers()).get("accept-language") ?? "").toLowerCase();
  return accept.split(",").map((p) => p.trim().slice(0, 2)).find(isLang) ?? DEFAULT_LANG;
}

/** Translator for server components and generateMetadata. */
export async function getServerT() {
  const lang = await getLang();
  const dict = DICTS[lang];
  return {
    lang,
    t: (k: MessageKey, p?: Record<string, string | number>) =>
      (dict[k] ?? en[k]).replace(/\{(\w+)\}/g, (m, name) => (p && name in p ? String(p[name]) : m)),
  };
}

/** Page <title> in the current language. */
export function titleFor(key: MessageKey) {
  return async () => ({ title: (await getServerT()).t(key) });
}
